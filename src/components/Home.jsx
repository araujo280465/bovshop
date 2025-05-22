'use client'

import React from 'react'
import { Container, Typography, Box } from '@mui/material'

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Bem-vindo ao Sistema de Gestão de Lotes
        </Typography>
        <Typography variant="body1" paragraph>
          Este sistema permite gerenciar lotes de animais, clientes e usuários de forma eficiente.
        </Typography>
        <Typography variant="body1">
          Utilize o menu de navegação para acessar as diferentes funcionalidades do sistema.
        </Typography>
      </Box>
    </Container>
  )
} 