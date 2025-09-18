import { useEffect, useState } from 'react'
import { useApi, DashboardStats } from '../hooks/useApi'
import { useAuth } from '../hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { 
  Users, 
  Car, 
  FileText, 
  Package, 
  Settings, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  User
} from 'lucide-react'

export function Dashboard() {
  const { getDashboardStats, loading } = useApi()
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await getDashboardStats()
      setStats(data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  if (loading || !stats) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu negócio</p>
      </div>

      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalClientes}</div>
            <p className="text-xs text-muted-foreground">
              Clientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Veículos</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalVeiculos}</div>
            <p className="text-xs text-muted-foreground">
              Veículos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Ordens de Serviço</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalOrdens}</div>
            <p className="text-xs text-muted-foreground">
              Total de ordens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{formatCurrency(stats.receita)}</div>
            <p className="text-xs text-muted-foreground">
              Ordens concluídas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cards de Status das Ordens */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Ordens Abertas</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-orange-600">{stats.ordensAbertas}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando início
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-600">{stats.ordensAndamento}</div>
            <p className="text-xs text-muted-foreground">
              Sendo executadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{stats.ordensConcluidas}</div>
            <p className="text-xs text-muted-foreground">
              Finalizadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cards de Inventário */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Estoque de Peças</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalPecas}</div>
            <p className="text-xs text-muted-foreground">
              Tipos de peças cadastradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Serviços Disponíveis</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalServicos}</div>
            <p className="text-xs text-muted-foreground">
              Tipos de serviços
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Rápido */}
      <Card>
        <CardHeader>
          <CardTitle>Status das Operações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              {stats.ordensAbertas} Ordens Abertas
            </Badge>
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              {stats.ordensAndamento} Em Andamento
            </Badge>
            <Badge variant="outline" className="text-green-600 border-green-200">
              {stats.ordensConcluidas} Concluídas
            </Badge>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>
              Taxa de conclusão: {stats.totalOrdens > 0 
                ? Math.round((stats.ordensConcluidas / stats.totalOrdens) * 100) 
                : 0}%
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}