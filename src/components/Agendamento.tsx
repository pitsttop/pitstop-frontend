import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Calendar } from '../components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover'
import { Calendar as CalendarIcon, Clock, Car, MapPin, Wrench} from 'lucide-react'
import { toast } from 'sonner'

// Funções auxiliares (mantidas iguais)
const normalizeVehicle = (vehicle: any) => {
  if (!vehicle || typeof vehicle !== 'object') return null
  const marca = vehicle.marca ?? vehicle.brand ?? vehicle.make ?? ''
  const modelo = vehicle.modelo ?? vehicle.model ?? vehicle.nome ?? ''
  const placa = vehicle.placa ?? vehicle.plate ?? vehicle.placaVeiculo ?? ''
  if (!marca && !modelo && !placa) return null
  return {
    id: vehicle.id ?? vehicle.vehicleId,
    marca,
    modelo,
    placa,
  }
}

const normalizeVehicleList = (data: any): any[] | null => {
  const candidate = Array.isArray(data) ? data : (data?.data || data?.items || [])
  if (!candidate) return null
  return candidate.map(normalizeVehicle).filter(Boolean)
}

// Interface para os serviços do banco
interface ServiceItem {
  id: string
  name: string
  price: number
  description?: string
}

const APPOINTMENTS_STORAGE_KEY = 'pitstop:clientAppointments'

interface StoredAppointment {
  id: string
  userId: string
  serviceId: string
  serviceName: string
  status: 'SCHEDULED'
  scheduledFor: string
  createdAt: string
  vehicle: {
    brand: string
    model: string
    plate: string
  }
  description?: string
}

