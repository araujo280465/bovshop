'use client'

import React from 'react'
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  const menuItems = [
    { path: '/', label: 'Home' },
    { path: '/lotes', label: 'Lotes' },
    { path: '/clientes', label: 'Clientes' },
    { path: '/usuarios', label: 'Usuários' },
    { path: '/sobre', label: 'Sobre' }
  ]

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Sistema de Gestão
        </Typography>
        <Box>
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              style={{ textDecoration: 'none' }}
            >
              <Button 
                color="inherit"
                sx={{ 
                  mx: 1,
                  backgroundColor: pathname === item.path ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                }}
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  )
} 