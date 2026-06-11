import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../repositories/user.repository';
import { comparePassword } from '../utils/password';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import { ValidationError, AuthenticationError, ConflictError } from '../errors/index';
import { sendSuccess, sendCreated } from '../utils/response';
import repositories from '../repositories';
import env from '../config/env';
import jwt from 'jsonwebtoken';

type PasswordResetPayload = {
  userId: string;
  email: string;
  purpose: 'password-reset';
};

type GoogleTokenResponse = {
  access_token?: string;
  id_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

type GoogleUserInfo = {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
};

/**
 * Authentication Controller
 * Handles user registration, login, token refresh, and logout
 */
export class AuthController {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = repositories.user;
  }

  private logEventSafely = async (
    req: Request,
    data: { userId?: string | null; eventType: string; metadata?: Record<string, unknown> }
  ): Promise<void> => {
    try {
      await repositories.getPrisma().analyticsEvent.create({
        data: {
          userId: data.userId || null,
          sessionId: req.get('x-session-id') || `server-${Date.now()}`,
          eventType: data.eventType,
          metadata: (data.metadata || {}) as any,
          path: req.originalUrl,
          ipAddress: req.ip,
          userAgent: req.get('user-agent') || null,
        },
      });
    } catch {
      // Analytics should never block auth.
    }
  };

  /**
   * Register a new user
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, fullName, experienceLevel, preferredLang, marketing } = req.body;

      // Validate required fields
      if (!email || !password || !fullName) {
        throw new ValidationError('Email, password, and full name are required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new ValidationError('Invalid email format');
      }

      // Validate password strength
      if (password.length < 8) {
        throw new ValidationError('Password must be at least 8 characters long');
      }

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // Create user with hashed password
      const user = await this.userRepository.createWithPassword({
        email,
        password,
        fullName,
        experienceLevel,
        preferredLang,
      });

      // Generate tokens
      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
        subscriptionTier: 'FREE',
      });

      await this.logEventSafely(req, {
        userId: user.id,
        eventType: 'signup',
        metadata: { method: 'EMAIL', ...((marketing || {}) as Record<string, unknown>) },
      });

      sendCreated(res, {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          experienceLevel: user.experienceLevel,
          preferredLang: user.preferredLang,
          avatarUrl: user.avatarUrl,
          targetRole: user.targetRole,
        },
        tokens,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Login user
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, marketing } = req.body;

      // Validate required fields
      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      // Find user by email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new AuthenticationError('Account has been deactivated');
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Generate tokens
      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
        subscriptionTier: 'FREE',
      });

      await this.logEventSafely(req, {
        userId: user.id,
        eventType: 'login',
        metadata: { method: 'EMAIL', ...((marketing || {}) as Record<string, unknown>) },
      });

      sendSuccess(res, {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          experienceLevel: user.experienceLevel,
          preferredLang: user.preferredLang,
          avatarUrl: user.avatarUrl,
          targetRole: user.targetRole,
        },
        tokens,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Start Google OAuth flow
   */
  googleLogin = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!env.FEATURE_GOOGLE_AUTH_ENABLED || !env.GOOGLE_CLIENT_ID) {
        throw new ValidationError('Google login is not configured');
      }

      const serverHost = env.SERVER_HOST === '0.0.0.0' ? 'localhost' : env.SERVER_HOST;
      const callbackUrl = env.GOOGLE_CALLBACK_URL || `http://${serverHost}:${env.SERVER_PORT}${env.API_PREFIX}/auth/google/callback`;
      const params = new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        redirect_uri: callbackUrl,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'select_account',
        state: String((_req.query.mode || '') === 'admin' ? 'admin' : 'user'),
      });

      res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle Google OAuth callback
   */
  googleCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code, error, state } = req.query;
      const isAdminMode = state === 'admin';
      const clientCallback = '/auth/oauth-callback';
      const clientBaseParams = isAdminMode ? new URLSearchParams({ mode: 'admin' }) : new URLSearchParams();

      if (error) {
        clientBaseParams.set('error', String(error));
        res.redirect(`${env.CORS_ORIGIN}${clientCallback}?${clientBaseParams.toString()}`);
        return;
      }

      if (!code || typeof code !== 'string') {
        throw new ValidationError('Google authorization code is required');
      }

      if (!env.FEATURE_GOOGLE_AUTH_ENABLED || !env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
        throw new ValidationError('Google login is not configured');
      }

      const serverHost = env.SERVER_HOST === '0.0.0.0' ? 'localhost' : env.SERVER_HOST;
      const callbackUrl = env.GOOGLE_CALLBACK_URL || `http://${serverHost}:${env.SERVER_PORT}${env.API_PREFIX}/auth/google/callback`;
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          redirect_uri: callbackUrl,
          grant_type: 'authorization_code',
        }),
      });
      const tokenData = await tokenResponse.json() as GoogleTokenResponse;

      if (!tokenResponse.ok || !tokenData.access_token) {
        throw new AuthenticationError(tokenData.error_description || 'Google login failed');
      }

      const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const googleUser = await profileResponse.json() as GoogleUserInfo;

      if (!profileResponse.ok || !googleUser.sub || !googleUser.email) {
        throw new AuthenticationError('Could not read Google account details');
      }

      let user = await this.userRepository.findByOAuth('GOOGLE', googleUser.sub);

      if (!user) {
        const existingUser = await this.userRepository.findByEmail(googleUser.email);
        if (existingUser) {
          user = await this.userRepository.update(existingUser.id, {
            oauthProvider: 'GOOGLE' as any,
            oauthUid: googleUser.sub,
            avatarUrl: googleUser.picture || existingUser.avatarUrl,
            emailVerified: googleUser.email_verified ?? existingUser.emailVerified,
          } as any);
        } else {
          user = await this.userRepository.createWithOAuth({
            email: googleUser.email,
            fullName: googleUser.name || googleUser.email.split('@')[0] || 'Google User',
            provider: 'GOOGLE',
            uid: googleUser.sub,
            avatarUrl: googleUser.picture,
          });
        }
      }

      if (!user.isActive) {
        throw new AuthenticationError('Account has been deactivated');
      }

      if (isAdminMode) {
        const adminEmails = env.ADMIN_EMAILS
          .split(',')
          .map((item) => item.trim().toLowerCase())
          .filter(Boolean);
        if (!adminEmails.includes(user.email.toLowerCase())) {
          res.redirect(`${env.CORS_ORIGIN}/auth/oauth-callback?mode=admin&error=${encodeURIComponent('Admin access required')}`);
          return;
        }
      }

      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
        subscriptionTier: 'FREE',
      });
      await this.logEventSafely(req, {
        userId: user.id,
        eventType: 'login',
        metadata: { method: 'GOOGLE' },
      });
      const clientUser = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        experienceLevel: user.experienceLevel,
        preferredLang: user.preferredLang,
        avatarUrl: user.avatarUrl,
        targetRole: user.targetRole,
      };

      const params = new URLSearchParams({
        ...(isAdminMode ? { mode: 'admin' } : {}),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: String(tokens.expiresIn),
        user: Buffer.from(JSON.stringify(clientUser), 'utf8').toString('base64url'),
      });

      res.redirect(`${env.CORS_ORIGIN}${clientCallback}?${params.toString()}`);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Request password reset
   */
  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        throw new ValidationError('Email is required');
      }

      const user = await this.userRepository.findByEmail(email);
      let resetLink: string | undefined;

      if (user && user.isActive) {
        const resetToken = jwt.sign(
          {
            userId: user.id,
            email: user.email,
            purpose: 'password-reset',
          },
          env.JWT_ACCESS_SECRET,
          {
            expiresIn: '20m',
            issuer: env.JWT_ISSUER,
          }
        );
        resetLink = `${env.CORS_ORIGIN}/auth/reset-password?token=${encodeURIComponent(resetToken)}`;
      }

      sendSuccess(res, {
        message: 'If an account exists for this email, a password reset link has been prepared.',
        ...(env.NODE_ENV !== 'production' && resetLink ? { resetLink } : {}),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reset password using a short-lived token
   */
  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        throw new ValidationError('Reset token and new password are required');
      }

      if (newPassword.length < 8) {
        throw new ValidationError('New password must be at least 8 characters long');
      }

      let payload: PasswordResetPayload;
      try {
        payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
          issuer: env.JWT_ISSUER,
        }) as PasswordResetPayload;
      } catch {
        throw new AuthenticationError('Reset link is invalid or expired');
      }

      if (payload.purpose !== 'password-reset') {
        throw new AuthenticationError('Invalid reset token');
      }

      const user = await this.userRepository.findById(payload.userId);
      if (!user || !user.isActive || user.email !== payload.email) {
        throw new AuthenticationError('Reset link is invalid or expired');
      }

      await this.userRepository.updatePassword(user.id, newPassword);

      sendSuccess(res, { message: 'Password reset successfully. You can sign in with your new password.' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Refresh access token
   */
  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new ValidationError('Refresh token is required');
      }

      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded) {
        throw new AuthenticationError('Invalid or expired refresh token');
      }

      // Find user
      const user = await this.userRepository.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new AuthenticationError('User not found or account deactivated');
      }

      // Generate new tokens
      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
        subscriptionTier: 'FREE',
      });

      sendSuccess(res, { tokens });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Logout user (client-side token invalidation)
   */
  logout = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // In a stateless JWT system, logout is handled client-side by removing tokens
      // For additional security, we could implement a token blacklist in Redis
      sendSuccess(res, { message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get current user profile
   */
  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        throw new AuthenticationError('User not authenticated');
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new AuthenticationError('User not found');
      }

      // Get subscription separately
      const subscription = await repositories.getPrisma().subscription.findUnique({
        where: { userId },
      });

      sendSuccess(res, {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          experienceLevel: user.experienceLevel,
          preferredLang: user.preferredLang,
          avatarUrl: user.avatarUrl,
          targetRole: user.targetRole,
          subscription: subscription ? {
            plan: subscription.plan,
            status: subscription.status,
          } : null,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user profile
   */
  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { fullName, targetRole, experienceLevel, preferredLang } = req.body;

      if (!userId) {
        throw new AuthenticationError('User not authenticated');
      }

      const updateData: any = {};
      if (fullName) updateData.fullName = fullName;
      if (targetRole !== undefined) updateData.targetRole = targetRole;
      if (experienceLevel) updateData.experienceLevel = experienceLevel;
      if (preferredLang) updateData.preferredLang = preferredLang;

      const user = await this.userRepository.update(userId, updateData);

      sendSuccess(res, {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          experienceLevel: user.experienceLevel,
          preferredLang: user.preferredLang,
          avatarUrl: user.avatarUrl,
          targetRole: user.targetRole,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Change password
   */
  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        throw new AuthenticationError('User not authenticated');
      }

      if (!currentPassword || !newPassword) {
        throw new ValidationError('Current password and new password are required');
      }

      if (newPassword.length < 8) {
        throw new ValidationError('New password must be at least 8 characters long');
      }

      // Get user
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new AuthenticationError('User not found');
      }

      // Verify current password
      const isPasswordValid = await comparePassword(currentPassword, user.passwordHash);
      if (!isPasswordValid) {
        throw new AuthenticationError('Current password is incorrect');
      }

      // Update password
      await this.userRepository.updatePassword(userId, newPassword);

      sendSuccess(res, { message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export default new AuthController();
