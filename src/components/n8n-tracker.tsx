
'use client';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initializeTracking } from '@/lib/tracking';

export function N8NTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    initializeTracking(searchParams);
  }, [pathname, searchParams]);

  return null;
}
