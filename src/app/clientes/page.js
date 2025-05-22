'use client';

import { Suspense } from 'react';
import ClienteList from '@/components/ClienteList';

export default function ClientesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClienteList />
    </Suspense>
  );
} 