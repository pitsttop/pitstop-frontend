import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth' // Caminho ajustado
import api from '../services/api' // Caminho ajustado

import { Card, CardContent, CardHeader, CardTitle } from './ui/card' // Caminho ajustado
import { Input } from './ui/input' // Caminho ajustado
import { Label } from './ui/label' // Caminho ajustado
import { Badge } from './ui/badge' // Caminho ajustado
import { Progress } from './ui/progress' // Caminho ajustado
import { Alert, AlertDescription } from './ui/alert' // Caminho ajustado

import {
  Search,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Car,
  Calendar,
  Phone,
  Wrench,
  Package,
  DollarSign
} from 'lucide-react'

// --- DEFINIÇÕES E INTERFACES (Omitidas para brevidade, mas devem estar no arquivo) ---

// Interface Order e funções SIMULATE_PROGRESS e TimelineStep omitidas para brevidade
// Assume-se que você manteve o código anterior para essas partes.
interface Order {
  id: string
  number: string 
  description: string
  status: 'OPEN' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELED'
  totalValue?: number
  startDate: string
  endDate?: string | null
  observations: string | null
  vehicle: { model: string; plate: string; }
  servicesPerformed: Array<{ id: string; service: { name: string } }>
  progressoSimulado: number
}
// Função de simulação (SIMULATE_PROGRESS)
const SIMULATE_PROGRESS = (status: string) => {
  switch (status) {
    case 'OPEN': return 10
    case 'IN_PROGRESS': return 50
    case 'FINISHED': case 'CANCELED': return 100
    default: return 0
  }
}
// ----------------------------------------------------------------------

const ORDER_STATUS_VALUES: Order['status'][] = ['OPEN', 'IN_PROGRESS', 'FINISHED', 'CANCELED']

const normalizeStatus = (status: unknown): Order['status'] => {
  const value = typeof status === 'string' ? status.toUpperCase() : ''
  return ORDER_STATUS_VALUES.includes(value as Order['status'])
    ? (value as Order['status'])
    : 'OPEN'
}

const extractOrderList = (payload: unknown): any[] => {
  if (Array.isArray(payload)) return payload
  if (payload && typeof payload === 'object') {
    const data = payload as Record<string, unknown>
    const candidateKeys = ['orders', 'ordens', 'items', 'data', 'results', 'content', 'values']
    for (const key of candidateKeys) {
      const value = data[key]
      if (Array.isArray(value)) {
        return value
      }
    }
  }
  return []
}

const toIsoOrNull = (value: unknown): string | null => {
  if (!value) return null
  const date = new Date(value as any)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

const parseNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined) return undefined
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

const normalizeOrder = (raw: any): Order | null => {
  if (!raw) return null

  const id = raw.id ?? raw.orderId ?? raw.uuid ?? raw._id
  if (!id) return null

  const numberValue = raw.number ?? raw.numero ?? raw.orderNumber ?? `OS-${String(id).slice(-6)}`
  const descriptionValue = raw.description ?? raw.descricao ?? raw.serviceDescription ?? ''
  const statusValue = raw.status?.name ?? raw.status ?? raw.situacao
  const startDateIso = toIsoOrNull(raw.startDate ?? raw.createdAt ?? raw.dataInicio ?? raw.inicio)
  if (!startDateIso) return null
  const endDateIso = toIsoOrNull(raw.endDate ?? raw.completedAt ?? raw.dataFim ?? raw.finalizacao)
  const observationsValue = raw.observations ?? raw.observacao ?? raw.notes ?? raw.obs ?? null

  const vehicleRaw = raw.vehicle ?? raw.veiculo ?? raw.vehicleData ?? raw.car ?? raw.carro ?? {}
  const vehicleModel = vehicleRaw?.model ?? vehicleRaw?.modelo ?? raw.vehicleModel ?? raw.modeloVeiculo ?? 'Veículo'
  const vehiclePlate = vehicleRaw?.plate ?? vehicleRaw?.placa ?? raw.vehiclePlate ?? raw.placaVeiculo ?? '---'

  const servicesSource = Array.isArray(raw.servicesPerformed)
    ? raw.servicesPerformed
    : Array.isArray(raw.serviceItems)
      ? raw.serviceItems
      : Array.isArray(raw.services)
        ? raw.services
        : Array.isArray(raw.items)
          ? raw.items
          : []

  const servicesPerformed = servicesSource
    .map((item: any, index: number) => {
      if (!item) return null
      const serviceId = item.id ?? item.serviceId ?? item.servicoId ?? `${id}-service-${index}`
      const serviceName = item.service?.name ?? item.name ?? item.serviceName ?? item.nome ?? 'Serviço'
      return {
        id: String(serviceId),
        service: { name: String(serviceName) }
      }
    })
    .filter(Boolean)

  return {
    id: String(id),
    number: String(numberValue),
    description: String(descriptionValue || ''),
    status: normalizeStatus(statusValue),
    totalValue: parseNumber(raw.totalValue ?? raw.valorTotal ?? raw.total ?? raw.amount),
    startDate: startDateIso,
    endDate: endDateIso,
    observations: observationsValue ? String(observationsValue) : null,
    vehicle: {
      model: String(vehicleModel || 'Veículo'),
      plate: String(vehiclePlate || '---')
    },
    servicesPerformed,
    progressoSimulado: 0
  }
}

