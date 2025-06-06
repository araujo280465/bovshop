'use client'

import React, { useEffect, useState } from 'react'
import supabase from '../supabaseClient'
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Box } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { useRouter } from 'next/navigation'

export default function UsuarioList() {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [currentUsuario, setCurrentUsuario] = useState(null)
  const [formData, setFormData] = useState({})
  const [columns, setColumns] = useState([])
  const [allColumns, setAllColumns] = useState([])
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchUsuarios()
  }, [])

  // Handle browser back button
  useEffect(() => {
    if (openCreateDialog || openEditDialog) {
      const handleBeforeUnload = (e) => {
        e.preventDefault()
        e.returnValue = ''
      }

      const handlePopState = (e) => {
        e.preventDefault()
        if (hasChanges) {
          setOpenConfirmDialog(true)
        } else {
          handleCloseDialog()
        }
      }

      window.addEventListener('beforeunload', handleBeforeUnload)
      window.addEventListener('popstate', handlePopState)

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload)
        window.removeEventListener('popstate', handlePopState)
      }
    }
  }, [openCreateDialog, openEditDialog, hasChanges])

  const handleCloseDialog = () => {
    if (openCreateDialog) {
      setOpenCreateDialog(false)
    }
    if (openEditDialog) {
      setOpenEditDialog(false)
    }
    setHasChanges(false)
    setFormData({})
  }

  const handleCloseCreateDialog = () => {
    if (hasChanges) {
      setOpenConfirmDialog(true)
    } else {
      handleCloseDialog()
    }
  }

  const handleCloseEditDialog = () => {
    if (hasChanges) {
      setOpenConfirmDialog(true)
    } else {
      handleCloseDialog()
    }
  }

  const handleConfirmClose = () => {
    setOpenConfirmDialog(false)
    handleCloseDialog()
  }

  const handleCancelClose = () => {
    setOpenConfirmDialog(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setHasChanges(true)
  }

  const fetchUsuarios = async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.from('usuario').select('*')
    if (error) {
      setError(error.message)
    } else {
      // Sort the data by nome
      const sortedData = [...data].sort((a, b) => a.nome.localeCompare(b.nome))
      setUsuarios(sortedData)
      if (data.length > 0) {
        // Get all columns for forms
        const allCols = Object.keys(data[0]).filter(col => 
          col !== 'id_usuario' && 
          col !== 'created_at'
        )
        setAllColumns(allCols)

        // Get columns for table view
        const columns = Object.keys(data[0]).filter(col => 
          col !== 'id_usuario' && 
          col !== 'created_at'
        )
        setColumns(columns)
      }
    }
    setLoading(false)
  }

  const columnLabels = {
    nome: 'Nome',
    email: 'Email',
    password: 'Senha',
    Logradouro: 'Logradouro',
    log_numero: 'Número',
    Log_complemento: 'Complemento',
    cep: 'CEP',
    log_obs: 'Observações',
    ddd: 'DDD',
    telefone: 'Telefone',
    cidade: 'Cidade',
    uf: 'UF',
    ativo: 'Ativo'
  }

  const handleCreateClick = () => {
    setFormData({
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
    setOpenCreateDialog(true)
  }

  const handleEditClick = (usuario) => {
    setCurrentUsuario(usuario)
    setFormData(usuario)
    setOpenEditDialog(true)
  }

  const handleDeleteClick = (usuario) => {
    setCurrentUsuario(usuario)
    setOpenDeleteDialog(true)
  }

  const handleCreateSubmit = async () => {
    try {
      // Get user from localStorage
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        setError('Usuário não autenticado')
        return
      }

      const user = JSON.parse(userStr)
      console.log('Logged in user:', user)
      
      // Add created_at field and ensure all required fields are present
      const dataToInsert = {
        ...formData,
        created_at: new Date().toISOString()
      }

      console.log('Data to insert:', dataToInsert)

      const { data, error } = await supabase
        .from('usuario')
        .insert([dataToInsert])
        .select()

      if (error) {
        console.error('Insert error:', error)
        setError(error.message)
      } else {
        console.log('Insert success:', data)
        fetchUsuarios()
        setHasChanges(false) // Reset changes before closing
        handleCloseDialog()
      }
    } catch (error) {
      console.error('Create error:', error)
      setError(error.message)
    }
  }

  const handleEditSubmit = async () => {
    try {
      // Get user from localStorage
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        setError('Usuário não autenticado')
        return
      }

      const { data, error } = await supabase
        .from('usuario')
        .update(formData)
        .eq('id_usuario', currentUsuario.id_usuario)
        .select()

      if (error) {
        console.error('Update error:', error)
        setError(error.message)
      } else {
        console.log('Update success:', data)
        fetchUsuarios()
        setHasChanges(false) // Reset changes before closing
        handleCloseDialog()
      }
    } catch (error) {
      console.error('Edit error:', error)
      setError(error.message)
    }
  }

  const handleDeleteSubmit = async () => {
    try {
      // Get user from localStorage
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        setError('Usuário não autenticado')
        return
      }

      const { error } = await supabase
        .from('usuario')
        .delete()
        .eq('id_usuario', currentUsuario.id_usuario)
        .select()

      if (error) {
        setError(error.message)
      } else {
        fetchUsuarios()
        handleCloseDeleteDialog()
      }
    } catch (error) {
      setError(error.message)
    }
  }

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false)
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        Usuários
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleCreateClick}>
          <AddIcon />
        </Button>
      </Box>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer 
          component={Paper} 
          sx={{ 
            mt: 2,
            maxHeight: 'calc(100vh - 200px)',
            overflow: 'auto'
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>Ações</TableCell>
                {columns.map((col) => (
                  <TableCell 
                    key={col} 
                    sx={{ 
                      position: 'sticky', 
                      top: 0, 
                      backgroundColor: 'white',
                      zIndex: 1 
                    }}
                  >
                    {columnLabels[col]}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {usuarios.map((usuario) => (
                <TableRow key={usuario.id_usuario}>
                  <TableCell>
                    <IconButton onClick={() => handleEditClick(usuario)}>
                      <EditIcon color="warning" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(usuario)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell key={col}>{String(usuario[col])}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Dialog */}
      <Dialog 
        open={openCreateDialog} 
        onClose={(event, reason) => {
          if (reason === 'backdropClick') {
            return;
          }
          handleCloseCreateDialog();
        }}
        maxWidth="md"
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle>Novo Usuário</DialogTitle>
        <DialogContent>
          {allColumns.map((col) => (
            <TextField
              key={col}
              name={col}
              label={columnLabels[col]}
              type={col === 'password' ? 'password' : 'text'}
              value={formData[col] || ''}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancelar</Button>
          <Button onClick={handleCreateSubmit} color="primary">Salvar</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={openEditDialog} 
        onClose={(event, reason) => {
          if (reason === 'backdropClick') {
            return;
          }
          handleCloseEditDialog();
        }}
        maxWidth="md"
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle>Editar Usuário</DialogTitle>
        <DialogContent>
          {allColumns.map((col) => (
            <TextField
              key={col}
              name={col}
              label={columnLabels[col]}
              type={col === 'password' ? 'password' : 'text'}
              value={formData[col] || ''}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancelar</Button>
          <Button onClick={handleEditSubmit} color="primary">Salvar</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={handleCancelClose}
      >
        <DialogTitle>Confirmar Saída</DialogTitle>
        <DialogContent>
          <Typography>
            Você tem alterações não salvas. Tem certeza que deseja sair?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClose}>Cancelar</Button>
          <Button onClick={handleConfirmClose} color="error">Sair</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja excluir este usuário?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleDeleteSubmit} color="error">Excluir</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
} 