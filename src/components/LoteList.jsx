'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '../supabaseClient'
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { ptBR } from 'date-fns/locale'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'

export default function LoteList() {
  const router = useRouter()
  const [lotes, setLotes] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [currentLote, setCurrentLote] = useState(null)
  const [formData, setFormData] = useState({
    qtd_animais: '',
    tipo_animais: '',
    foto_animais: '',
    local_cidade: '',
    local_estado: '',
    id_Dono_lote: '',
    valido_de: '',
    valido_ate: '',
    id_comprador_lote: '',
    Peso_medio: '',
    Preco_lote: ''
  })
  const [columns, setColumns] = useState([])
  const [allColumns, setAllColumns] = useState([])

  useEffect(() => {
    console.log('LoteList: Component mounted')
    console.log('LoteList: Fetching data...')
    fetchLotes()
    fetchClientes()
  }, [router])

  const fetchLotes = async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.from('lote').select('*')
    if (error) {
      setError(error.message)
    } else {
      // Sort the data
      const sortedData = [...data].sort((a, b) => {
        // First sort by tipo_animais
        if (a.tipo_animais !== b.tipo_animais) {
          return a.tipo_animais.localeCompare(b.tipo_animais)
        }
        // Then by qtd_animais
        if (a.qtd_animais !== b.qtd_animais) {
          return a.qtd_animais - b.qtd_animais
        }
        // Then by local_estado
        if (a.local_estado !== b.local_estado) {
          return a.local_estado.localeCompare(b.local_estado)
        }
        // Finally by local_cidade
        return a.local_cidade.localeCompare(b.local_cidade)
      })
      
      setLotes(sortedData)
      if (data.length > 0) {
        // Get all columns for forms
        const allCols = Object.keys(data[0]).filter(col => 
          col !== 'id_lote' && 
          col !== 'created_at'
        )
        setAllColumns(allCols)

        // Get columns for table view, excluding foto_animais, id_Dono_lote, and id_comprador_lote
        const columns = Object.keys(data[0]).filter(col => 
          col !== 'id_lote' && 
          col !== 'created_at' && 
          col !== 'foto_animais' &&
          col !== 'id_Dono_lote' &&
          col !== 'id_comprador_lote'
        ).map(col => {
          if (col === 'tipo_animais') return 'qtd_animais'
          if (col === 'qtd_animais') return 'tipo_animais'
          if (col === 'local_cidade') return 'local_estado'
          if (col === 'local_estado') return 'local_cidade'
          return col
        })
        setColumns(columns)
      }
    }
    setLoading(false)
  }

  const fetchClientes = async () => {
    const { data, error } = await supabase
      .from('cliente')
      .select('id_cliente, nome')
      .order('nome')
    
    if (error) {
      setError(error.message)
    } else {
      setClientes(data)
    }
  }

  const columnLabels = {
    qtd_animais: 'Quantidade',
    tipo_animais: 'Tipo de Animais',
    foto_animais: 'Fotos dos Animais',
    local_cidade: 'Cidade',
    local_estado: 'Estado',
    id_Dono_lote: 'ID do Dono do Lote',
    valido_de: 'Válido De',
    valido_ate: 'Até',
    id_comprador_lote: 'ID do Comprador',
    Peso_medio: 'Peso Médio',
    Preco_lote: 'Preço'
  }

  const handleCreateClick = () => {
    setFormData({
      qtd_animais: '',
      tipo_animais: '',
      foto_animais: '',
      local_cidade: '',
      local_estado: '',
      id_Dono_lote: '',
      valido_de: '',
      valido_ate: '',
      id_comprador_lote: '',
      Peso_medio: '',
      Preco_lote: ''
    })
    setOpenCreateDialog(true)
  }

  const handleEditClick = (lote) => {
    setCurrentLote(lote)
    // Format dates to YYYY-MM-DD for the date input fields
    const formattedLote = {
      ...lote,
      valido_de: lote.valido_de ? new Date(lote.valido_de).toISOString().split('T')[0] : '',
      valido_ate: lote.valido_ate ? new Date(lote.valido_ate).toISOString().split('T')[0] : ''
    }
    setFormData(formattedLote)
    setOpenEditDialog(true)
  }

  const handleDeleteClick = (lote) => {
    setCurrentLote(lote)
    setOpenDeleteDialog(true)
  }

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false)
    setError(null)
  }

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false)
    setError(null)
  }

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false)
    setError(null)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleInsert = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate all required fields
    const requiredFields = ['qtd_animais', 'tipo_animais', 'foto_animais', 'local_cidade', 'local_estado', 'id_Dono_lote', 'valido_de', 'valido_ate', 'id_comprador_lote', 'Peso_medio', 'Preco_lote']
    const missingFields = requiredFields.filter(field => !formData[field])
    
    if (missingFields.length > 0) {
      setError(`Por favor, preencha todos os campos obrigatórios: ${missingFields.join(', ')}`)
      setLoading(false)
      return
    }

    // Validate dates
    if (new Date(formData.valido_ate) < new Date(formData.valido_de)) {
      setError('A data "Válido de" deve ser menor ou igual à data "Até"')
      setLoading(false)
      return
    }

    try {
      // Create a copy of formData and trim tipo_animais
      const trimmedData = {
        ...formData,
        tipo_animais: formData.tipo_animais.trim()
      }

      const { error } = await supabase
        .from('lote')
        .insert([trimmedData])

      if (error) throw error

      setFormData({
        qtd_animais: '',
        tipo_animais: '',
        foto_animais: '',
        local_cidade: '',
        local_estado: '',
        id_Dono_lote: '',
        valido_de: '',
        valido_ate: '',
        id_comprador_lote: '',
        Peso_medio: '',
        Preco_lote: ''
      })
      setOpenCreateDialog(false)
      fetchLotes()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate dates
    if (new Date(formData.valido_ate) < new Date(formData.valido_de)) {
      setError('A data "Válido de" deve ser menor ou igual à data "Até"')
      setLoading(false)
      return
    }

    try {
      // Create a copy of formData and trim tipo_animais
      const trimmedData = {
        ...formData,
        tipo_animais: formData.tipo_animais.trim()
      }

      const { error } = await supabase
        .from('lote')
        .update(trimmedData)
        .eq('id_lote', currentLote.id_lote)

      if (error) throw error

      setOpenEditDialog(false)
      fetchLotes()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubmit = async () => {
    const { error } = await supabase.from('lote').delete().eq('id_lote', currentLote.id_lote)
    if (error) {
      setError(error.message)
    } else {
      fetchLotes()
      handleCloseDeleteDialog()
    }
  }

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  }

  const parseDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString);
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        Lotes
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleCreateClick}>
          <AddIcon />
        </Button>
      </Box>
      {loading ? (
        <CircularProgress />
      ) : error && !openCreateDialog && !openEditDialog ? (
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
              {lotes.map((lote) => (
                <TableRow key={lote.id_lote}>
                  <TableCell>
                    <IconButton onClick={() => handleEditClick(lote)}>
                      <EditIcon color="warning" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(lote)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell key={col}>{String(lote[col])}</TableCell>
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
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '80vh',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle>Novo Lote</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleInsert}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 1 }}>
              <TextField
                name="qtd_animais"
                label="Quantidade"
                type="number"
                fullWidth
                value={formData.qtd_animais}
                onChange={handleInputChange}
                required
              />
              <TextField
                name="tipo_animais"
                label="Tipo de Animais"
                fullWidth
                value={formData.tipo_animais}
                onChange={handleInputChange}
                required
              />
              <TextField
                name="foto_animais"
                label="Fotos dos Animais"
                fullWidth
                value={formData.foto_animais}
                onChange={handleInputChange}
                required
              />
              <TextField
                name="local_estado"
                label="Estado"
                fullWidth
                value={formData.local_estado}
                onChange={handleInputChange}
                required
              />
              <TextField
                name="local_cidade"
                label="Cidade"
                fullWidth
                value={formData.local_cidade}
                onChange={handleInputChange}
                required
              />
              <FormControl fullWidth required>
                <InputLabel>Dono do Lote</InputLabel>
                <Select
                  name="id_Dono_lote"
                  value={formData.id_Dono_lote}
                  onChange={handleInputChange}
                  label="Dono do Lote"
                >
                  {clientes.map((cliente) => (
                    <MenuItem key={cliente.id_cliente} value={cliente.id_cliente}>
                      {cliente.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                name="valido_de"
                label="Válido De"
                type="date"
                fullWidth
                value={formData.valido_de}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                name="valido_ate"
                label="Até"
                type="date"
                fullWidth
                value={formData.valido_ate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
              />
              <FormControl fullWidth required>
                <InputLabel>Comprador do Lote</InputLabel>
                <Select
                  name="id_comprador_lote"
                  value={formData.id_comprador_lote}
                  onChange={handleInputChange}
                  label="Comprador do Lote"
                >
                  {clientes.map((cliente) => (
                    <MenuItem key={cliente.id_cliente} value={cliente.id_cliente}>
                      {cliente.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                name="Peso_medio"
                label="Peso Médio"
                type="number"
                fullWidth
                value={formData.Peso_medio}
                onChange={handleInputChange}
                required
              />
              <TextField
                name="Preco_lote"
                label="Preço"
                type="number"
                fullWidth
                value={formData.Preco_lote}
                onChange={handleInputChange}
                required
              />
            </Box>
            <DialogActions sx={{ mt: 2 }}>
              <Button onClick={handleCloseCreateDialog}>Cancelar</Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={openEditDialog} 
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '80vh',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle>Editar Lote</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleEditSubmit}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 1 }}>
              <TextField
                name="qtd_animais"
                label="Quantidade"
                type="number"
                fullWidth
                value={formData.qtd_animais}
                onChange={handleInputChange}
                required
              />
              <TextField
                name="tipo_animais"
                label="Tipo de Animais"
                fullWidth
                value={formData.tipo_animais}
                onChange={handleInputChange}
                required
              />
              <TextField
                name="foto_animais"
                label="Fotos dos Animais"
                fullWidth
                value={formData.foto_animais}
                onChange={handleInputChange}
                required
              />
              <TextField
                name="local_estado"
                label="Estado"
                fullWidth
                value={formData.local_estado}
                onChange={handleInputChange}
                required
              />
              <TextField
                name="local_cidade"
                label="Cidade"
                fullWidth
                value={formData.local_cidade}
                onChange={handleInputChange}
                required
              />
              <FormControl fullWidth required>
                <InputLabel>Dono do Lote</InputLabel>
                <Select
                  name="id_Dono_lote"
                  value={formData.id_Dono_lote}
                  onChange={handleInputChange}
                  label="Dono do Lote"
                >
                  {clientes.map((cliente) => (
                    <MenuItem key={cliente.id_cliente} value={cliente.id_cliente}>
                      {cliente.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                name="valido_de"
                label="Válido De"
                type="date"
                fullWidth
                value={formData.valido_de}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                name="valido_ate"
                label="Até"
                type="date"
                fullWidth
                value={formData.valido_ate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
              />
              <FormControl fullWidth required>
                <InputLabel>Comprador do Lote</InputLabel>
                <Select
                  name="id_comprador_lote"
                  value={formData.id_comprador_lote}
                  onChange={handleInputChange}
                  label="Comprador do Lote"
                >
                  {clientes.map((cliente) => (
                    <MenuItem key={cliente.id_cliente} value={cliente.id_cliente}>
                      {cliente.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                name="Peso_medio"
                label="Peso Médio"
                type="number"
                fullWidth
                value={formData.Peso_medio}
                onChange={handleInputChange}
                required
              />
              <TextField
                name="Preco_lote"
                label="Preço"
                type="number"
                fullWidth
                value={formData.Preco_lote}
                onChange={handleInputChange}
                required
              />
            </Box>
            <DialogActions sx={{ mt: 2 }}>
              <Button onClick={handleCloseEditDialog}>Cancelar</Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja excluir este lote?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleDeleteSubmit} color="error">Excluir</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
} 