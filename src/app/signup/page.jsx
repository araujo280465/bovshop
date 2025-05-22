'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container, Paper, TextField, Button, Typography, Box, Alert, Link } from '@mui/material'
import { supabase } from '../../supabaseClient'

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    Logradouro: '',
    log_numero: '',
    Log_complemento: '',
    cep: '',
    log_obs: '',
    ddd: '',
    telefone: '',
    cidade: '',
    uf: '',
    ativo: true
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (formData.password !== confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    try {
      // First check if user exists - case insensitive check
      const { data: existingUsers, error: checkError } = await supabase
        .from('usuario')
        .select('email')
        .ilike('email', formData.email)

      if (checkError) {
        throw checkError
      }

      if (existingUsers && existingUsers.length > 0) {
        setError('Este email já está cadastrado. Por favor, use outro email ou faça login.')
        setLoading(false)
        return
      }

      // Add created_at field
      const dataToInsert = {
        ...formData,
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('usuario')
        .insert([dataToInsert])

      if (error) throw error

      setSuccess(true)
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Cadastro
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Cadastro realizado com sucesso! Redirecionando para o login...
            </Alert>
          )}
          <form onSubmit={handleSignUp}>
            <TextField
              name="nome"
              label="Nome"
              fullWidth
              margin="normal"
              value={formData.nome}
              onChange={handleInputChange}
              required
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <TextField
              name="password"
              label="Senha"
              type="password"
              fullWidth
              margin="normal"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <TextField
              label="Confirmar Senha"
              type="password"
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <TextField
              name="Logradouro"
              label="Logradouro"
              fullWidth
              margin="normal"
              value={formData.Logradouro}
              onChange={handleInputChange}
            />
            <TextField
              name="log_numero"
              label="Número"
              fullWidth
              margin="normal"
              value={formData.log_numero}
              onChange={handleInputChange}
            />
            <TextField
              name="Log_complemento"
              label="Complemento"
              fullWidth
              margin="normal"
              value={formData.Log_complemento}
              onChange={handleInputChange}
            />
            <TextField
              name="cep"
              label="CEP"
              fullWidth
              margin="normal"
              value={formData.cep}
              onChange={handleInputChange}
            />
            <TextField
              name="log_obs"
              label="Observações"
              fullWidth
              margin="normal"
              value={formData.log_obs}
              onChange={handleInputChange}
            />
            <TextField
              name="ddd"
              label="DDD"
              fullWidth
              margin="normal"
              value={formData.ddd}
              onChange={handleInputChange}
            />
            <TextField
              name="telefone"
              label="Telefone"
              fullWidth
              margin="normal"
              value={formData.telefone}
              onChange={handleInputChange}
            />
            <TextField
              name="cidade"
              label="Cidade"
              fullWidth
              margin="normal"
              value={formData.cidade}
              onChange={handleInputChange}
            />
            <TextField
              name="uf"
              label="UF"
              fullWidth
              margin="normal"
              value={formData.uf}
              onChange={handleInputChange}
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
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </form>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link href="/login" variant="body2">
              Já tem uma conta? Faça login
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
} 