
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initializeTracking, getClientData, generateEventId } from '@/lib/tracking';
import { sendN8NEvent } from '@/app/actions';

export function N8NTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const trackPageView = async () => {
      // 1. Initialize cookies, localStorage, etc.
      await initializeTracking(searchParams);

      // 2. Get all the client data that was just stored
      const { userData } = getClientData();
      if (!userData.external_id) return;

      // 3. Prepare and send the PageView event
      const eventId = generateEventId('PageView', userData.external_id);
      
      sendN8NEvent({
        eventName: 'PageView',
        eventId: eventId,
        eventTime: Math.floor(Date.now() / 1000),
        userData: userData,
        event_source_url: window.location.href,
        action_source: 'website',
      });
    };

    trackPageView();
  }, [pathname, searchParams]);

  return null;
}
