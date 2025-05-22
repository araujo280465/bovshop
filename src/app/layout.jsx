'use client'

import { Suspense } from 'react'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from '../theme'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check authentication on mount and when cookies change
    const checkAuth = () => {
      const userCookie = Cookies.get('user')
      if (userCookie) {
        try {
          const userData = JSON.parse(userCookie)
          setUser(userData)
          setIsAuthenticated(true)
        } catch (error) {
          console.error('Error parsing user data:', error)
          setIsAuthenticated(false)
          setUser(null)
        }
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('user')
    // Clear cookie
    Cookies.remove('user')
    // Update state
    setIsAuthenticated(false)
    setUser(null)
    // Redirect to login
    window.location.href = '/login'
  }

  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Suspense fallback={<div>Loading...</div>}>
              <AppBar position="static">
                <Toolbar>
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Sistema de Lotes
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button color="inherit" href="/">Home</Button>
                    <Button color="inherit" href="/sobre">Sobre</Button>
                    {isAuthenticated ? (
                      <>
                        <Button color="inherit" href="/lotes">Lotes</Button>
                        <Button color="inherit" href="/lote-imagens">Imagens de Lote</Button>
                        <Button color="inherit" href="/usuarios">Usuários</Button>
                        <Button color="inherit" href="/clientes">Clientes</Button>
                        <Button color="inherit" onClick={handleLogout}>Sair</Button>
                      </>
                    ) : (
                      <Button color="inherit" href="/login">Login</Button>
                    )}
                  </Box>
                </Toolbar>
              </AppBar>
              {children}
            </Suspense>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
} 