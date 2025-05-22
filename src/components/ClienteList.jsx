'use client'

import React, { useEffect, useState } from 'react'
import supabase from '../supabaseClient'
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Box } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'

export default function ClienteList() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [currentCliente, setCurrentCliente] = useState(null)
  const [formData, setFormData] = useState({})
  const [columns, setColumns] = useState([])
  const [allColumns, setAllColumns] = useState([])
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchClientes()
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

  const fetchClientes = async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.from('cliente').select('*')
    if (error) {
      setError(error.message)
    } else {
      // Sort the data by nome
      const sortedData = [...data].sort((a, b) => a.nome.localeCompare(b.nome))
      setClientes(sortedData)
      if (data.length > 0) {
        // Get all columns for forms
        const allCols = Object.keys(data[0]).filter(col => 
          col !== 'id_cliente' && 
          col !== 'created_at'
        )
        setAllColumns(allCols)

        // Get columns for table view
        const columns = Object.keys(data[0]).filter(col => 
          col !== 'id_cliente' && 
          col !== 'created_at'
        )
        setColumns(columns)
      }
    }
    setLoading(false)
  }

  const columnLabels = {
    nome: 'Nome',
    fazenda: 'Fazenda',
    Logradouro: 'Logradouro',
    log_numero: 'Número',
    Log_complemento: 'Complemento',
    cep: 'CEP',
    log_obs: 'Observações',
    email: 'Email',
    ddd: 'DDD',
    telefone: 'Telefone',
    cidade: 'Cidade',
    uf: 'UF'
  }

  const handleCreateClick = () => {
    setFormData({
      nome: '',
      fazenda: '',
      Logradouro: '',
      log_numero: '',
      Log_complemento: '',
      cep: '',
      log_obs: '',
      email: '',
      ddd: '',
      telefone: '',
      cidade: '',
      uf: ''
    })
    setOpenCreateDialog(true)
  }

  const handleEditClick = (cliente) => {
    setCurrentCliente(cliente)
    setFormData(cliente)
    setOpenEditDialog(true)
  }

  const handleDeleteClick = (cliente) => {
    setCurrentCliente(cliente)
    setOpenDeleteDialog(true)
  }

  const handleCloseDialog = () => {
    if (openCreateDialog) {
      setOpenCreateDialog(false)
    }
    if (openEditDialog) {
      setOpenEditDialog(false)
    }
    setHasChanges(false)
    setFormData({})
    setError(null)
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
        .from('cliente')
        .insert([dataToInsert])
        .select()

      if (error) {
        console.error('Insert error:', error)
        setError(error.message)
      } else {
        console.log('Insert success:', data)
        fetchClientes()
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
        .from('cliente')
        .update(formData)
        .eq('id_cliente', currentCliente.id_cliente)
        .select()

      if (error) {
        console.error('Update error:', error)
        setError(error.message)
      } else {
        console.log('Update success:', data)
        fetchClientes()
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

      const { data, error } = await supabase
        .from('cliente')
        .delete()
        .eq('id_cliente', currentCliente.id_cliente)
        .select()

      if (error) {
        console.error('Delete error:', error)
        setError(error.message)
      } else {
        console.log('Delete success:', data)
        fetchClientes()
        handleCloseDialog()
      }
    } catch (error) {
      console.error('Delete error:', error)
      setError(error.message)
    }
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        Clientes
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
              {clientes.map((cliente) => (
                <TableRow key={cliente.id_cliente}>
                  <TableCell>
                    <IconButton onClick={() => handleEditClick(cliente)}>
                      <EditIcon color="warning" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(cliente)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell key={col}>{String(cliente[col])}</TableCell>
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
        <DialogTitle>Novo Cliente</DialogTitle>
        <DialogContent>
          {allColumns.map((col) => (
            <TextField
              key={col}
              name={col}
              label={columnLabels[col]}
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
        <DialogTitle>Editar Cliente</DialogTitle>
        <DialogContent>
          {allColumns.map((col) => (
            <TextField
              key={col}
              name={col}
              label={columnLabels[col]}
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
      <Dialog open={openDeleteDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja excluir este cliente?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleDeleteSubmit} color="error">Excluir</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
} 