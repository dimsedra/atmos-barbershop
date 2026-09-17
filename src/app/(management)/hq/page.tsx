'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HqRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/hq/overview');
  }, [router]);

  return null;
}
