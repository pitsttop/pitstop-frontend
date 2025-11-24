import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from './ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog'
import { 
  Home, 
  Calendar, 
  Calculator, 
  Eye,
  LogOut, 
  Wrench,
  Menu,
  User
} from 'lucide-react'
import { toast } from 'sonner'

interface ClienteNavbarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'agendamento', label: 'Agendar Serviço', icon: Calendar },
  { id: 'acompanhamento', label: 'Acompanhar Serviço', icon: Eye },
]

function NavItems({ mobile = false, onTabChange, activeTab }: { mobile?: boolean; onTabChange: (tab: string) => void; activeTab: string }) {
  return (
    <nav className={mobile ? 'space-y-2' : 'space-y-1'}>
      {menuItems.map((item) => {
        const Icon = item.icon
        const isActive = activeTab === item.id
        return (
          <Button
            key={item.id}
            variant={isActive ? "secondary" : "ghost"}
            className={`w-full justify-start ${mobile ? 'h-12' : ''} ${
              isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''
            }`}
            data-testid={`client-nav-${item.id}`}
            onClick={() => onTabChange(item.id)}
          >
            <Icon className="mr-2 h-4 w-4" />
            {item.label}
          </Button>
        )
      })}
    </nav>
  )
}

export function ClienteNavbar({ activeTab, onTabChange }: ClienteNavbarProps) {
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

  return (
    <div>
      {/* Desktop Sidebar */}
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
              <NavItems onTabChange={onTabChange} activeTab={activeTab} />
              
              {/* User Profile Section - Desktop */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="w-full flex items-center justify-between p-2 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center min-w-0">
                      <Avatar className="h-8 w-8 mr-3 flex-shrink-0">
                        <AvatarFallback className="bg-green-100 text-green-700">
                          {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left min-w-0">
                        <div className="text-sm font-medium truncate">{user?.name || 'Cliente'}</div>
                        <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                      </div>
                    </div>
                    <User className="h-4 w-4 flex-shrink-0" />
                  </button>

                  {/* User Menu Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      
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

                {/* Logout Dialog */}
                <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
                  <AlertDialogContent className="z-[200]">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Saída</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja sair da sua conta? Você precisará fazer login novamente para acessar o sistema.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isLoggingOut}>
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleSignOut}
                        disabled={isLoggingOut}
                        className="bg-red-600 hover:bg-red-700"
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
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <div className="flex items-center mb-8">
                    <div className="bg-green-600 p-2 rounded-lg">
                      <Wrench className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <h2>Portal do Cliente</h2>
                      <p className="text-sm text-gray-500">Oficina Pro</p>
                    </div>
                  </div>
                  <NavItems mobile onTabChange={onTabChange} activeTab={activeTab} />
                  
                  {/* Mobile Quick Logout */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 h-12"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Trocar de Conta
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Saída</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja sair da sua conta? Você precisará fazer login novamente para acessar o sistema.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isLoggingOut}>
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleSignOut}
                            disabled={isLoggingOut}
                            className="bg-red-600 hover:bg-red-700"
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
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </SheetContent>
              </Sheet>
              
              <div className="ml-4">
                <h1 className="text-lg">
                  {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                </h1>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-green-50">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-green-100 text-green-700">
                      {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 z-[100]" sideOffset={8}>
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium truncate">{user?.name || 'Cliente'}</div>
                  <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                </div>
                <DropdownMenuSeparator />
                <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem 
                      className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                      onSelect={(e) => {
                        e.preventDefault()
                        setLogoutDialogOpen(true)
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair da Conta
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="z-[200]">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Saída</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja sair da sua conta? Você precisará fazer login novamente para acessar o sistema.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isLoggingOut}>
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleSignOut}
                        disabled={isLoggingOut}
                        className="bg-red-600 hover:bg-red-700"
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
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}