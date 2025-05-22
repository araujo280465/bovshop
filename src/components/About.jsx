'use client'

import React from 'react'
import { Container, Typography, Box } from '@mui/material'

export default function About() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sobre o Sistema
        </Typography>
        <Typography variant="body1" paragraph>
          Este sistema foi desenvolvido para facilitar a gestão de lotes de animais, clientes e usuários.
        </Typography>
        <Typography variant="body1" paragraph>
          Principais funcionalidades:
        </Typography>
        <Typography variant="body1" component="ul">
          <li>Gerenciamento de lotes de animais</li>
          <li>Cadastro e controle de clientes</li>
          <li>Gestão de usuários do sistema</li>
          <li>Interface intuitiva e responsiva</li>
        </Typography>
      </Box>
    </Container>
  )
} 