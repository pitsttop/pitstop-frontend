import { useAuth } from '../hooks/useAuth'
import { useEffect, useState } from 'react'
import api from '../services/api'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { 
  Calendar, 
  Calculator, 
  Eye,
  User,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface ClienteDashboardProps {
  onTabChange: (tab: string) => void
}

export function ClienteDashboard({ onTabChange }: ClienteDashboardProps) {
  const { user } = useAuth()

  const quickActions = [
    {
      id: 'agendamento',
      title: 'Agendar Serviço',
      description: 'Marque um horário para levar seu veículo',
      icon: Calendar,
      color: 'from-blue-500 to-blue-600'
    },
    
    {
      id: 'acompanhamento',
      title: 'Acompanhar Serviços',
      description: 'Veja o status dos seus serviços',
      icon: Eye,
      color: 'from-purple-500 to-purple-600'
    }
  ]

  const recentServices = [
    {
      id: 1,
      numero: 'OS-2024001',
      veiculo: 'Civic 2020',
      servico: 'Troca de óleo',
      status: 'concluida',
      data: '2024-01-15'
    },
    {
      id: 2,
      numero: 'OS-2024002',
      veiculo: 'Civic 2020',
      servico: 'Revisão dos freios',
      status: 'andamento',
      data: '2024-01-20'
    }
  ]

  const [services, setServices] = useState<any[]>([])
  const [loadingServices, setLoadingServices] = useState(false)

  useEffect(() => {
    const fetchServices = async () => {
      if (!user) return
      setLoadingServices(true)
      // try a few endpoints to fetch services for this user
      try {
        const r1 = await api.get('/me/services')
        setServices(r1.data || [])
        setLoadingServices(false)
        return
      } catch (e) {}

      try {
        const r2 = await api.get(`/users/${user.id}/services`)
        setServices(r2.data || [])
        setLoadingServices(false)
        return
      } catch (e) {}

      try {
        const r3 = await api.get(`/services?userId=${user.id || user.userId}`)
        setServices(r3.data || [])
        setLoadingServices(false)
        return
      } catch (e) {
        console.warn('ClienteDashboard: não foi possível carregar serviços recentes', e)
      }

      setLoadingServices(false)
    }

    fetchServices()
  }, [user])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluida':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'andamento':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'concluida':
        return 'Concluída'
      case 'andamento':
        return 'Em Andamento'
      case 'aberta':
        return 'Aguardando'
      default:
        return 'Desconhecido'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Portal do Cliente</h1>
        <p className="text-gray-600">Gerencie seus serviços e agendamentos</p>
      </div>

      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-medium mb-1">
                Bem-vindo, {user?.name || 'Cliente'}!
              </h3>
              <p className="text-green-100">
                {user?.email}
              </p>
              <p className="text-green-100 text-sm mt-2">
                ⚡ Acesse rapidamente nossos serviços abaixo
              </p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <User className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Card key={action.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onTabChange(action.id)}>
                <CardContent className="p-6">
                  <div className={`bg-gradient-to-r ${action.color} p-3 rounded-lg w-fit mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-2">{action.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{action.description}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Acessar
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Recent Services */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2>Serviços Recentes</h2>
          <Button variant="outline" size="sm" onClick={() => onTabChange('acompanhamento')}>
            Ver Todos
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Últimos Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingServices ? (
              <div className="text-center py-8 text-gray-500">Carregando serviços...</div>
            ) : services.length > 0 ? (
              <div className="space-y-4">
                {services.map((service: any) => (
                  <div key={service.id || service.numero} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(service.status)}
                      <div>
                        <div className="font-medium">{service.numero || service.orderNumber || service.id}</div>
                        <div className="text-sm text-gray-600">{service.veiculo || service.vehicle || service.carModel} - {service.servico || service.service || service.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{getStatusText(service.status)}</div>
                      <div className="text-xs text-gray-500">{service.data || service.date || service.createdAt}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum serviço encontrado</p>
                <p className="text-sm">Agende seu primeiro serviço!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-blue-900 mb-2">Dicas Importantes</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Agende seus serviços com antecedência</li>
                <li>• Use a calculadora para estimar custos</li>
                <li>• Acompanhe o status em tempo real</li>
                <li>• Mantenha seus dados sempre atualizados</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}