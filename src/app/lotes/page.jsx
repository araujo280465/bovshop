'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { CircularProgress, Container, Typography, Box } from '@mui/material'

const LoteList = dynamic(() => import('../../components/LoteList'), {
  ssr: false,
  loading: () => {
    console.log('LotesPage: Loading LoteList component...')
    return <div>Loading...</div>
  }
})

export default function LotesPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('LotesPage: Component mounted')
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Carregando...
          </Typography>
        </Box>
      </Container>
    )
  }

  console.log('LotesPage: Rendering page...')
  return (
    <Container maxWidth="lg">
      <LoteList />
    </Container>
  )
} 