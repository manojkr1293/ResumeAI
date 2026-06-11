export const APP_NAME = 'ResumeAI';
export const APP_DESCRIPTION = 'AI-powered ATS-optimized Resume Builder Platform';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  EDITOR: (resumeId: string) => `/editor/${resumeId}`,
  ANALYZER: '/analyzer',
  PRICING: '/pricing',
  PROFILE: '/profile',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ME: '/auth/me',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    GOOGLE: '/auth/google',
    GOOGLE_CALLBACK: '/auth/google/callback',
  },
  USERS: {
    ME: '/users/me',
    UPDATE: '/users/me',
  },
  RESUMES: {
    BASE: '/resumes',
    BY_ID: (id: string) => `/resumes/${id}`,
    PUBLIC: (id: string) => `/resumes/public/${id}`,
    DUPLICATE: (id: string) => `/resumes/${id}/duplicate`,
    PRIMARY: (id: string) => `/resumes/${id}/primary`,
    SECTIONS: (resumeId: string) => `/resumes/${resumeId}/sections`,
    SECTION_BY_ID: (resumeId: string, sectionId: string) => `/resumes/${resumeId}/sections/${sectionId}`,
    REORDER: (resumeId: string) => `/resumes/${resumeId}/sections/reorder`,
    VERSIONS: (resumeId: string) => `/resumes/${resumeId}/versions`,
  },
  AI: {
    IMPROVE_BULLET: '/ai/improve-bullets',
    ANALYZE_ATS: '/ai/analyze-ats',
    MATCH_JD: '/ai/match-jd',
    COACH: '/ai/coach',
    ROAST: '/ai/roast',
    GENERATE_SUMMARY: '/ai/generate-summary',
  },
  TEMPLATES: {
    BASE: '/templates',
    BY_ID: (id: string) => `/templates/${id}`,
  },
  SUBSCRIPTIONS: {
    BASE: '/subscriptions',
    PLANS: '/subscriptions/plans',
    PORTAL: '/subscriptions/portal',
  },
  EXPORTS: {
    BASE: '/exports',
    BY_RESUME: (resumeId: string) => `/exports/resume/${resumeId}`,
  },
  ANALYTICS: {
    EVENT: '/analytics/event',
  },
  ADMIN: {
    OVERVIEW: '/admin/overview',
    USERS: '/admin/users',
    RESUMES: '/admin/resumes',
    AI: '/admin/ai',
    FUNNEL: '/admin/funnel',
    ACTIVITY: '/admin/activity',
    ERRORS: '/admin/errors',
    MARKETING: '/admin/marketing',
    USER_DETAIL: (id: string) => `/admin/users/${id}`,
  },
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: `${APP_NAME.toLowerCase()}_access_token`,
  REFRESH_TOKEN: `${APP_NAME.toLowerCase()}_refresh_token`,
  THEME: `${APP_NAME.toLowerCase()}_theme`,
  SIDEBAR_COLLAPSED: `${APP_NAME.toLowerCase()}_sidebar_collapsed`,
} as const;

export const TOAST_DURATION = 4000; // 4 seconds
export const DEBOUNCE_DELAY = 500; // 500 ms
export const AUTO_SAVE_INTERVAL = 3000; // 3 seconds
