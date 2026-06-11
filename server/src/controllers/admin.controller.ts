import { Request, Response, NextFunction } from 'express';
import repositories from '../repositories';
import { NotFoundError, ValidationError } from '../errors/index';
import { sendSuccess } from '../utils/response';

const dayMs = 24 * 60 * 60 * 1000;

function startDateForRange(range = '30d') {
  const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
  return new Date(Date.now() - days * dayMs);
}

function getSectionContent(resume: any, sectionType: string) {
  const section = Array.isArray(resume.sections)
    ? resume.sections.find((item: any) => item.sectionType === sectionType)
    : null;
  return section?.content || {};
}

function getMetadata(event: any) {
  return (event?.metadata || {}) as Record<string, any>;
}

function getSourceFromEvent(event: any) {
  const metadata = getMetadata(event);
  const source = metadata.utm_source || metadata.source;
  if (source) return String(source);
  if (metadata.referral) return `ref:${metadata.referral}`;
  const referrer = event?.referrer || metadata.firstReferrer;
  if (!referrer) return 'direct';
  try {
    return new URL(String(referrer)).hostname.replace(/^www\./, '');
  } catch {
    return 'referral';
  }
}

function getCampaignFromEvent(event: any) {
  const metadata = getMetadata(event);
  return String(metadata.utm_campaign || metadata.campaign || 'uncategorized');
}

function getLeadStage(resumeCount: number, aiUsageCount: number, downloadCount: number) {
  if (downloadCount > 0) return 'downloaded';
  if (aiUsageCount > 0) return 'used_ai';
  if (resumeCount > 0) return 'created_resume';
  return 'registered';
}

export class AdminController {
  overview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const prisma = repositories.getPrisma();
      const range = String(req.query.range || '30d');
      const since = startDateForRange(range);
      const today = new Date(Date.now() - dayMs);

