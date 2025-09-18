import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Calendar } from './ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Alert, AlertDescription } from './ui/alert'
import { Badge } from './ui/badge'
import { Calendar as CalendarIcon, Clock, Car, AlertCircle, CheckCircle, Phone, MapPin } from 'lucide-react'
import { toast } from 'sonner@2.0.3'

export function Agendamento() {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState('')
  const [vehicleInfo, setVehicleInfo] = useState({
    marca: '',
    modelo: '',
    ano: '',
    placa: '',
    km: ''
  })
  const [serviceType, setServiceType] = useState('')
  const [description, setDescription] = useState('')
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    address: ''
  })
  const [loading, setLoading] = useState(false)

  const availableTimes = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
  ]

  const serviceTypes = [
    'Troca de óleo',
    'Revisão geral',
    'Freios',
    'Suspensão',
    'Pneus',
    'Bateria',
    'Ar condicionado',
    'Sistema elétrico',
    'Motor',
    'Transmissão',
    'Diagnóstico',
    'Outros'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedDate || !selectedTime || !serviceType || !vehicleInfo.marca || !vehicleInfo.modelo) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setLoading(true)
    
    try {
      // Simular envio do agendamento
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Agendamento realizado com sucesso!')
      
      // Reset form
      setSelectedDate(undefined)
      setSelectedTime('')
      setVehicleInfo({ marca: '', modelo: '', ano: '', placa: '', km: '' })
      setServiceType('')
      setDescription('')
      setContactInfo({ phone: '', address: '' })
      
    } catch (error) {
      toast.error('Erro ao realizar agendamento')
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = selectedDate && selectedTime && serviceType && vehicleInfo.marca && vehicleInfo.modelo

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Agendar Serviço</h1>
        <p className="text-gray-600">Marque um horário para levar seu veículo à oficina</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vehicle Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Car className="mr-2 h-5 w-5" />
                  Informações do Veículo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="marca">Marca *</Label>
                    <Input
                      id="marca"
                      value={vehicleInfo.marca}
                      onChange={(e) => setVehicleInfo(prev => ({ ...prev, marca: e.target.value }))}
                      placeholder="Ex: Toyota"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="modelo">Modelo *</Label>
                    <Input
                      id="modelo"
                      value={vehicleInfo.modelo}
                      onChange={(e) => setVehicleInfo(prev => ({ ...prev, modelo: e.target.value }))}
                      placeholder="Ex: Corolla"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ano">Ano</Label>
                    <Input
                      id="ano"
                      value={vehicleInfo.ano}
                      onChange={(e) => setVehicleInfo(prev => ({ ...prev, ano: e.target.value }))}
                      placeholder="Ex: 2020"
                      type="number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="placa">Placa</Label>
                    <Input
                      id="placa"
                      value={vehicleInfo.placa}
                      onChange={(e) => setVehicleInfo(prev => ({ ...prev, placa: e.target.value.toUpperCase() }))}
                      placeholder="Ex: ABC-1234"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="km">Quilometragem</Label>
                    <Input
                      id="km"
                      value={vehicleInfo.km}
                      onChange={(e) => setVehicleInfo(prev => ({ ...prev, km: e.target.value }))}
                      placeholder="Ex: 50000"
                      type="number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Informações do Serviço
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="serviceType">Tipo de Serviço *</Label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição do Problema</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva o problema ou serviço necessário..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Date and Time Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  Data e Horário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Data *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "Selecione uma data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date() || date.getDay() === 0}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label htmlFor="time">Horário *</Label>
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

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="mr-2 h-5 w-5" />
                  Informações de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={contactInfo.address}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Seu endereço"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" disabled={!isFormValid || loading}>
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Agendando...
                </div>
              ) : (
                <>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Confirmar Agendamento
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          {/* Schedule Summary */}
          {(selectedDate || selectedTime || serviceType) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo do Agendamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedDate && (
                  <div className="flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="text-sm">{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="text-sm">{selectedTime}</span>
                  </div>
                )}
                {serviceType && (
                  <div className="flex items-center">
                    <Car className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="text-sm">{serviceType}</span>
                  </div>
                )}
                {vehicleInfo.marca && vehicleInfo.modelo && (
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="text-sm">{vehicleInfo.marca} {vehicleInfo.modelo}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Information Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-blue-900">
                <AlertCircle className="mr-2 h-5 w-5" />
                Informações Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="text-blue-800 text-sm space-y-2">
              <p>• Chegue 15 minutos antes do horário agendado</p>
              <p>• Traga os documentos do veículo</p>
              <p>• Informe problemas específicos</p>
              <p>• Confirmaremos por telefone em 24h</p>
            </CardContent>
          </Card>

          {/* Business Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Horário de Funcionamento</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Segunda a Sexta:</span>
                <span>08:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span>Sábado:</span>
                <span>08:00 - 12:00</span>
              </div>
              <div className="flex justify-between">
                <span>Domingo:</span>
                <Badge variant="secondary">Fechado</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}