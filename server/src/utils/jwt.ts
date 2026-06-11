import jwt from 'jsonwebtoken';
import type { JWTPayload, AuthTokens } from '@resume-ai/shared';
import env from '@config/env';
import { AuthenticationError } from '@errors/index';

/**
 * Generates a short-lived access JWT.
 */
export const generateAccessToken = (payload: JWTPayload): string => {
  const cleanPayload = {
    userId: payload.userId,
    email: payload.email,
    subscriptionTier: payload.subscriptionTier,
  };
  return jwt.sign(cleanPayload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY as any,
    issuer: env.JWT_ISSUER,
  });
};

/**
 * Generates a long-lived refresh JWT.
 */
export const generateRefreshToken = (payload: JWTPayload): string => {
  const cleanPayload = {
    userId: payload.userId,
    email: payload.email,
    subscriptionTier: payload.subscriptionTier,
  };
  return jwt.sign(cleanPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY as any,
    issuer: env.JWT_ISSUER,
  });
};

/**
 * Generates a standard accessToken, refreshToken pair.
 */
export const generateTokenPair = (payload: JWTPayload): AuthTokens => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  // Attempt to parse access token duration into seconds
  let expiresIn = 900; // 15 minutes fallback
  const match = env.JWT_ACCESS_EXPIRY.match(/^(\d+)([smhd])$/);
  if (match && match[1] && match[2]) {
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 's': expiresIn = value; break;
      case 'm': expiresIn = value * 60; break;
      case 'h': expiresIn = value * 3600; break;
      case 'd': expiresIn = value * 86400; break;
    }
  }

  return {
    accessToken,
    refreshToken,
    expiresIn,
  };
};

/**
 * Verifies and decodes an access token.
 */
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      issuer: env.JWT_ISSUER,
    });
    return decoded as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Access token expired');
    }
    console.error('JWT Verification Error:', error);
    throw new AuthenticationError('Invalid access token');
  }
};

/**
 * Verifies and decodes a refresh token.
 */
export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET, {
      issuer: env.JWT_ISSUER,
    });
    return decoded as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Refresh token expired');
    }
    throw new AuthenticationError('Invalid refresh token');
  }
};
