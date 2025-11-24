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
  const [isSubmitting, setIsSubmitting] = useState(false) 

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

    setIsSubmitting(true)
    
    const result = await createAdmin(email, password, name)
    
    setIsSubmitting(false)

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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2" data-testid="admin-criar-admin-title">
          <Shield className="h-8 w-8 text-blue-600" />
          Criar Novo Administrador
        </h2>
        <p className="text-gray-600 mt-1">
          Adicione um novo membro à equipe com permissões de gerenciamento.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5 text-gray-500" />
            Dados da Conta
          </CardTitle>
          <CardDescription>
            O novo administrador terá acesso total ao painel de controle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="admin-name">Nome Completo</Label>
              <Input
                id="admin-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ex: Maria Silva"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email de Acesso</Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@pitstop.com"
              />
            </div>
            
            <div className="space-y-2">
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
              <p className="text-xs text-gray-500">
                Mínimo de 6 caracteres.
              </p>
            </div>
            
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <Check className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            <Button type="submit" className="w-full" disabled={loading || isSubmitting}>
              {isSubmitting ? 'Criando...' : 'Criar Administrador'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}