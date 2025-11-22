import { useEffect, useMemo, useState } from 'react'
import { type ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import {
  Calendar,
  Eye,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  CalendarClock,
} from 'lucide-react'

interface ServiceStatusOption {
  matcher: (status: string) => boolean
  label: string
  icon: () => ReactNode
}

interface PreparedServiceItem {
  id: string
  statusLabel: string
  statusRaw: string
  statusIcon: ReactNode
  createdAt: Date
  vehicleLabel: string
  serviceName?: string
  scheduledFor?: Date | null
  note?: string
  actions?: {
    label: string
    onClick?: () => void
  }[]
}

const APPOINTMENTS_STORAGE_KEY = 'pitstop:clientAppointments'

const SERVICE_STATUS_OPTIONS: ServiceStatusOption[] = [
  {
    matcher: (status) => status.includes('scheduled') || status.includes('agend'),
    label: 'Agendado',
    icon: () => <Calendar className="h-4 w-4 text-blue-600" />,
  },
  {
    matcher: (status) => status.includes('finished') || status.includes('concluída') || status.includes('concluido'),
    label: 'Concluído',
    icon: () => <CheckCircle className="h-4 w-4 text-green-600" />,
  },
  {
    matcher: (status) => status.includes('progress') || status.includes('andamento'),
    label: 'Em Andamento',
    icon: () => <Clock className="h-4 w-4 text-yellow-600" />,
  },
  {
    matcher: () => true,
    label: 'Aguardando',
    icon: () => <AlertCircle className="h-4 w-4 text-gray-600" />,
  },
]

const parseDate = (value: unknown): Date | null => {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  const parsed = new Date(value as any)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const buildVehicleLabel = (raw: any): string => {
  if (!raw || typeof raw !== 'object') return 'Veículo'
  const brand = raw.brand ?? raw.marca ?? raw.make ?? ''
  const model = raw.model ?? raw.modelo ?? raw.nome ?? ''
  const plate = raw.plate ?? raw.placa ?? ''
  return [brand || model ? `${brand} ${model}`.trim() : 'Veículo', plate ? `(${plate})` : ''].join(' ').trim()
}

const normalizeSchedule = (raw: any): PreparedServiceItem | null => {
  if (!raw) return null

  const id = raw.id ?? raw.agendamentoId ?? raw.bookingId ?? raw.numero ?? raw.uuid ?? raw._id
  if (!id) return null

  const statusRaw = (raw.status?.name ?? raw.status ?? raw.situacao ?? raw.state ?? '').toString()
  const statusNormalized = statusRaw.toLowerCase()

  const statusOption = SERVICE_STATUS_OPTIONS.find((option) => option.matcher(statusNormalized)) ?? SERVICE_STATUS_OPTIONS[SERVICE_STATUS_OPTIONS.length - 1]

  const createdAtDate = parseDate(
    raw.createdAt ?? raw.dataAgendamento ?? raw.startDate ?? raw.data ?? raw.agendadoPara ?? raw.start_at,
  ) ?? new Date()

  const scheduledDate = parseDate(
    raw.scheduledFor ?? raw.scheduledAt ?? raw.dataMarcada ?? raw.dataAgendada ?? raw.dataAgendamento ?? raw.startDate,
  )

  const vehicleLabel = buildVehicleLabel(raw.vehicle ?? raw.veiculo ?? raw.vehicleInfo ?? raw.car)
  const serviceName = raw.service?.name ?? raw.serviceName ?? raw.servico ?? raw.description ?? raw.title

  return {
    id: String(id),
    statusLabel: statusOption.label,
    statusRaw,
    statusIcon: statusOption.icon(),
    createdAt: createdAtDate,
    vehicleLabel,
    serviceName: serviceName ? String(serviceName) : undefined,
    scheduledFor: scheduledDate,
  }
}

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

  const [scheduleItems, setScheduleItems] = useState<PreparedServiceItem[]>([])
  const [loadingSchedules, setLoadingSchedules] = useState(false)

  const recentSchedules = useMemo(() => scheduleItems.slice(0, 5), [scheduleItems])

  const formatDateTime = (date?: Date | null) => {
    if (!date) return null
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  useEffect(() => {
    const rawUserId = user?.id ?? user?.userId ?? user?.clientId ?? user?.clienteId

    if (!user || !rawUserId) {
      setScheduleItems([])
      setLoadingSchedules(false)
      return
    }

    const currentUserId = String(rawUserId)

    const loadSchedulesFromStorage = () => {
      setLoadingSchedules(true)
      try {
        const raw = localStorage.getItem(APPOINTMENTS_STORAGE_KEY)
        if (!raw) {
          setScheduleItems([])
          return
        }

        let parsed: any[] = []
        try {
          const data = JSON.parse(raw)
          parsed = Array.isArray(data) ? data : []
        } catch (error) {
          console.error('[ClienteDashboard] Não foi possível interpretar os agendamentos salvos.', error)
        }

        const filtered = parsed.filter((item) => {
          if (!item) return false
          const candidateId = item.userId ?? item.clientId ?? item.clienteId
          return candidateId ? String(candidateId) === currentUserId : false
        })

        const normalized = filtered
          .map(normalizeSchedule)
          .filter((item): item is PreparedServiceItem => Boolean(item))
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

        setScheduleItems(normalized)
      } finally {
        setLoadingSchedules(false)
      }
    }

    loadSchedulesFromStorage()

    const handleCustomUpdate = () => loadSchedulesFromStorage()
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key && event.key !== APPOINTMENTS_STORAGE_KEY) {
        return
      }
      loadSchedulesFromStorage()
    }

    window.addEventListener('pitstop:appointments-updated', handleCustomUpdate)
    window.addEventListener('storage', handleStorageEvent)

    return () => {
      window.removeEventListener('pitstop:appointments-updated', handleCustomUpdate)
      window.removeEventListener('storage', handleStorageEvent)
    }
  }, [user])

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
        <h2 className="mb-4 text-xl font-semibold">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Card key={action.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onTabChange(action.id)}>
                <CardContent className="p-6">
                  <div className={`bg-gradient-to-r ${action.color} p-3 rounded-lg w-fit mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-2 font-medium">{action.title}</h3>
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

      {/* Recent Appointments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Agendamentos Recentes</h2>
          <Button variant="outline" size="sm" onClick={() => onTabChange('acompanhamento')}>
            Ver Todos
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Últimos Agendamentos</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSchedules ? (
              <div className="text-center py-8 text-gray-500 flex flex-col items-center">
                <Clock className="h-8 w-8 animate-spin text-blue-500 mb-2"/>
                Carregando agendamentos...
              </div>
            ) : recentSchedules.length > 0 ? (
              <div className="space-y-4">
                {recentSchedules.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100">
                        {item.statusIcon}
                      </span>
                      <div>
                        <div className="font-medium">
                          {item.serviceName || 'Serviço agendado'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {item.vehicleLabel}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-1 space-x-1">
                          <CalendarClock className="h-3 w-3" />
                          <span>
                            {formatDateTime(item.scheduledFor ?? item.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {item.statusLabel}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum agendamento encontrado</p>
                <p className="text-sm">Use o botão acima para agendar seu primeiro serviço.</p>
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
              <h3 className="text-blue-900 mb-2 font-medium">Dicas Importantes</h3>
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