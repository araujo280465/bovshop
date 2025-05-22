import dynamic from 'next/dynamic'

const UsuarioList = dynamic(() => import('../../components/UsuarioList'), {
  ssr: false
})

export default function UsuariosPage() {
  return <UsuarioList />
} 