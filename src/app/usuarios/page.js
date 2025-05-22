'use client';

import { Suspense } from 'react';
import UsuarioList from '@/components/UsuarioList';

export default function UsuariosPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UsuarioList />
    </Suspense>
  );
} 