export function AcompanhamentoServico() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [clientId, setClientId] = useState<string | null>(null)
  const [resolvingClientId, setResolvingClientId] = useState(false)

  const selectedOrder = selectedOrderId
    ? orders.find((order) => order.id === selectedOrderId) ?? null
    : null

  useEffect(() => {
    let active = true

    const resetClientState = () => {
      if (!active) return
      setClientId(null)
      setResolvingClientId(false)
    }

    if (!user) {
      resetClientState()
      return () => {
        active = false
      }
    }

    setResolvingClientId(true)

    const directCandidates = [
      user.clientId,
      user.clienteId,
      user?.client?.id,
      user?.client?.clientId,
      user?.cliente?.id,
      user?.cliente?.clientId,
    ] as Array<string | number | null | undefined>

    if (user?.role === 'CLIENT' && !directCandidates.some(Boolean)) {
      directCandidates.push(user.id)
    }

    const directCandidate = directCandidates.find((value) => value !== null && value !== undefined)
    if (directCandidate) {
      if (active) {
        setClientId(String(directCandidate))
        setResolvingClientId(false)
      }
      return () => {
        active = false
      }
    }

    const fallbackEndpoints = [
      '/clientes/me',
      '/clients/me',
      '/cliente/me',
      '/client/me',
    ]

    ;(async () => {
      for (const endpoint of fallbackEndpoints) {
        try {
          const response = await api.get(endpoint)
          const data = response.data ?? {}
          const candidate =
            data.id ??
            data.clientId ??
            data.client?.id ??
            data.client?.clientId ??
            data.cliente?.id ??
            data.cliente?.clientId

          if (candidate) {
            if (active) {
              setClientId(String(candidate))
              setResolvingClientId(false)
            }
            return
          }
        } catch (error) {
          console.warn(`[AcompanhamentoServico] Falha ao resolver clientId via ${endpoint}`, error)
        }
      }

      if (active) {
        setClientId(null)
        setResolvingClientId(false)
      }
    })()

    return () => {
      active = false
    }
  }, [user, clientId])


  useEffect(() => {
    if (!user) {
      setOrders([])
      setSelectedOrderId(null)
      setLoading(false)
      return
    }

    let isSubscribed = true
    let hasLoadedOnce = false

    const fetchClientOrders = async () => {
      if (!hasLoadedOnce) {
        setLoading(true)
      }

      const idCandidates = [
        clientId,
        user.id,
        user.clientId,
        user.clienteId,
        user.userId,
        user?.client?.id,
      ].filter(Boolean).map((value: any) => String(value))

      const endpointCandidates = [
        '/clientes/me/ordens',
        '/me/ordens',
  // Mantemos esse fallback apenas para o caso do backend expor uma rota explícita por cliente.
  ...idCandidates.map((id: string) => `/clientes/${id}/ordens`),
      ].filter(Boolean)

      const uniqueEndpoints = Array.from(new Set(endpointCandidates))

      try {
        let fetched = false

        for (const endpoint of uniqueEndpoints) {
          try {
            const response = await api.get(endpoint as string)
            const list = extractOrderList(response.data)

            if (!Array.isArray(list)) {
              continue
            }

            const normalized = list
              .map(normalizeOrder)
              .filter((order): order is Order => Boolean(order))
              .map((order) => ({
                ...order,
                progressoSimulado: SIMULATE_PROGRESS(order.status),
              }))

            if (!isSubscribed) {
              return
            }

            setOrders(normalized)
            setSelectedOrderId((prev) => {
              if (prev && normalized.some((order) => order.id === prev)) {
                return prev
              }
              return normalized.length > 0 ? normalized[0].id : null
            })

            fetched = true
            console.info(`[AcompanhamentoServico] Ordens carregadas por ${endpoint}`)
            break
          } catch (endpointError) {
            console.warn(`[AcompanhamentoServico] Falha ao buscar ${endpoint}`, endpointError)
          }
        }

        if (!fetched) {
          if (isSubscribed) {
            setOrders([])
            setSelectedOrderId(null)
          }
        }
      } catch (error) {
        // MUITO IMPORTANTE: Se o backend retornar 404 ou 500, o frontend não quebra
        console.error('Erro ao carregar ordens do cliente (API):', error)
        if (isSubscribed) {
          setOrders([]) // Garante que a lista fique vazia em caso de erro.
          setSelectedOrderId(null)
        }
      } finally {
        // ✅ GARANTE QUE O LOADING TERMINE, INDEPENDENTE DO SUCESSO OU FALHA
        if (isSubscribed) {
          setLoading(false)
        }
        hasLoadedOnce = true
      }
    }

    fetchClientOrders()
    const intervalId = setInterval(fetchClientOrders, 15000)
    return () => {
      isSubscribed = false
      clearInterval(intervalId)
    }
  }, [user])

  // --- Funções de Mapeamento (Permanecem as mesmas) ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'IN_PROGRESS': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'FINISHED': return 'bg-green-100 text-green-800 border-green-200'
      case 'CANCELED': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Aguardando Início'
      case 'IN_PROGRESS': return 'Em Execução'
      case 'FINISHED': return 'Concluído'
      case 'CANCELED': return 'Cancelado'
      default: return 'Desconhecido'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'FINISHED': return <CheckCircle className="h-4 w-4" />
      case 'OPEN': return <Calendar className="h-4 w-4" />
      case 'IN_PROGRESS': return <Clock className="h-4 w-4" />
      case 'CANCELED': return <AlertCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getItemStatusColor = (status: string) => {
    switch (status) {
      case 'concluido': return 'text-green-600'
      case 'em_andamento': return 'text-yellow-600'
      case 'pendente': return 'text-gray-500'
      default: return 'text-gray-500'
    }
  }

  const filteredOrders = orders.filter(
    (order) =>
      order.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase())
  )
  // --- Fim das Funções de Mapeamento ---


  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Acompanhar Serviços</h1>
        <p className="text-gray-600">
          Veja o status dos seus serviços em tempo real
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LISTA DE SERVIÇOS (Ordens) */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="mr-2 h-5 w-5" />
                Meus Serviços
              </CardTitle>

              <div className="pt-2">
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="OS, veículo ou placa..."
                />
              </div>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500 flex flex-col items-center">
                  <Clock className="h-8 w-8 animate-spin text-blue-500 mb-2"/>
                  Carregando ordens...
                </div>
              ) : filteredOrders.length > 0 ? (
                <div className="space-y-3">
                  {filteredOrders.map((order) => (
                    <Card
                      key={order.id}
                      className={`cursor-pointer hover:shadow-md transition-shadow ${
                        selectedOrderId === order.id
                          ? 'ring-2 ring-blue-500'
                          : ''
                      }`}
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">
                            {order.number}
                          </div>

                          <Badge
                            className={getStatusColor(order.status)}
                          >
                            {getStatusIcon(order.status)}
                            <span className="ml-1">
                              {getStatusText(order.status)}
                            </span>
                          </Badge>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center">
                            <Car className="mr-2 h-3 w-3" />
                            {order.vehicle.model} ({order.vehicle.plate})
                          </div>

                          <div>{order.description}</div>

                          <div className="flex items-center mt-2">
                            <div className="flex-1">
                              <Progress
                                value={order.progressoSimulado}
                                className="h-2"
                              />
                            </div>
                            <span className="ml-2 text-xs">
                              {order.progressoSimulado}%
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma ordem de serviço encontrada</p>
                  <p className="text-sm">Verifique os termos de busca ou agende seu primeiro serviço</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* DETALHES DA ORDEM SELECIONADA */}
        <div className="lg:col-span-2">
          {selectedOrder ? (
            <div className="space-y-6">
              {/* HEADER */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Wrench className="mr-2 h-5 w-5" />
                      {selectedOrder.number}
                    </CardTitle>

                    <Badge
                      className={getStatusColor(selectedOrder.status)}
                      variant="outline"
                    >
                      {getStatusIcon(selectedOrder.status)}
                      <span className="ml-1">
                        {getStatusText(selectedOrder.status)}
                      </span>
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Car className="mr-2 h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">
                            {selectedOrder.vehicle.model}
                          </div>
                          <div className="text-sm text-gray-600">
                            Placa: {selectedOrder.vehicle.plate}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-sm">
                            Início:{' '}
                            {new Date(
                              selectedOrder.startDate
                            ).toLocaleDateString('pt-BR')}
                          </div>
                          {selectedOrder.endDate && (
                            <div className="text-sm">
                              Entrega:{' '}
                              {new Date(
                                selectedOrder.endDate
                              ).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Wrench className="mr-2 h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">Serviço Principal</div>
                          <div className="text-sm text-gray-600">
                            {selectedOrder.description}
                          </div>
                        </div>
                      </div>

                      {typeof selectedOrder.totalValue === 'number' && (
                        <div className="flex items-center">
                          <DollarSign className="mr-2 h-4 w-4 text-gray-500" />
                          <div>
                            <div className="font-medium">Valor Total</div>
                            <div className="text-sm text-gray-600">
                              R$ {selectedOrder.totalValue.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="font-medium mb-2">
                      Progresso Geral
                    </div>
                    <div className="flex items-center">
                      <Progress
                        value={selectedOrder.progressoSimulado}
                        className="flex-1"
                      />
                      <span className="ml-3 text-sm font-medium">
                        {selectedOrder.progressoSimulado}%
                      </span>
                    </div>
                  </div>

                  {selectedOrder.observations && (
                    <Alert className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Observações:</strong>{' '}
                        {selectedOrder.observations}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* ITENS DO SERVIÇO (Serviços + Peças Usadas) */}
              <Card>
                <CardHeader>
                  <CardTitle>Serviços e Peças</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {(selectedOrder.servicesPerformed ?? []).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Wrench className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="font-medium">
                              {item.service.name} (Serviço)
                            </div>
                            <div className={`text-sm ${getItemStatusColor('concluido')}`}>
                                ✓ Concluído
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* //TODO: Você precisaria de um array de partsUsed no backend para renderizar aqui */}
                  </div>
                </CardContent>
              </Card>

              {/* CONTATO */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-blue-900">
                        Dúvidas sobre seu serviço?
                      </div>
                      <div className="text-sm text-blue-700">
                        Entre em contato: (11) 9999-9999 ou
                        responsavel@oficina.com
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Eye className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecione um serviço
                </h3>
                <p className="text-gray-600">
                  Clique em um serviço na lista ao lado para ver os detalhes
                  completos
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}