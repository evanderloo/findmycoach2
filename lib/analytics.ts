'use client';

import posthog from 'posthog-js';

const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '';
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com';

if (typeof window !== 'undefined' && apiKey) {
  posthog.init(apiKey, {
    api_host: host,
    person_profiles: 'identified_only',
    persistence: 'localStorage+cookie',
    autocapture: true,
  });
}

export { posthog };
