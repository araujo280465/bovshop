'use client'

import React, { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Container, Paper, TextField, Button, Typography, Box, Alert, Link } from '@mui/material'
import { supabase } from '../../supabaseClient'
import Cookies from 'js-cookie'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // First check if user exists with this email
      const { data: userData, error: userError } = await supabase
        .from('usuario')
        .select('*')
        .eq('email', email)
        .maybeSingle()

      if (userError) {
        throw userError
      }

      if (!userData) {
        throw new Error('Usuário não encontrado')
      }

      // Check if user is active
      if (!userData.ativo) {
        throw new Error('Usuário inativo')
      }

      // Check password
      if (userData.password !== password) {
        throw new Error('Senha incorreta')
      }

      // Store user data in localStorage and cookies
      const userToStore = {
        id_usuario: userData.id_usuario,
        nome: userData.nome,
        email: userData.email,
        Logradouro: userData.Logradouro,
        log_numero: userData.log_numero,
        created_at: userData.created_at
      }
      
      // Store in localStorage for client-side access
      localStorage.setItem('user', JSON.stringify(userToStore))
      
      // Store in cookies for server-side access (middleware)
      Cookies.set('user', JSON.stringify(userToStore), { 
        expires: 7, // 7 days
        path: '/',
        sameSite: 'strict'
      })

      console.log('User data stored:', userToStore)

      // Create a form and submit it to navigate
      const form = document.createElement('form')
      form.method = 'GET'
      form.action = searchParams.get('redirectedFrom') || '/lotes'
      document.body.appendChild(form)
      form.submit()
    } catch (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Login
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleLogin}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Senha"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link href="/signup" variant="body2">
              Não tem uma conta? Cadastre-se
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
} 