      const [
        totalUsers,
        usersInRange,
        usersToday,
        totalResumes,
        resumesInRange,
        resumesToday,
        activeResumes,
        archivedResumes,
        avgScores,
        totalAiEvents,
        aiEventsInRange,
        atsAnalyses,
        downloads,
        shares,
        apiErrors,
        visitors,
        pageViews,
        signups,
        logins,
        recentUsers,
        recentResumes,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { createdAt: { gte: since } } }),
        prisma.user.count({ where: { createdAt: { gte: today } } }),
        prisma.resume.count(),
        prisma.resume.count({ where: { createdAt: { gte: since } } }),
        prisma.resume.count({ where: { createdAt: { gte: today } } }),
        prisma.resume.count({ where: { status: { not: 'ARCHIVED' } } }),
        prisma.resume.count({ where: { status: 'ARCHIVED' } }),
        prisma.resume.aggregate({ _avg: { atsScore: true, overallScore: true } }),
        prisma.aIFeedback.count(),
        prisma.aIFeedback.count({ where: { createdAt: { gte: since } } }),
        prisma.aIFeedback.count({ where: { moduleName: 'ATS_ANALYZER' as any } }),
        prisma.analyticsEvent.count({ where: { eventType: 'resume_download', createdAt: { gte: since } } }),
        prisma.analyticsEvent.count({ where: { eventType: 'resume_share', createdAt: { gte: since } } }),
        prisma.analyticsEvent.count({ where: { eventType: 'api_error', createdAt: { gte: since } } }),
        prisma.analyticsEvent.groupBy({ by: ['sessionId'], where: { eventType: 'page_view', createdAt: { gte: since } } }),
        prisma.analyticsEvent.count({ where: { eventType: 'page_view', createdAt: { gte: since } } }),
        prisma.analyticsEvent.count({ where: { eventType: 'signup', createdAt: { gte: since } } }),
        prisma.analyticsEvent.count({ where: { eventType: 'login', createdAt: { gte: since } } }),
        prisma.user.findMany({
          orderBy: { createdAt: 'desc' },
          take: 8,
          select: { id: true, email: true, fullName: true, targetRole: true, createdAt: true, oauthProvider: true },
        }),
        prisma.resume.findMany({
          orderBy: { updatedAt: 'desc' },
          take: 8,
          include: { user: { select: { fullName: true, email: true } } },
        }),
      ]);

      const signupConversion = visitors.length > 0 ? Math.round((usersInRange / visitors.length) * 100) : 0;

      sendSuccess(res, {
        range,
        overview: {
          totalUsers,
          usersInRange,
          usersToday,
          totalResumes,
          resumesInRange,
          resumesToday,
          activeResumes,
          archivedResumes,
          avgAtsScore: Math.round(avgScores._avg.atsScore || 0),
          avgOverallScore: Math.round(avgScores._avg.overallScore || 0),
          totalAiEvents,
          aiEventsInRange,
          atsAnalyses,
          downloads,
          shares,
          apiErrors,
          visitors: visitors.length,
          pageViews,
          signupConversion,
          signups,
          logins,
        },
        recentUsers,
        recentResumes,
      });
    } catch (error) {
      next(error);
    }
  };

  users = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const prisma = repositories.getPrisma();
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: {
          _count: { select: { resumes: true, aiFeedbacks: true, exports: true } },
        },
      });

      sendSuccess(res, {
        users: users.map((user) => ({
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          targetRole: user.targetRole,
          loginMethod: user.oauthProvider || 'EMAIL',
          experienceLevel: user.experienceLevel,
          createdAt: user.createdAt,
          resumeCount: user._count.resumes,
          aiUsageCount: user._count.aiFeedbacks,
          exportCount: user._count.exports,
        })),
      });
    } catch (error) {
      next(error);
    }
  };

  resumes = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const prisma = repositories.getPrisma();
      const resumes = await prisma.resume.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 100,
        include: {
          sections: true,
          user: { select: { fullName: true, email: true } },
        },
      });

      const roleCounts = new Map<string, number>();
      const sectionGaps = {
        withoutSummary: 0,
        withoutExperience: 0,
        withoutSkills: 0,
        withoutMetricProof: 0,
      };

      resumes.forEach((resume) => {
        const title = (resume.title || 'Untitled').replace(/resume$/i, '').trim() || 'General';
        roleCounts.set(title, (roleCounts.get(title) || 0) + 1);
        const summary = getSectionContent(resume, 'SUMMARY')?.text || '';
        const experience = getSectionContent(resume, 'EXPERIENCE')?.items || [];
        const skills = getSectionContent(resume, 'SKILLS')?.items || [];
        const hasMetrics = Array.isArray(experience) && experience.some((item: any) =>
          Array.isArray(item.bullets) && item.bullets.some((bullet: string) => /\d|%|increased|reduced|improved|saved/i.test(bullet))
        );
        if (!summary.trim()) sectionGaps.withoutSummary += 1;
        if (!Array.isArray(experience) || experience.length === 0) sectionGaps.withoutExperience += 1;
        if (!Array.isArray(skills) || skills.length === 0) sectionGaps.withoutSkills += 1;
        if (!hasMetrics) sectionGaps.withoutMetricProof += 1;
      });

      sendSuccess(res, {
        resumes: resumes.map((resume) => ({
          id: resume.id,
          title: resume.title,
          status: resume.status,
          atsScore: resume.atsScore,
          overallScore: resume.overallScore,
          isPrimary: resume.isPrimary,
          owner: resume.user,
          createdAt: resume.createdAt,
          updatedAt: resume.updatedAt,
        })),
        sectionGaps,
        topRoles: Array.from(roleCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([role, count]) => ({ role, count })),
      });
    } catch (error) {
      next(error);
    }
  };

  ai = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const prisma = repositories.getPrisma();
      const byModule = await prisma.aIFeedback.groupBy({
        by: ['moduleName'],
        _count: { _all: true },
        _sum: { tokenUsage: true },
      });
      const recent = await prisma.aIFeedback.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { user: { select: { fullName: true, email: true } }, resume: { select: { title: true } } },
      });

      sendSuccess(res, {
        byModule: byModule.map((item) => ({
          moduleName: item.moduleName,
          count: item._count._all,
          tokenUsage: item._sum.tokenUsage || 0,
        })),
        recent,
      });
    } catch (error) {
      next(error);
    }
  };

  funnel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const prisma = repositories.getPrisma();
      const range = String(req.query.range || '30d');
      const since = startDateForRange(range);
      const visitorGroups = await prisma.analyticsEvent.groupBy({
        by: ['sessionId'],
        where: { eventType: 'page_view', createdAt: { gte: since } },
      });
      const [
        registered,
        firstResumeUsers,
        atsUsers,
        downloadUsers,
        shareUsers,
      ] = await Promise.all([
        prisma.user.count({ where: { createdAt: { gte: since } } }),
        prisma.resume.groupBy({ by: ['userId'], where: { createdAt: { gte: since } } }),
        prisma.aIFeedback.groupBy({ by: ['userId'], where: { moduleName: 'ATS_ANALYZER' as any, createdAt: { gte: since } } }),
        prisma.analyticsEvent.groupBy({ by: ['userId'], where: { eventType: 'resume_download', createdAt: { gte: since }, userId: { not: null } } }),
        prisma.analyticsEvent.groupBy({ by: ['userId'], where: { eventType: 'resume_share', createdAt: { gte: since }, userId: { not: null } } }),
      ]);

      sendSuccess(res, {
        funnel: [
          { label: 'Visitor', value: visitorGroups.length },
          { label: 'Registered', value: registered },
          { label: 'Created resume', value: firstResumeUsers.length },
          { label: 'Ran ATS', value: atsUsers.length },
          { label: 'Downloaded', value: downloadUsers.length },
          { label: 'Shared', value: shareUsers.length },
        ],
      });
    } catch (error) {
      next(error);
    }
  };

  activity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const prisma = repositories.getPrisma();
      const range = String(req.query.range || '30d');
      const since = startDateForRange(range);

      const events = await prisma.analyticsEvent.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: {
          user: { select: { id: true, fullName: true, email: true } },
        },
      });

      sendSuccess(res, { events });
    } catch (error) {
      next(error);
    }
  };

  errors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const prisma = repositories.getPrisma();
      const range = String(req.query.range || '30d');
      const since = startDateForRange(range);

      const events = await prisma.analyticsEvent.findMany({
        where: { eventType: 'api_error', createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: {
          user: { select: { id: true, fullName: true, email: true } },
        },
      });

      const byPath = new Map<string, { path: string; count: number; lastSeen: Date }>();
      const byCode = new Map<string, { code: string; count: number }>();

      events.forEach((event) => {
        const metadata = (event.metadata || {}) as any;
        const path = event.path || metadata.path || 'Unknown path';
        const code = String(metadata.code || metadata.statusCode || 'unknown');
        const pathItem = byPath.get(path);

        byPath.set(path, {
          path,
          count: (pathItem?.count || 0) + 1,
          lastSeen: pathItem?.lastSeen && pathItem.lastSeen > event.createdAt ? pathItem.lastSeen : event.createdAt,
        });

        byCode.set(code, {
          code,
          count: (byCode.get(code)?.count || 0) + 1,
        });
      });

      sendSuccess(res, {
        total: events.length,
        byPath: Array.from(byPath.values()).sort((a, b) => b.count - a.count),
        byCode: Array.from(byCode.values()).sort((a, b) => b.count - a.count),
        recent: events,
      });
    } catch (error) {
      next(error);
    }
  };

  userDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const prisma = repositories.getPrisma();
      const { id } = req.params;

      if (!id) {
        throw new ValidationError('User ID is required');
      }

      const [user, resumes, aiFeedbacks, events, exportsCount] = await Promise.all([
        prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            email: true,
            fullName: true,
            targetRole: true,
            experienceLevel: true,
            oauthProvider: true,
            isActive: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
            _count: { select: { resumes: true, aiFeedbacks: true, exports: true, analyticsEvents: true } },
          },
        }),
        prisma.resume.findMany({
          where: { userId: id },
          orderBy: { updatedAt: 'desc' },
          take: 20,
          select: {
            id: true,
            title: true,
            status: true,
            atsScore: true,
            overallScore: true,
            isPrimary: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.aIFeedback.findMany({
          where: { userId: id },
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            moduleName: true,
            tokenUsage: true,
            helpfulnessRating: true,
            createdAt: true,
            resume: { select: { title: true } },
          },
        }),
        prisma.analyticsEvent.findMany({
          where: { userId: id },
          orderBy: { createdAt: 'desc' },
          take: 30,
        }),
        prisma.export.count({ where: { userId: id } }),
      ]);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      sendSuccess(res, { user, resumes, aiFeedbacks, events, exportsCount });
    } catch (error) {
      next(error);
    }
  };

  marketing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const prisma = repositories.getPrisma();
      const range = String(req.query.range || '30d');
      const since = startDateForRange(range);
      const sevenDaysAgo = new Date(Date.now() - 7 * dayMs);

      const [
        events,
        users,
        resumes,
        highAtsResumes,
        aiSuggestions,
        downloads,
        shares,
      ] = await Promise.all([
        prisma.analyticsEvent.findMany({
          where: { createdAt: { gte: since } },
          orderBy: { createdAt: 'desc' },
          take: 1000,
          include: { user: { select: { id: true, email: true, fullName: true, targetRole: true } } },
        }),
        prisma.user.findMany({
          orderBy: { createdAt: 'desc' },
          take: 250,
          include: {
            _count: { select: { resumes: true, aiFeedbacks: true, exports: true, analyticsEvents: true } },
          },
        }),
        prisma.resume.findMany({
          orderBy: { updatedAt: 'desc' },
          take: 250,
          include: { user: { select: { id: true, email: true, fullName: true, targetRole: true } } },
        }),
        prisma.resume.count({ where: { atsScore: { gte: 80 }, updatedAt: { gte: since } } }),
        prisma.aIFeedback.count({ where: { createdAt: { gte: since } } }),
        prisma.analyticsEvent.count({ where: { eventType: 'resume_download', createdAt: { gte: since } } }),
        prisma.analyticsEvent.count({ where: { eventType: 'resume_share', createdAt: { gte: since } } }),
      ]);

      const sourceMap = new Map<string, { source: string; visitors: Set<string>; signups: number; logins: number }>();
      const campaignMap = new Map<string, { campaign: string; source: string; visitors: Set<string>; signups: number; downloads: number; shares: number }>();
      const signupByUser = new Map<string, any>();
      const lastActivityByUser = new Map<string, Date>();
      const eventDaysByUser = new Map<string, Set<string>>();
      const downloadsByUser = new Map<string, number>();
      const sharesByUser = new Map<string, number>();

      events.forEach((event) => {
        const source = getSourceFromEvent(event);
        const campaign = getCampaignFromEvent(event);
        const sourceItem = sourceMap.get(source) || { source, visitors: new Set<string>(), signups: 0, logins: 0 };
        const campaignKey = `${source}:${campaign}`;
        const campaignItem = campaignMap.get(campaignKey) || { campaign, source, visitors: new Set<string>(), signups: 0, downloads: 0, shares: 0 };

        if (event.eventType === 'page_view') {
          sourceItem.visitors.add(event.sessionId);
          campaignItem.visitors.add(event.sessionId);
        }
        if (event.eventType === 'signup') {
          sourceItem.signups += 1;
          campaignItem.signups += 1;
          if (event.userId) signupByUser.set(event.userId, event);
        }
        if (event.eventType === 'login') {
          sourceItem.logins += 1;
        }
        if (event.eventType === 'resume_download') {
          campaignItem.downloads += 1;
          if (event.userId) downloadsByUser.set(event.userId, (downloadsByUser.get(event.userId) || 0) + 1);
        }
        if (event.eventType === 'resume_share') {
          campaignItem.shares += 1;
          if (event.userId) sharesByUser.set(event.userId, (sharesByUser.get(event.userId) || 0) + 1);
        }
        if (event.userId) {
          const previous = lastActivityByUser.get(event.userId);
          if (!previous || previous < event.createdAt) lastActivityByUser.set(event.userId, event.createdAt);
          const days = eventDaysByUser.get(event.userId) || new Set<string>();
          days.add(event.createdAt.toISOString().slice(0, 10));
          eventDaysByUser.set(event.userId, days);
        }

        sourceMap.set(source, sourceItem);
        campaignMap.set(campaignKey, campaignItem);
      });

      const resumeCountByUser = new Map<string, number>();
      const lowScoreByUser = new Map<string, number>();
      const roleMap = new Map<string, { role: string; count: number; downloads: number }>();

      resumes.forEach((resume) => {
        resumeCountByUser.set(resume.userId, (resumeCountByUser.get(resume.userId) || 0) + 1);
        if ((resume.atsScore || 0) < 70) {
          lowScoreByUser.set(resume.userId, (lowScoreByUser.get(resume.userId) || 0) + 1);
        }
        const role = resume.user?.targetRole || (resume.title || 'General').replace(/resume$/i, '').trim() || 'General';
        const roleItem = roleMap.get(role) || { role, count: 0, downloads: 0 };
        roleItem.count += 1;
        roleItem.downloads += downloadsByUser.get(resume.userId) || 0;
        roleMap.set(role, roleItem);
      });

      const acquisition = Array.from(sourceMap.values())
        .map((item) => ({
          source: item.source,
          visitors: item.visitors.size,
          signups: item.signups,
          logins: item.logins,
          conversionRate: item.visitors.size ? Math.round((item.signups / item.visitors.size) * 100) : 0,
        }))
        .sort((a, b) => b.visitors - a.visitors);

      const campaigns = Array.from(campaignMap.values())
        .map((item) => ({
          campaign: item.campaign,
          source: item.source,
          visitors: item.visitors.size,
          signups: item.signups,
          downloads: item.downloads,
          shares: item.shares,
          conversionRate: item.visitors.size ? Math.round((item.signups / item.visitors.size) * 100) : 0,
        }))
        .sort((a, b) => b.signups - a.signups || b.visitors - a.visitors)
        .slice(0, 25);

      const leadExport = users.map((user) => {
        const signupEvent = signupByUser.get(user.id);
        const resumeCount = resumeCountByUser.get(user.id) || user._count.resumes;
        const downloadCount = downloadsByUser.get(user.id) || 0;
        const shareCount = sharesByUser.get(user.id) || 0;
        const aiUsageCount = user._count.aiFeedbacks;
        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          targetRole: user.targetRole,
          source: signupEvent ? getSourceFromEvent(signupEvent) : 'unknown',
          campaign: signupEvent ? getCampaignFromEvent(signupEvent) : 'unknown',
          stage: getLeadStage(resumeCount, aiUsageCount, downloadCount),
          resumeCount,
          aiUsageCount,
          downloadCount,
          shareCount,
          lastActivity: lastActivityByUser.get(user.id) || user.updatedAt,
          joinedAt: user.createdAt,
        };
      });

      const highIntentLeads = leadExport
        .filter((lead) =>
          (lead.resumeCount > 0 && lead.downloadCount === 0) ||
          lead.aiUsageCount > 0 ||
          (lowScoreByUser.get(lead.id) || 0) > 0 ||
          (eventDaysByUser.get(lead.id)?.size || 0) > 1
        )
        .sort((a, b) => {
          const scoreA = a.aiUsageCount * 3 + a.resumeCount * 2 + (a.downloadCount === 0 ? 2 : 0) + ((lowScoreByUser.get(a.id) || 0) > 0 ? 3 : 0);
          const scoreB = b.aiUsageCount * 3 + b.resumeCount * 2 + (b.downloadCount === 0 ? 2 : 0) + ((lowScoreByUser.get(b.id) || 0) > 0 ? 3 : 0);
          return scoreB - scoreA;
        })
        .slice(0, 50)
        .map((lead) => ({
          ...lead,
          reason: lead.downloadCount === 0 && lead.resumeCount > 0
            ? 'Created resume but not downloaded'
            : (lowScoreByUser.get(lead.id) || 0) > 0
              ? 'Low ATS score opportunity'
              : lead.aiUsageCount > 0
                ? 'Used AI features'
                : 'Returned multiple days',
        }));

      const activeUsers = new Set(events.filter((event) => event.userId).map((event) => event.userId as string));
      const returningUsers = Array.from(eventDaysByUser.values()).filter((days) => days.size > 1).length;
      const recentUsers = users.filter((user) => user.createdAt >= since).length;
      const recentlyActiveUsers = users.filter((user) => (lastActivityByUser.get(user.id) || user.updatedAt) >= sevenDaysAgo).length;

      sendSuccess(res, {
        range,
        acquisition,
        campaigns,
        highIntentLeads,
        leadExport,
        roleInsights: Array.from(roleMap.values()).sort((a, b) => b.count - a.count).slice(0, 15),
        retention: {
          registeredInRange: recentUsers,
          activeUsers: activeUsers.size,
          returningUsers,
          sevenDayActiveUsers: recentlyActiveUsers,
          returnRate: activeUsers.size ? Math.round((returningUsers / activeUsers.size) * 100) : 0,
        },
        successSignals: {
          highAtsResumes,
          downloads,
          shares,
          aiSuggestions,
          totalLeads: leadExport.length,
          highIntentLeads: highIntentLeads.length,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new AdminController();
