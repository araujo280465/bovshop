import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          BovShop
        </Typography>
        <Box>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
          >
            Home
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/about"
          >
            Sobre
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/usuarios"
          >
            Usuários
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/clientes"
          >
            Clientes
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/lotes"
          >
            Lotes
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar 