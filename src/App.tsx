import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { jwtDecode } from 'jwt-decode' // <-- MUDANÇA 1: Importa o decodificador
import { Login } from './components/Login'
import Landing from './components/Landing'
import { Navbar } from './components/Navbar'
import { ClienteNavbar } from './components/ClienteNavbar'
import { Dashboard } from './components/Dashboard'
import { ClienteDashboard } from './components/ClienteDashboard'
import { Agendamento } from './components/Agendamento'
import { AcompanhamentoServico } from './components/AcompanhamentoServico'
import { Clientes } from './components/Clientes'
import { Veiculos } from './components/Veiculos'
import { Ordens } from './components/Ordens'
import { Pecas } from './components/Pecas'
import { Servicos } from './components/Servicos'
import { CriarAdmin } from './components/CriarAdmin'
import { Toaster } from './components/ui/sonner'

// Helper: Define o formato do que está DENTRO da "pulseira" (JWT)
type JwtPayload = {
  userId: string;
  role: 'ADMIN' | 'CLIENT';
  // (adicione 'iat', 'exp' se precisar)
}

function AppContent() {
  // MUDANÇA 2: Pegamos o 'accessToken', e não o 'user'
  const { accessToken, loading } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  // MUDANÇA 3: Removemos o 'supabaseConfigured' (lixo antigo)

  // (O bloco de verificação do Supabase foi removido)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // --- MUDANÇA 4: O "PORTEIRO" CORRIGIDO ---
  
  // Se não tem "pulseira" (accessToken), mostra a Landing ou o Login quando o usuário clicar em Acessar.
  if (!accessToken) {
    return showLogin ? <Login onBack={() => setShowLogin(false)} /> : <Landing onAccess={() => setShowLogin(true)} />
  }

  // Se TEM a "pulseira", decodifica ela para saber quem é o usuário
  const user = jwtDecode<JwtPayload>(accessToken);

  // Agora podemos checar o cargo (role)
  const isAdmin = user?.role === 'ADMIN'
  
  // O resto do seu código já estava perfeito
  const renderAdminContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'clientes':
        return <Clientes />
      case 'veiculos':
        return <Veiculos />
      case 'ordens':
        return <Ordens />
      case 'pecas':
        return <Pecas />
      case 'servicos':
        return <Servicos />
      case 'criar-admin':
        return <CriarAdmin />
      default:
        return <Dashboard />
    }
  }

  const renderClienteContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ClienteDashboard onTabChange={setActiveTab} />
      case 'agendamento':
        return <Agendamento />
      case 'acompanhamento':
        return <AcompanhamentoServico />
      default:
        return <ClienteDashboard onTabChange={setActiveTab} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isAdmin ? (
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      ) : (
        <ClienteNavbar activeTab={activeTab} onTabChange={setActiveTab} />
      )}
      
      {/* Desktop Layout */}
      <div className="hidden md:block md:pl-64">
        <main className="min-h-screen">
          {isAdmin ? renderAdminContent() : renderClienteContent()}
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <main className="min-h-screen pt-16">
          {isAdmin ? renderAdminContent() : renderClienteContent()}
        </main>
      </div>

      <Toaster position="top-right" />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}