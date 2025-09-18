import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { AlertCircle, Wrench, Shield, User, Info } from 'lucide-react'
import { Alert, AlertDescription } from './ui/alert'

export function Login() {
  const { signIn, signUp, loading, hasAdmins } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [userType, setUserType] = useState<'admin' | 'cliente'>('cliente')
  const [error, setError] = useState('')

  // Reset userType to cliente if admins exist and user had selected admin
  useEffect(() => {
    if (hasAdmins && userType === 'admin') {
      setUserType('cliente')
    }
  }, [hasAdmins, userType])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const result = await signIn(email, password, userType)
    if (result.error) {
      setError(result.error)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!name) {
      setError('Nome é obrigatório')
      return
    }
    
    // If there are already admins and user is trying to create admin account, show error
    if (hasAdmins && userType === 'admin') {
      setError('Apenas administradores existentes podem criar contas de administrador')
      return
    }
    
    const result = await signUp(email, password, name, userType)
    if (result.error) {
      setError(result.error)
    }
  }

  const canCreateAdmin = hasAdmins === false || hasAdmins === null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Wrench className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1>Sistema de Gestão de Oficina</h1>
          <p className="text-gray-600">Gerencie clientes, veículos e ordens de serviço</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acesso ao Sistema</CardTitle>
            <CardDescription>
              Entre com sua conta ou crie uma nova
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Registrar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="userType">Tipo de Acesso</Label>
                    <Select value={userType} onValueChange={(value) => setUserType(value as 'admin' | 'cliente')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de acesso" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cliente">
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            Cliente
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center">
                            <Shield className="mr-2 h-4 w-4" />
                            Administrador
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="********"
                    />
                  </div>
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Entrando...' : `Entrar como ${userType === 'admin' ? 'Administrador' : 'Cliente'}`}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  {hasAdmins && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Novas contas serão criadas como Cliente. Apenas administradores podem criar outras contas de administrador.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div>
                    <Label htmlFor="signup-userType">Tipo de Acesso</Label>
                    <Select value={userType} onValueChange={(value) => setUserType(value as 'admin' | 'cliente')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de acesso" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cliente">
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            Cliente
                          </div>
                        </SelectItem>
                        {canCreateAdmin && (
                          <SelectItem value="admin">
                            <div className="flex items-center">
                              <Shield className="mr-2 h-4 w-4" />
                              Administrador {hasAdmins === false && '(Primeiro usuário)'}
                            </div>
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="signup-name">Nome</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="********"
                      minLength={6}
                    />
                  </div>
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Criando conta...' : `Criar conta como ${userType === 'admin' ? 'Administrador' : 'Cliente'}`}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}