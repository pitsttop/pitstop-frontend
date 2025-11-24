import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { 
  Home, 
  Users, 
  Car, 
  FileText, 
  Package, 
  Settings, 
  LogOut, 
  Wrench,
  Menu,
  User,
  Shield,
  ChevronDown
} from 'lucide-react'
import { toast } from 'sonner'


interface NavbarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'veiculos', label: 'Veículos', icon: Car },
  { id: 'ordens', label: 'Ordens de Serviço', icon: FileText },
  { id: 'pecas', label: 'Peças', icon: Package },
  { id: 'servicos', label: 'Serviços', icon: Settings },
  { id: 'criar-admin', label: 'Criar Administrador', icon: Shield },
]

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
      toast.success('Sessão encerrada com sucesso')
      setLogoutDialogOpen(false)
      setUserMenuOpen(false)
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      toast.error('Erro ao encerrar sessão')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={`space-y-2 ${mobile ? 'p-4' : ''}`}>
      {menuItems.map((item) => {
        const Icon = item.icon
        return (
          <Button
            key={item.id}
            variant={activeTab === item.id ? 'default' : 'ghost'}
            className={`w-full justify-start ${mobile ? 'h-12' : ''}`}
            data-testid={`admin-nav-${item.id}`}
            onClick={() => {
              onTabChange(item.id)
              if (mobile) setMobileMenuOpen(false)
            }}
          >
            <Icon className="mr-2 h-4 w-4" />
            {item.label}
          </Button>
        )
      })}
    </nav>
  )

  return (
    <>
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center">
              <img 
                src="/Pitstop.png" 
                alt="PitStop" 
                className="h-13 w-13 object-contain"
              />
              
            </div>
          </div>
          
          <div className="mt-8 flex-grow flex flex-col">
            <div className="flex-1 px-4 pb-4">
              <NavItems />
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="w-full flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center min-w-0">
                      <Avatar className="h-8 w-8 mr-3 flex-shrink-0">
                        <AvatarFallback>
                          {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left min-w-0">
                        <div className="text-sm font-medium truncate">{user?.name || 'Usuário'}</div>
                        <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                      </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 flex-shrink-0 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false)
                          setLogoutDialogOpen(true)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm flex items-center font-medium"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair da Conta
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <div className="flex items-center mb-8">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <Wrench className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <h2>Oficina Pro</h2>
                      <p className="text-sm text-gray-500">Sistema de Gestão</p>
                    </div>
                  </div>
                  <NavItems mobile />
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 h-12 font-medium"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        setLogoutDialogOpen(true)
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair da Conta
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              
              <div className="min-w-0">
                <h1 className="text-lg font-medium">
                  {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                </h1>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
              </button>

              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <div className="font-medium truncate">{user?.name || 'Usuário'}</div>
                    <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                  </div>
                  
                  <div className="border-t border-gray-200" />
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      setLogoutDialogOpen(true)
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm flex items-center font-medium"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair da Conta
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="w-96 max-w-[90vw]">
          <DialogHeader>
            <DialogTitle>Confirmar Saída</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja sair da sua conta? Você precisará fazer login novamente para acessar o sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setLogoutDialogOpen(false)}
              disabled={isLoggingOut}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleSignOut}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saindo...
                </div>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair da Conta
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}