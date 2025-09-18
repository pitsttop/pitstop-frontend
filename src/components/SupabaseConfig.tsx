import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { AlertCircle, Database, ExternalLink } from 'lucide-react'

interface SupabaseConfigProps {
  onConfigured: () => void
}

export function SupabaseConfig({ onConfigured }: SupabaseConfigProps) {
  const [projectId, setProjectId] = useState('')
  const [anonKey, setAnonKey] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if already configured
    const savedProjectId = localStorage.getItem('supabase_project_id')
    const savedAnonKey = localStorage.getItem('supabase_anon_key')
    
    if (savedProjectId && savedAnonKey) {
      setProjectId(savedProjectId)
      setAnonKey(savedAnonKey)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!projectId || !anonKey) {
      setError('Por favor, preencha todos os campos')
      return
    }

    // Basic validation
    if (projectId.length < 10) {
      setError('Project ID parece inválido')
      return
    }

    if (anonKey.length < 50) {
      setError('Anon Key parece inválida')
      return
    }

    // Save to localStorage and window object
    localStorage.setItem('supabase_project_id', projectId)
    localStorage.setItem('supabase_anon_key', anonKey)
    
    // Make available globally for the info.tsx file
    if (typeof window !== 'undefined') {
      (window as any).SUPABASE_PROJECT_ID = projectId
      (window as any).SUPABASE_ANON_KEY = anonKey
    }

    onConfigured()
  }

  const isConfigured = projectId && anonKey

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Database className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1>Configuração do Supabase</h1>
          <p className="text-gray-600">Configure suas credenciais do Supabase para continuar</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Credenciais do Projeto</CardTitle>
            <CardDescription>
              Você precisa de um projeto Supabase para usar este sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isConfigured && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Você precisa de um projeto Supabase. 
                  <a 
                    href="https://supabase.com/dashboard" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-1 text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    Criar projeto gratuito
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="projectId">Project ID</Label>
                <Input
                  id="projectId"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="abcdefghijklmnopqrst"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Encontre no dashboard do Supabase → Settings → General
                </p>
              </div>
              
              <div>
                <Label htmlFor="anonKey">Anon Key (Public)</Label>
                <Input
                  id="anonKey"
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Encontre no dashboard do Supabase → Settings → API
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Button type="submit" className="w-full">
                  {isConfigured ? 'Atualizar Configuração' : 'Configurar Supabase'}
                </Button>
                
                {isConfigured && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onConfigured}
                    className="w-full"
                  >
                    Continuar com Configuração Atual
                  </Button>
                )}
              </div>
            </form>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Como obter as credenciais:</h4>
              <ol className="text-xs text-gray-600 space-y-1">
                <li>1. Acesse <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">supabase.com/dashboard</a></li>
                <li>2. Crie um novo projeto (gratuito)</li>
                <li>3. Vá em Settings → General para o Project ID</li>
                <li>4. Vá em Settings → API para a Anon Key</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}