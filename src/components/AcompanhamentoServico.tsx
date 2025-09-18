import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Alert, AlertDescription } from './ui/alert'
import { 
  Search, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Car, 
  Calendar,
  Phone,
  MapPin,
  Wrench,
  Package,
  DollarSign
} from 'lucide-react'


interface ServicoStatus {
  id: string
  numero: string
  veiculo: string
  placa: string
  servico: string
  status: 'agendado' | 'recebido' | 'diagnostico' | 'aguardando_pecas' | 'em_execucao' | 'teste' | 'concluido' | 'entregue'
  dataInicio: string
  previsaoEntrega: string
  responsavel: string
  observacoes: string
  progresso: number
  valor?: number
  itens: Array<{
    tipo: 'servico' | 'peca'
    nome: string
    status: 'pendente' | 'em_andamento' | 'concluido'
    valor?: number
  }>
}

const servicosExemplo: ServicoStatus[] = [
  {
    id: '1',
    numero: 'OS-2024001',
    veiculo: 'Honda Civic 2020',
    placa: 'ABC-1234',
    servico: 'Revisão dos freios',
    status: 'em_execucao',
    dataInicio: '2024-01-20',
    previsaoEntrega: '2024-01-22',
    responsavel: 'João Silva',
    observacoes: 'Necessária troca das pastilhas dianteiras e disco traseiro',
    progresso: 65,
    valor: 450,
    itens: [
      { tipo: 'servico', nome: 'Inspeção sistema freios', status: 'concluido' },
      { tipo: 'peca', nome: 'Pastilhas freio dianteiras', status: 'concluido', valor: 120 },
      { tipo: 'peca', nome: 'Disco freio traseiro', status: 'em_andamento', valor: 180 },
      { tipo: 'servico', nome: 'Montagem e teste', status: 'pendente' }
    ]
  },
  {
    id: '2',
    numero: 'OS-2024002',
    veiculo: 'Toyota Corolla 2019',
    placa: 'XYZ-5678',
    servico: 'Troca de óleo',
    status: 'concluido',
    dataInicio: '2024-01-15',
    previsaoEntrega: '2024-01-15',
    responsavel: 'Maria Santos',
    observacoes: 'Serviço realizado conforme programado',
    progresso: 100,
    valor: 120,
    itens: [
      { tipo: 'peca', nome: 'Óleo motor 5W30', status: 'concluido', valor: 65 },
      { tipo: 'peca', nome: 'Filtro de óleo', status: 'concluido', valor: 25 },
      { tipo: 'servico', nome: 'Troca óleo e filtro', status: 'concluido' }
    ]
  }
]

