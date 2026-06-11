'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { apiPost } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';

const SESSION_KEY = 'resumeai_session_id';
const MARKETING_KEY = 'resumeai_marketing_context';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;

function getSessionId() {
  const win = globalThis as any;
  let sessionId = win.localStorage?.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    win.localStorage?.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function getMarketingContext() {
  const win = globalThis as any;
  try {
    return JSON.parse(win.localStorage?.getItem(MARKETING_KEY) || '{}') as Record<string, unknown>;
  } catch {
    return {};
  }
}

function captureMarketingContext() {
  const win = globalThis as any;
  const params = new URLSearchParams(win.location?.search || '');
  const existing = getMarketingContext();
  const next: Record<string, unknown> = { ...existing };
  let hasCampaignParam = false;

  UTM_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) {
      next[key] = value;
      hasCampaignParam = true;
    }
  });

  const referralCode = params.get('ref') || params.get('referral');
  if (referralCode) {
    next.referral = referralCode;
    hasCampaignParam = true;
  }

  if (!next.firstLandingPage) {
    next.firstLandingPage = `${win.location?.pathname || '/'}${win.location?.search || ''}`;
  }
  if (!next.firstReferrer && win.document?.referrer) {
    next.firstReferrer = win.document.referrer;
  }
  if (hasCampaignParam || !existing.firstLandingPage) {
    next.lastLandingPage = `${win.location?.pathname || '/'}${win.location?.search || ''}`;
    next.capturedAt = new Date().toISOString();
    win.localStorage?.setItem(MARKETING_KEY, JSON.stringify(next));
  }

  return next;
}

export function trackAnalyticsEvent(eventType: string, metadata?: Record<string, unknown>, entityType?: string, entityId?: string) {
  const win = globalThis as any;
  const sessionId = getSessionId();
  const marketing = captureMarketingContext();
  void apiPost(API_ENDPOINTS.ANALYTICS.EVENT, {
    sessionId,
    eventType,
    entityType,
    entityId,
    path: win.location?.pathname,
    referrer: win.document?.referrer,
    metadata: { ...(marketing || {}), ...(metadata || {}) },
  }).catch(() => undefined);
}

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackAnalyticsEvent('page_view');
  }, [pathname]);

  return null;
}
