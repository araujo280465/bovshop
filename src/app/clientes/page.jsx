import dynamic from 'next/dynamic'

const ClienteList = dynamic(() => import('../../components/ClienteList'), {
  ssr: false
})

export default function ClientesPage() {
  return <ClienteList />
} 