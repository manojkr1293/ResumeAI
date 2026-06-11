import { Router } from 'express';
import healthRouter from './health.routes';
import authRoutes from './auth.routes';
import resumeRoutes from './resume.routes';
import aiRoutes from './ai.routes';
import jdRoutes from './jd.routes';
import exportRoutes from './export.routes';
import templateRoutes from './template.routes';
import adminRoutes from './admin.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

// Mount System Health Diagnostics
router.use('/health', healthRouter);

// Authentication routes
router.use('/auth', authRoutes);

// Resume routes
router.use('/resumes', resumeRoutes);

// AI routes
router.use('/ai', aiRoutes);

// Job Description routes
router.use('/jd', jdRoutes);

// Export routes
router.use('/export', exportRoutes);

// Template routes
router.use('/templates', templateRoutes);

// Analytics routes
router.use('/analytics', analyticsRoutes);

// Admin routes
router.use('/admin', adminRoutes);

/**
 * Future Platform Routes Mount Points:
 * 
 * router.use('/users', userRouter);      // User profile management, tier adjustments, feature flags
 */

export default router;
