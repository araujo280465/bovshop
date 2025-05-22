'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '../supabaseClient'
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import ImageIcon from '@mui/icons-material/Image'

export default function LoteImagensList() {
  const router = useRouter()
  const [imagens, setImagens] = useState([])
  const [lotes, setLotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [currentImagem, setCurrentImagem] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [formData, setFormData] = useState({
    id_lote: '',
    path_image: '',
    image_type: '',
    created_at: new Date().toISOString(),
    altered_at: new Date().toISOString()
  })

  const [previewUrls, setPreviewUrls] = useState({})
  const [dialogPreviewUrl, setDialogPreviewUrl] = useState(null)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    console.log('LoteImagensList: Component mounted')
    console.log('LoteImagensList: Fetching data...')
    fetchImagens()
    fetchLotes()
  }, [router])

  useEffect(() => {
    const loadPreviews = async () => {
      const urls = {}
      for (const imagem of imagens) {
        if (imagem.path_image) {
          const url = await getImageUrl(imagem.path_image)
          urls[imagem.id] = url
        }
      }
      setPreviewUrls(urls)
    }
    loadPreviews()
  }, [imagens])

  useEffect(() => {
    const loadDialogPreview = async () => {
      if (currentImagem?.path_image) {
        const url = await getDialogPreviewUrl(currentImagem)
        setDialogPreviewUrl(url)
      } else {
        setDialogPreviewUrl(null)
      }
    }
    loadDialogPreview()
  }, [currentImagem])

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

  const fetchImagens = async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('lote_imagens')
      .select(`
        id,
        id_lote,
        path_image,
        image_type,
        created_at,
        altered_at,
        lote!id_lote(id_lote, tipo_animais)
      `)
      .order('id', { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setImagens(data)
    }
    setLoading(false)
  }

  const fetchLotes = async () => {
    const { data, error } = await supabase
      .from('lote')
      .select('id_lote, tipo_animais')
      .order('tipo_animais')
    
    if (error) {
      setError(error.message)
    } else {
      setLotes(data)
    }
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      setHasChanges(true)
      // Set a more descriptive image type based on file type
      const fileType = file.type.split('/')[0] // 'image' or 'video'
      const extension = file.name.split('.').pop().toLowerCase()
      
      if (fileType === 'image') {
        setFormData(prev => ({
          ...prev,
          image_type: 'Foto'
        }))
      } else if (fileType === 'video') {
        setFormData(prev => ({
          ...prev,
          image_type: 'Vídeo'
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          image_type: 'Documento'
        }))
      }
    }
  }

  const uploadImage = async (file) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${formData.id_lote}/${fileName}`

      console.log('Uploading file:', {
        fileName,
        filePath,
        fileType: file.type,
        fileSize: file.size
      })

      const { data, error: uploadError } = await supabase.storage
        .from('lote-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      console.log('Upload successful:', data)
      return filePath
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  const handleCreateClick = () => {
    setFormData({
      id_lote: '',
      path_image: '',
      image_type: '',
      created_at: new Date().toISOString(),
      altered_at: new Date().toISOString()
    })
    setSelectedFile(null)
    setOpenCreateDialog(true)
  }

  const handleEditClick = (imagem) => {
    setCurrentImagem(imagem)
    setFormData({
      id_lote: imagem.id_lote || '',
      path_image: imagem.path_image || '',
      image_type: imagem.image_type || '',
      created_at: imagem.created_at || new Date().toISOString(),
      altered_at: imagem.altered_at || new Date().toISOString()
    })
    setSelectedFile(null)
    setOpenEditDialog(true)
  }

  const handleDeleteClick = async (imagem) => {
    setCurrentImagem(imagem)
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
    setFormData({
      id_lote: '',
      path_image: '',
      image_type: '',
      created_at: new Date().toISOString(),
      altered_at: new Date().toISOString()
    })
    setSelectedFile(null)
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

  const handleInsert = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!selectedFile) {
        throw new Error('Por favor, selecione uma imagem')
      }

      if (!formData.id_lote) {
        throw new Error('Por favor, selecione um lote')
      }

      // Upload the image first
      const filePath = await uploadImage(selectedFile)

      // Get current local date and time from machine
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      
      // Create ISO string with local time without timezone
      const localISOString = `${year}-${month}-${day}T${hours}:${minutes}:00.000`
      console.log('Local date and time:', localISOString)

      const insertData = {
        ...formData,
        path_image: filePath,
        created_at: localISOString,
        altered_at: localISOString
      }

      console.log('Inserting data:', insertData)

      const { data, error } = await supabase
        .from('lote_imagens')
        .insert([insertData])
        .select()

      if (error) {
        console.error('Insert error:', error)
        throw error
      }

      console.log('Insert success:', data)
      setHasChanges(false) // Reset changes before closing
      handleCloseDialog()
      fetchImagens()
    } catch (error) {
      console.error('Error in handleInsert:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let filePath = formData.path_image

      // If a new file was selected, upload it
      if (selectedFile) {
        // Delete the old file
        if (currentImagem.path_image) {
          const { error: deleteError } = await supabase.storage
            .from('lote-images')
            .remove([currentImagem.path_image])

          if (deleteError) throw deleteError
        }

        // Upload the new file
        filePath = await uploadImage(selectedFile)
      }

      // Get current local date and time from machine
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      
      // Create ISO string with local time without timezone
      const localISOString = `${year}-${month}-${day}T${hours}:${minutes}:00.000`

      const updateData = {
        ...formData,
        path_image: filePath,
        altered_at: localISOString
      }

      console.log('Updating data:', updateData)

      const { data, error } = await supabase
        .from('lote_imagens')
        .update(updateData)
        .eq('id', currentImagem.id)
        .select()

      if (error) {
        console.error('Update error:', error)
        throw error
      }

      console.log('Update success:', data)
      setHasChanges(false) // Reset changes before closing
      handleCloseDialog()
      fetchImagens()
    } catch (error) {
      console.error('Error in handleEditSubmit:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      // Delete the file from storage
      if (currentImagem.path_image) {
        const { error: deleteError } = await supabase.storage
          .from('lote-images')
          .remove([currentImagem.path_image])

        if (deleteError) throw deleteError
      }

      // Delete the record from the database
      const { error } = await supabase
        .from('lote_imagens')
        .delete()
        .eq('id', currentImagem.id)

      if (error) throw error

      setOpenDeleteDialog(false)
      fetchImagens()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = async (path) => {
    if (!path) return null
    try {
      const { data, error } = await supabase.storage
        .from('lote-images')
        .createSignedUrl(path, 3600) // URL valid for 1 hour

      if (error) {
        console.error('Error getting signed URL:', error)
        return null
      }

      console.log('Generated signed URL for path:', path, 'URL:', data.signedUrl)
      return data.signedUrl
    } catch (error) {
      console.error('Error getting image URL:', error)
      return null
    }
  }

  const getDialogPreviewUrl = async (imagem) => {
    if (!imagem?.path_image) return null
    try {
      const { data, error } = await supabase.storage
        .from('lote-images')
        .createSignedUrl(imagem.path_image, 3600)

      if (error) {
        console.error('Error getting signed URL for dialog:', error)
        return null
      }

      return data.signedUrl
    } catch (error) {
      console.error('Error getting dialog preview URL:', error)
      return null
    }
  }

  const renderPreview = async (imagem) => {
    if (!imagem.path_image) {
      console.log('No path_image for imagem:', imagem)
      return null
    }

    const url = await getImageUrl(imagem.path_image)
    console.log('Rendering preview for:', imagem.path_image, 'URL:', url, 'Type:', imagem.image_type)

    if (!url) {
      return (
        <Box
          sx={{
            width: 100,
            height: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.200',
            borderRadius: 1
          }}
        >
          <Typography variant="body2" color="error">
            Erro ao carregar
          </Typography>
        </Box>
      )
    }

    const fileType = imagem.image_type.toLowerCase()

    if (fileType === 'vídeo') {
      return (
        <video
          controls
          style={{ width: 100, height: 100, objectFit: 'cover' }}
        >
          <source src={url} type={`video/${imagem.path_image.split('.').pop()}`} />
          Seu navegador não suporta o elemento de vídeo.
        </video>
      )
    } else if (fileType === 'foto') {
      return (
        <img
          src={url}
          alt="Imagem do lote"
          style={{ width: 100, height: 100, objectFit: 'cover' }}
          onError={(e) => {
            console.error('Error loading image:', url)
            e.target.onerror = null
            e.target.src = 'https://via.placeholder.com/100?text=Erro'
          }}
        />
      )
    } else {
      return (
        <Box
          sx={{
            width: 100,
            height: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.200',
            borderRadius: 1
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {imagem.image_type}
          </Typography>
        </Box>
      )
    }
  }

  const renderDialogPreview = (imagem) => {
    if (!imagem?.path_image) return null

    const fileType = imagem.image_type.toLowerCase()

    if (fileType === 'vídeo') {
      return (
        <video
          controls
          style={{ width: '100%', maxHeight: 200 }}
        >
          <source src={dialogPreviewUrl} type={`video/${imagem.path_image.split('.').pop()}`} />
          Seu navegador não suporta o elemento de vídeo.
        </video>
      )
    } else if (fileType === 'foto') {
      return (
        <img
          src={dialogPreviewUrl}
          alt="Preview"
          style={{ width: '100%', maxHeight: 200, objectFit: 'contain' }}
          onError={(e) => {
            console.error('Error loading dialog preview:', dialogPreviewUrl)
            e.target.onerror = null
            e.target.src = 'https://via.placeholder.com/400x200?text=Erro'
          }}
        />
      )
    } else {
      return (
        <Box
          sx={{
            width: '100%',
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.200',
            borderRadius: 1
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {imagem.image_type}
          </Typography>
        </Box>
      )
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    
    // Parse the ISO string directly
    const [datePart, timePart] = dateString.split('T')
    const [year, month, day] = datePart.split('-')
    const [hours, minutes] = timePart.split(':')
    
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        Imagens de Lotes
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleCreateClick}>
          <AddIcon />
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

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
              <TableCell sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>ID</TableCell>
              <TableCell sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>Lote</TableCell>
              <TableCell sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>Arquivo</TableCell>
              <TableCell sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>Tipo</TableCell>
              <TableCell sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>Criado em</TableCell>
              <TableCell sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>Alterado em</TableCell>
              <TableCell sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {imagens.map((imagem) => (
              <TableRow key={imagem.id}>
                <TableCell>{imagem.id}</TableCell>
                <TableCell>{imagem.lote?.tipo_animais || imagem.id_lote}</TableCell>
                <TableCell>
                  {previewUrls[imagem.id] ? (
                    imagem.image_type.toLowerCase() === 'vídeo' ? (
                      <video
                        controls
                        style={{ width: 100, height: 100, objectFit: 'cover' }}
                      >
                        <source src={previewUrls[imagem.id]} type={`video/${imagem.path_image.split('.').pop()}`} />
                        Seu navegador não suporta o elemento de vídeo.
                      </video>
                    ) : imagem.image_type.toLowerCase() === 'foto' ? (
                      <img
                        src={previewUrls[imagem.id]}
                        alt="Imagem do lote"
                        style={{ width: 100, height: 100, objectFit: 'cover' }}
                        onError={(e) => {
                          console.error('Error loading image:', previewUrls[imagem.id])
                          e.target.onerror = null
                          e.target.src = 'https://via.placeholder.com/100?text=Erro'
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 100,
                          height: 100,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'grey.200',
                          borderRadius: 1
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {imagem.image_type}
                        </Typography>
                      </Box>
                    )
                  ) : (
                    <Box
                      sx={{
                        width: 100,
                        height: 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.200',
                        borderRadius: 1
                      }}
                    >
                      <CircularProgress size={20} />
                    </Box>
                  )}
                </TableCell>
                <TableCell>{imagem.image_type}</TableCell>
                <TableCell>{formatDate(imagem.created_at)}</TableCell>
                <TableCell>{formatDate(imagem.altered_at)}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditClick(imagem)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteClick(imagem)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
        <DialogTitle>Nova Imagem</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Lote</InputLabel>
              <Select
                name="id_lote"
                value={formData.id_lote || ''}
                onChange={handleInputChange}
                label="Lote"
              >
                {lotes.map((lote) => (
                  <MenuItem key={lote.id_lote} value={lote.id_lote}>
                    {lote.tipo_animais}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              component="label"
              startIcon={<ImageIcon />}
              fullWidth
              sx={{ mb: 2 }}
            >
              Selecionar Arquivo
              <input
                type="file"
                hidden
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={handleFileSelect}
              />
            </Button>
            {selectedFile && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Arquivo selecionado: {selectedFile.name}
                </Typography>
                {selectedFile.type.startsWith('image/') && (
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    style={{ width: '100%', maxHeight: 200, objectFit: 'contain' }}
                  />
                )}
                {selectedFile.type.startsWith('video/') && (
                  <video
                    controls
                    style={{ width: '100%', maxHeight: 200 }}
                  >
                    <source src={URL.createObjectURL(selectedFile)} type={selectedFile.type} />
                    Seu navegador não suporta o elemento de vídeo.
                  </video>
                )}
              </Box>
            )}
            <TextField
              fullWidth
              label="Tipo do Arquivo"
              name="image_type"
              value={formData.image_type}
              onChange={handleInputChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancelar</Button>
          <Button onClick={handleInsert} color="primary">Salvar</Button>
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
        <DialogTitle>Editar Imagem</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Lote</InputLabel>
              <Select
                name="id_lote"
                value={formData.id_lote || ''}
                onChange={handleInputChange}
                label="Lote"
              >
                {lotes.map((lote) => (
                  <MenuItem key={lote.id_lote} value={lote.id_lote}>
                    {lote.tipo_animais}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {currentImagem?.path_image && (
              <Box sx={{ mb: 2 }}>
                {dialogPreviewUrl ? (
                  renderDialogPreview(currentImagem)
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.200',
                      borderRadius: 1
                    }}
                  >
                    <CircularProgress size={30} />
                  </Box>
                )}
              </Box>
            )}
            <Button
              variant="outlined"
              component="label"
              startIcon={<ImageIcon />}
              fullWidth
              sx={{ mb: 2 }}
            >
              Alterar Arquivo
              <input
                type="file"
                hidden
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={handleFileSelect}
              />
            </Button>
            {selectedFile && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Novo arquivo: {selectedFile.name}
                </Typography>
                {selectedFile.type.startsWith('image/') && (
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    style={{ width: '100%', maxHeight: 200, objectFit: 'contain' }}
                  />
                )}
                {selectedFile.type.startsWith('video/') && (
                  <video
                    controls
                    style={{ width: '100%', maxHeight: 200 }}
                  >
                    <source src={URL.createObjectURL(selectedFile)} type={selectedFile.type} />
                    Seu navegador não suporta o elemento de vídeo.
                  </video>
                )}
              </Box>
            )}
            <TextField
              fullWidth
              label="Tipo do Arquivo"
              name="image_type"
              value={formData.image_type}
              onChange={handleInputChange}
            />
          </Box>
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
          <Typography>
            Tem certeza que deseja excluir este arquivo?
          </Typography>
          {currentImagem?.path_image && (
            <Box sx={{ mt: 2 }}>
              {dialogPreviewUrl ? (
                renderDialogPreview(currentImagem)
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.200',
                    borderRadius: 1
                  }}
                >
                  <CircularProgress size={30} />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleDeleteSubmit} variant="contained" color="error">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
} 