'use client';

import { Suspense } from 'react';

function VslContent() {
  // Página intencionalmente deixada em branco para recomeçar.
  return null;
}

export default function VslPage() {
  return (
    <Suspense>
      <VslContent />
    </Suspense>
  );
}
