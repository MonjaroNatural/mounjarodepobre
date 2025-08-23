'use client';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getCookie, setCookie, generateUUID } from '@/lib/tracking';
import { sendN8NEvent } from '@/app/actions';

export function N8NTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let sessionId = getCookie('my_session_id');
    if (!sessionId) {
      sessionId = generateUUID();
      setCookie('my_session_id', sessionId, 365);
    }

    const fbc = searchParams.get('fbclid')
      ? `fb.1.${Date.now()}.${searchParams.get('fbclid')}`
      : getCookie('_fbc');

    if (fbc) {
      setCookie('_fbc', fbc);
    }

    sendN8NEvent({
      eventName: 'PageView',
      eventTime: Math.floor(Date.now() / 1000),
      userData: {
        external_id: sessionId,
        fbc: fbc,
        fbp: getCookie('_fbp'),
      },
      event_source_url: window.location.href,
      action_source: 'website',
    });
  }, [pathname, searchParams]);

  return null;
}
