
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initializeTracking } from '@/lib/tracking';
import { sendN8NEvent } from '@/app/actions';

export function N8NTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const trackPageView = async () => {
      // 1. Initialize cookies and get all client data, including the newly set fbc.
      // This now correctly waits for async operations and returns the complete data.
      const { userData, eventId } = await initializeTracking(searchParams);
      if (!userData.external_id) return;

      // 2. Prepare and send the PageView event after a delay,
      // using the data returned directly from the initialization.
      setTimeout(() => {
        sendN8NEvent({
          eventName: 'PageView',
          eventId: eventId,
          eventTime: Math.floor(Date.now() / 1000),
          userData: userData,
          event_source_url: window.location.href,
          action_source: 'website',
        });
      }, 4000);
    };

    trackPageView();
  }, [pathname, searchParams]);

  return null;
}