export function Agendamento() {
  const { user, accessToken } = useAuth()
  
  // Estados
  const [vehicles, setVehicles] = useState<any[]>([])
  const [servicesList, setServicesList] = useState<ServiceItem[]>([]) // Lista que vem do banco
  const [loadingVehicles, setLoadingVehicles] = useState(false)
  
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState('')
  
  // Agora guardamos o ID do serviço selecionado
  const [selectedServiceId, setSelectedServiceId] = useState('')
  
  const [description, setDescription] = useState('')
  const [vehicleInfo, setVehicleInfo] = useState({ marca: '', modelo: '', placa: '' })
  const [loading, setLoading] = useState(false)

  // Horários fixos (pode vir do banco futuramente)
  const availableTimes = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
  ]

  // 1. Buscar Serviços do Banco
  useEffect(() => {
    const fetchServices = async () => {
      if (!accessToken) return
      try {
        const response = await api.get('/servicos')
        setServicesList(response.data)
      } catch (error) {
        console.error("Erro ao buscar serviços:", error)
        toast.error("Não foi possível carregar a lista de serviços.")
      }
    }
    fetchServices()
  }, [accessToken])

  // 2. Buscar Veículos do Cliente
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!accessToken || !user) return
      
      const userId = user.id || user.userId || user.sub
      if (!userId) return

      setLoadingVehicles(true)
      try {
        // Tenta a rota padrão configurada
        const response = await api.get(`/clientes/${userId}/veiculos`)
        const list = normalizeVehicleList(response.data)
        if (list) setVehicles(list)
      } catch (error) {
        // Se falhar, tenta rota alternativa ou apenas loga
        console.warn("Falha ao buscar veículos na rota principal")
      } finally {
        setLoadingVehicles(false)
      }
    }
    fetchVehicles()
  }, [user, accessToken])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedDate || !selectedTime || !selectedServiceId || !vehicleInfo.marca) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setLoading(true)
    
    try {
      // TODO: Aqui você fará o POST /ordens futuramente
      // Por enquanto é só simulação
      await new Promise(resolve => setTimeout(resolve, 1500))

      const authUserId = user?.id ?? user?.userId ?? user?.clientId ?? user?.clienteId
      if (authUserId) {
        const appointmentId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `appt-${Date.now()}`

        const scheduledDate = new Date(selectedDate.getTime())
        const [hoursStr, minutesStr] = selectedTime.split(':')
        const hours = Number(hoursStr) || 0
        const minutes = Number(minutesStr) || 0
        scheduledDate.setHours(hours, minutes, 0, 0)

        const storedAppointment: StoredAppointment = {
          id: appointmentId,
          userId: String(authUserId),
          serviceId: selectedServiceId,
          serviceName: selectedServiceObj?.name ?? 'Serviço',
          status: 'SCHEDULED',
          scheduledFor: scheduledDate.toISOString(),
          createdAt: new Date().toISOString(),
          vehicle: {
            brand: vehicleInfo.marca,
            model: vehicleInfo.modelo,
            plate: vehicleInfo.placa,
          },
          description: description || undefined,
        }

        try {
          const raw = localStorage.getItem(APPOINTMENTS_STORAGE_KEY)
          const parsed = raw ? JSON.parse(raw) : []
          const appointments: StoredAppointment[] = Array.isArray(parsed) ? parsed : []
          appointments.push(storedAppointment)
          localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments))
          window.dispatchEvent(new Event('pitstop:appointments-updated'))
        } catch (storageError) {
          console.error('Erro ao salvar agendamento localmente:', storageError)
        }
      }
      
      toast.success('Agendamento solicitado com sucesso!')
      
      // Reset form
      setSelectedDate(undefined)
      setSelectedTime('')
      setSelectedServiceId('')
      setDescription('')
      setVehicleInfo({ marca: '', modelo: '', placa: '' })
      
    } catch (error) {
      toast.error('Erro ao realizar agendamento')
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = selectedDate && selectedTime && selectedServiceId && vehicleInfo.marca

  // Encontrar o serviço selecionado para mostrar detalhes (preço)
  const selectedServiceObj = servicesList.find(s => s.id === selectedServiceId)

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agendar Serviço</h1>
        <p className="text-gray-600">Marque um horário para levar seu veículo à oficina</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Seleção de Veículo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Car className="mr-2 h-5 w-5 text-blue-600" />
                  Veículo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Selecione o veículo *</Label>
                  {loadingVehicles ? (
                     <div className="text-sm text-gray-500 py-2">Carregando...</div>
                  ) : (
                    <Select 
                      value={vehicleInfo.modelo ? `${vehicleInfo.marca}|${vehicleInfo.modelo}|${vehicleInfo.placa}` : ''} 
                      onValueChange={(val) => {
                        const [marca, modelo, placa] = (val || '').split('|')
                        setVehicleInfo(prev => ({ ...prev, marca, modelo, placa }))
                      }}
                      disabled={vehicles.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={vehicles.length === 0 ? "Nenhum veículo cadastrado" : "Selecione seu veículo"} />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.length === 0 ? (
                          <SelectItem value="none" disabled>Cadastre um veículo primeiro</SelectItem>
                        ) : (
                          vehicles.map((v, idx) => (
                            <SelectItem key={idx} value={`${v.marca}|${v.modelo}|${v.placa}`}>
                              {v.marca} {v.modelo} - {v.placa}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Informações do Serviço (AGORA DINÂMICO) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Wrench className="mr-2 h-5 w-5 text-blue-600" /> {/* Troquei Clock por Wrench que faz mais sentido */}
                  Informações do Serviço
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tipo de Serviço *</Label>
                  <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {servicesList.length === 0 ? (
                        <SelectItem value="empty" disabled>Carregando serviços...</SelectItem>
                      ) : (
                        servicesList.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {/* Mostra o preço estimado se selecionado */}
                  {selectedServiceObj && (
                    <p className="text-sm text-gray-500 mt-1 ml-1">
                      Valor estimado: <span className="font-semibold text-green-600">R$ {selectedServiceObj.price.toFixed(2)}</span>
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição do Problema</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva o problema ou detalhes adicionais..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Data e Horário */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <CalendarIcon className="mr-2 h-5 w-5 text-blue-600" />
                  Data e Horário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Data *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="relative w-full cursor-pointer">
                          <Input
                            readOnly
                            value={selectedDate ? selectedDate.toLocaleDateString('pt-BR') : ''}
                            placeholder="dd/mm/aaaa"
                            className="pr-10 cursor-pointer"
                          />
                          <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => {
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            // Desabilita passado e domingos
                            return date < today || date.getDay() === 0
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label>Horário *</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um horário" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimes.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" disabled={!isFormValid || loading}>
              {loading ? 'Agendando...' : 'Confirmar Agendamento'}
            </Button>
          </form>
        </div>

        {/* Resumo Lateral */}
        <div className="space-y-6">
          {(selectedDate || selectedTime || selectedServiceId) && (
            <Card className="bg-blue-50/50 border-blue-100">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900">Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedDate && (
                  <div className="flex items-center text-sm">
                    <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                    <span>{selectedDate.toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4 text-blue-500" />
                    <span>{selectedTime}</span>
                  </div>
                )}
                {selectedServiceObj && (
                  <div className="flex items-center text-sm">
                    <Wrench className="mr-2 h-4 w-4 text-blue-500" />
                    <span>{selectedServiceObj.name}</span>
                  </div>
                )}
                {vehicleInfo.marca && (
                  <div className="flex items-center text-sm">
                    <MapPin className="mr-2 h-4 w-4 text-blue-500" />
                    <span>{vehicleInfo.modelo} ({vehicleInfo.placa})</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Horário de Funcionamento</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Segunda a Sexta</span>
                <span className="font-medium">08:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sábado</span>
                <span className="font-medium">08:00 - 12:00</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}