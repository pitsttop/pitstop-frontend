import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { AlertCircle, Shield, Plus, Check } from 'lucide-react'
import { Alert, AlertDescription } from './ui/alert'

export function CriarAdmin() {
  const { createAdmin, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!name) {
      setError('Nome é obrigatório')
      return
    }
    
    if (!email) {
      setError('Email é obrigatório')
      return
    }
    
    if (!password || password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres')
      return
    }
    
    const result = await createAdmin(email, password, name)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('Administrador criado com sucesso!')
      setEmail('')
      setPassword('')
      setName('')
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Criar Novo Administrador
        </h2>
        <p className="text-gray-600 mt-1">
          Crie uma nova conta de administrador para gerenciar o sistema
        </p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nova Conta Admin
          </CardTitle>
          <CardDescription>
            Preencha os dados para criar um novo administrador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="admin-name">Nome Completo</Label>
              <Input
                id="admin-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Nome do administrador"
              />
            </div>
            
            <div>
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@exemplo.com"
              />
            </div>
            
            <div>
              <Label htmlFor="admin-password">Senha</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="********"
                minLength={6}
              />
              <p className="text-sm text-gray-500 mt-1">
                Mínimo de 6 caracteres
              </p>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert>
                <Check className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Administrador'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}