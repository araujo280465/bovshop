import { Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import About from './pages/About'
import UsuarioList from './pages/UsuarioList'
import ClienteList from './pages/ClienteList'
import LoteList from './pages/LoteList'

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/usuarios" element={<UsuarioList />} />
          <Route path="/clientes" element={<ClienteList />} />
          <Route path="/lotes" element={<LoteList />} />
        </Routes>
      </Box>
    </Box>
  )
}

export default App 