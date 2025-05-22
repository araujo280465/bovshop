'use client'

import dynamic from 'next/dynamic'

const LoteImagensList = dynamic(() => import('../../components/LoteImagensList'), {
  ssr: false,
  loading: () => <p>Carregando...</p>
})

export default function LoteImagensPage() {
  return <LoteImagensList />
} 