export function AcompanhamentoServico() {
  const [searchTerm, setSearchTerm] = useState('')
  const [servicos] = useState<ServicoStatus[]>(servicosExemplo)
  const [selectedServico, setSelectedServico] = useState<ServicoStatus | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'recebido':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'diagnostico':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'aguardando_pecas':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'em_execucao':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'teste':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200'
      case 'concluido':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'entregue':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'agendado':
        return 'Agendado'
      case 'recebido':
        return 'Recebido'
      case 'diagnostico':
        return 'Diagnóstico'
      case 'aguardando_pecas':
        return 'Aguardando Peças'
      case 'em_execucao':
        return 'Em Execução'
      case 'teste':
        return 'Em Teste'
      case 'concluido':
        return 'Concluído'
      case 'entregue':
        return 'Entregue'
      default:
        return 'Desconhecido'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'agendado':
        return <Calendar className="h-4 w-4" />
      case 'recebido':
      case 'diagnostico':
      case 'aguardando_pecas':
      case 'em_execucao':
      case 'teste':
        return <Clock className="h-4 w-4" />
      case 'concluido':
      case 'entregue':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getItemStatusColor = (status: string) => {
    switch (status) {
      case 'concluido':
        return 'text-green-600'
      case 'em_andamento':
        return 'text-yellow-600'
      case 'pendente':
        return 'text-gray-500'
      default:
        return 'text-gray-500'
    }
  }

  const filteredServicos = servicos.filter(servico =>
    servico.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    servico.veiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    servico.placa.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Acompanhar Serviços</h1>
        <p className="text-gray-600">Veja o status dos seus serviços em tempo real</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="mr-2 h-5 w-5" />
                Meus Serviços
              </CardTitle>
              <div>
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
              {filteredServicos.length > 0 ? (
                <div className="space-y-3">
                  {filteredServicos.map((servico) => (
                    <Card 
                      key={servico.id} 
                      className={`cursor-pointer hover:shadow-md transition-shadow ${
                        selectedServico?.id === servico.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedServico(servico)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{servico.numero}</div>
                          <Badge className={getStatusColor(servico.status)}>
                            {getStatusIcon(servico.status)}
                            <span className="ml-1">{getStatusText(servico.status)}</span>
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center">
                            <Car className="mr-2 h-3 w-3" />
                            {servico.veiculo}
                          </div>
                          <div>{servico.servico}</div>
                          <div className="flex items-center mt-2">
                            <div className="flex-1">
                              <Progress value={servico.progresso} className="h-2" />
                            </div>
                            <span className="ml-2 text-xs">{servico.progresso}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum serviço encontrado</p>
                  <p className="text-sm">Verifique os termos de busca</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Service Details */}
        <div className="lg:col-span-2">
          {selectedServico ? (
            <div className="space-y-6">
              {/* Service Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Wrench className="mr-2 h-5 w-5" />
                      {selectedServico.numero}
                    </CardTitle>
                    <Badge className={getStatusColor(selectedServico.status)} variant="outline">
                      {getStatusIcon(selectedServico.status)}
                      <span className="ml-1">{getStatusText(selectedServico.status)}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Car className="mr-2 h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">{selectedServico.veiculo}</div>
                          <div className="text-sm text-gray-600">Placa: {selectedServico.placa}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-sm">Início: {new Date(selectedServico.dataInicio).toLocaleDateString('pt-BR')}</div>
                          <div className="text-sm">Previsão: {new Date(selectedServico.previsaoEntrega).toLocaleDateString('pt-BR')}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Wrench className="mr-2 h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">Responsável</div>
                          <div className="text-sm text-gray-600">{selectedServico.responsavel}</div>
                        </div>
                      </div>
                      
                      {selectedServico.valor && (
                        <div className="flex items-center">
                          <DollarSign className="mr-2 h-4 w-4 text-gray-500" />
                          <div>
                            <div className="font-medium">Valor</div>
                            <div className="text-sm text-gray-600">R$ {selectedServico.valor.toFixed(2)}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="font-medium mb-2">Progresso Geral</div>
                    <div className="flex items-center">
                      <Progress value={selectedServico.progresso} className="flex-1" />
                      <span className="ml-3 text-sm font-medium">{selectedServico.progresso}%</span>
                    </div>
                  </div>

                  {selectedServico.observacoes && (
                    <Alert className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Observações:</strong> {selectedServico.observacoes}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Service Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Itens do Serviço</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedServico.itens.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {item.tipo === 'servico' ? (
                            <Wrench className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Package className="h-4 w-4 text-green-600" />
                          )}
                          <div>
                            <div className="font-medium">{item.nome}</div>
                            <div className={`text-sm ${getItemStatusColor(item.status)}`}>
                              {item.status === 'concluido' ? '✓ Concluído' : 
                               item.status === 'em_andamento' ? '⏳ Em andamento' : 
                               '⏸ Pendente'}
                            </div>
                          </div>
                        </div>
                        {item.valor && (
                          <div className="text-sm font-medium">
                            R$ {item.valor.toFixed(2)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Timeline do Serviço</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">Serviço Recebido</div>
                        <div className="text-sm text-gray-600">{new Date(selectedServico.dataInicio).toLocaleString('pt-BR')}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        selectedServico.progresso >= 30 ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <CheckCircle className={`h-4 w-4 ${
                          selectedServico.progresso >= 30 ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <div className="font-medium">Diagnóstico Realizado</div>
                        <div className="text-sm text-gray-600">
                          {selectedServico.progresso >= 30 ? 'Concluído' : 'Em andamento'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        selectedServico.progresso >= 70 ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Clock className={`h-4 w-4 ${
                          selectedServico.progresso >= 70 ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <div className="font-medium">Execução do Serviço</div>
                        <div className="text-sm text-gray-600">
                          {selectedServico.progresso >= 70 ? 'Concluído' : 
                           selectedServico.progresso >= 30 ? 'Em andamento' : 'Aguardando'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        selectedServico.progresso >= 100 ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <CheckCircle className={`h-4 w-4 ${
                          selectedServico.progresso >= 100 ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <div className="font-medium">Pronto para Entrega</div>
                        <div className="text-sm text-gray-600">
                          {selectedServico.progresso >= 100 ? 
                            new Date(selectedServico.previsaoEntrega).toLocaleString('pt-BR') : 
                            'Aguardando conclusão'}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-blue-900">Dúvidas sobre seu serviço?</div>
                      <div className="text-sm text-blue-700">
                        Entre em contato: (11) 9999-9999 ou responsavel@oficina.com
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
                  Clique em um serviço na lista ao lado para ver os detalhes completos
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}