'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  const router = useRouter()

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('user')
    // Clear cookie
    Cookies.remove('user')
    // Redirect to login
    window.location.href = '/login'
  }

  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Sistema de Lotes
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button color="inherit" href="/">Home</Button>
              <Button color="inherit" href="/sobre">Sobre</Button>
              <Button color="inherit" href="/lotes">Lotes</Button>
              <Button color="inherit" href="/lote-imagens">Imagens de Lote</Button>
              <Button color="inherit" href="/usuarios">Usuários</Button>
              <Button color="inherit" href="/clientes">Clientes</Button>
              <Button color="inherit" onClick={handleLogout}>Sair</Button>
            </Box>
          </Toolbar>
        </AppBar>
        {children}
      </body>
    </html>
  )
} 