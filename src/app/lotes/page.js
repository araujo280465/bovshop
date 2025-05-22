'use client';

import { Suspense } from 'react';
import LoteList from '@/components/LoteList';

export default function LotesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoteList />
    </Suspense>
  );
} 