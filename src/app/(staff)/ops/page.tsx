'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OpsIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/ops/schedule');
  }, [router]);

  return (
    <div className="py-12 flex items-center justify-center text-xs text-zinc-500 font-mono">
      Mengarahkan ke Jadwal Janji Hari Ini...
    </div>
  );
}
