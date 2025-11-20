import { useEffect, useState } from 'react'
// MUDANÇA: Importamos os Enums e as interfaces de junção
import { useApi, OrdemServico, Cliente, Veiculo, Peca, Servico, OrderStatus, PartUsage, ServiceUsage } from '../hooks/useApi'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Checkbox } from './ui/checkbox'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog'
import { Plus, Edit, Trash2, FileText, User, Car, Clock, CheckCircle, AlertCircle, Package, Settings, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

// MUDANÇA: Tipo de formulário atualizado para bater com a API
// Note que partsUsed e servicesPerformed são tratados separadamente
type OrdemFormData = Omit<OrdemServico, 'id' | 'createdAt' | 'updatedAt' | 'partsUsed' | 'servicesPerformed'> & {
  // Usamos IDs para o formulário, e convertemos no 'handleSubmit'
  pecas: { id: string, quantity: number }[];
  servicos: { id: string }[];
}

export function Ordens() {
  const { 
    getOrdens, createOrdem, updateOrdem, deleteOrdem,
    getClientes, getVeiculos, getPecas, getServicos,
    loading 
  } = useApi()
  
  const [ordens, setOrdens] = useState<OrdemServico[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [pecas, setPecas] = useState<Peca[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingOrdem, setEditingOrdem] = useState<OrdemServico | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // MUDANÇA: 'formData' inicializado com os nomes e tipos corretos do backend
  const [formData, setFormData] = useState<OrdemFormData>({
    clientId: '',
    vehicleId: '',
    number: '', // O backend vai gerar, mas podemos querer mostrar/editar
    description: '',
    observations: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    servicos: [], // MUDANÇA: Lógica de peças/serviços
    pecas: [],    // MUDANÇA: Lógica de peças/serviços
    totalValue: 0,
    status: OrderStatus.OPEN, // MUDANÇA: Usando Enum
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [ordensData, clientesData, veiculosData, pecasData, servicosData] = await Promise.all([
        getOrdens(),
        getClientes(),
        getVeiculos(),
        getPecas(),
        getServicos()
      ])
      setOrdens(ordensData)
      setClientes(clientesData)
      setVeiculos(veiculosData)
      setPecas(pecasData)
      setServicos(servicosData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados')
    }
  }

  // MUDANÇA: 'resetForm' atualizado
  const resetForm = () => {
    setFormData({
      clientId: '',
      vehicleId: '',
      number: '',
      description: '',
      observations: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      servicos: [],
      pecas: [],
      totalValue: 0,
      status: OrderStatus.OPEN,
    })
    setEditingOrdem(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.clientId || !formData.vehicleId) {
      toast.error('Selecione cliente e veículo')
      return
    }

    // MUDANÇA: A lógica de 'create' e 'update' do Prisma é complexa.
    // O frontend NÃO DEVE mandar 'partsUsed' ou 'servicesPerformed'.
    // O backend (API) é quem deve lidar com a criação/conexão
    // das tabelas de junção (PartUsage, ServiceUsage) com base
    // nos IDs que enviamos.
    
    // Por agora, vamos simplificar e OMITIR o envio de peças/serviços
    // até que a ROTA de backend esteja pronta para recebê-los.
    const { pecas, servicos, ...ordemData } = formData;
    
    // Prepara os dados para enviar (convertendo valores vazios para null)
    const dataToSubmit = {
        ...ordemData,
        observations: ordemData.observations || null,
        endDate: ordemData.endDate || null,
        totalValue: ordemData.totalValue || null,
        // TODO: Enviar 'pecas' e 'servicos' quando o backend souber recebê-los
    };

    try {
      if (editingOrdem) {
        await updateOrdem(editingOrdem.id!, dataToSubmit)
        toast.success('Ordem de serviço atualizada com sucesso!')
      } else {
        await createOrdem(dataToSubmit)
        toast.success('Ordem de serviço criada com sucesso!')
      }
      
      setDialogOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      console.error('Erro ao salvar ordem:', error)
      toast.error('Erro ao salvar ordem de serviço')
    }
  }

  // MUDANÇA: 'handleEdit' atualizado
  const handleEdit = (ordem: OrdemServico) => {
    setEditingOrdem(ordem)
    setFormData({
      clientId: ordem.clientId,
      vehicleId: ordem.vehicleId,
      number: ordem.number,
      description: ordem.description,
      observations: ordem.observations || '',
      startDate: new Date(ordem.startDate).toISOString().split('T')[0], // Formata data
      endDate: ordem.endDate ? new Date(ordem.endDate).toISOString().split('T')[0] : '',
      status: ordem.status,
      totalValue: ordem.totalValue || 0,
      // MUDANÇA: Converte a lógica de volta para o formulário
      pecas: ordem.partsUsed.map(p => ({ id: p.partId, quantity: p.quantity })),
      servicos: ordem.servicesPerformed.map(s => ({ id: s.serviceId })),
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteOrdem(id)
      toast.success('Ordem de serviço excluída com sucesso!')
      loadData()
    } catch (error) {
      console.error('Erro ao excluir ordem:', error)
      toast.error('Erro ao excluir ordem de serviço')
    }
  }

  // MUDANÇA: 'handleStatusChange' atualizado
  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    try {
      const updateData: Partial<OrdemServico> = { status: newStatus }
      if (newStatus === OrderStatus.FINISHED && !ordens.find(o => o.id === id)?.endDate) {
        updateData.endDate = new Date().toISOString() // Envia data completa
      }
      
      await updateOrdem(id, updateData)
      toast.success('Status atualizado com sucesso!')
      loadData()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast.error('Erro ao atualizar status')
    }
  }

  // MUDANÇA: 'getClienteNome' usa 'name'
  const getClienteNome = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId)
    return cliente?.name || 'Cliente não encontrado'
  }

  // MUDANÇA: 'getVeiculo' usa 'brand', 'model', 'plate'
  const getVeiculo = (vehicleId: string) => {
    const veiculo = veiculos.find(v => v.id === vehicleId)
    return veiculo ? `${veiculo.brand} ${veiculo.model} - ${veiculo.plate}` : 'Veículo não encontrado'
  }

  // MUDANÇA: 'getVeiculosByCliente' usa 'ownerId'
  const getVeiculosByCliente = (clienteId: string) => {
    return veiculos.filter(v => v.ownerId === clienteId)
  }

  // MUDANÇA: 'calcularValorTotal' usa 'price'
  const calcularValorTotal = () => {
    const valorServicos = formData.servicos.reduce((total, servicoForm) => {
      const servico = servicos.find(s => s.id === servicoForm.id)
      return total + (servico?.price || 0)
    }, 0)

    const valorPecas = formData.pecas.reduce((total, pecaForm) => {
      const peca = pecas.find(p => p.id === pecaForm.id)
      return total + (peca?.price || 0) * pecaForm.quantity
    }, 0)

    return valorServicos + valorPecas
  }

  // MUDANÇA: 'filteredOrdens' usa 'number' e 'description'
  const filteredOrdens = ordens.filter(ordem => {
    const matchesSearch = (
      ordem.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClienteNome(ordem.clientId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getVeiculo(ordem.vehicleId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    const matchesStatus = statusFilter === 'all' || ordem.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // MUDANÇA: Funções de status usam o Enum
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.OPEN:
        return <AlertCircle className="h-4 w-4" />
      case OrderStatus.IN_PROGRESS:
        return <Clock className="h-4 w-4" />
      case OrderStatus.FINISHED:
        return <CheckCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }
  
  const getStatusText = (status: OrderStatus) => {
     switch (status) {
      case OrderStatus.OPEN: return 'Aberta';
      case OrderStatus.IN_PROGRESS: return 'Em Andamento';
      case OrderStatus.FINISHED: return 'Concluída';
      case OrderStatus.CANCELED: return 'Cancelada';
      default: return 'Desconhecido';
    }
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.OPEN:
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case OrderStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case OrderStatus.FINISHED:
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }
  
  // TODO: Esta é a lógica de seleção de peças/serviços que precisa ser revisada.
  // Por enquanto, apenas traduzimos os nomes.
  
  const handlePecaChange = (pecaId: string, checked: boolean) => {
     setFormData(prev => {
       const pecas = checked
         ? [...prev.pecas, { id: pecaId, quantity: 1 }] // Adiciona com quantidade 1
         : prev.pecas.filter(p => p.id !== pecaId);
       return { ...prev, pecas };
     });
  };

  const handleServicoChange = (servicoId: string, checked: boolean) => {
     setFormData(prev => {
       const servicos = checked
         ? [...prev.servicos, { id: servicoId }]
         : prev.servicos.filter(s => s.id !== servicoId);
       return { ...prev, servicos };
     });
  };


  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1>Ordens de Serviço</h1>
          <p className="text-gray-600">Gerencie as ordens de serviço da oficina</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Ordem
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingOrdem ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cliente">Cliente</Label>
                  <Select 
                    value={formData.clientId} 
                    onValueChange={(value) => {
                      setFormData({ ...formData, clientId: value, vehicleId: '' })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        // MUDANÇA: usa cliente.name
                        <SelectItem key={cliente.id} value={cliente.id!}>
                          {cliente.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="veiculo">Veículo</Label>
                  <Select 
                    value={formData.vehicleId} 
                    onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}
                    disabled={!formData.clientId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* MUDANÇA: usa veiculo.brand, model, plate */}
                      {getVeiculosByCliente(formData.clientId).map((veiculo) => (
                        <SelectItem key={veiculo.id} value={veiculo.id!}>
                          {veiculo.brand} {veiculo.model} - {veiculo.plate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* MUDANÇA: usa 'description' */}
              <div>
                <Label htmlFor="description">Descrição do Problema</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="Descreva o problema ou serviço solicitado..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  {/* MUDANÇA: usa Enums */}
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as OrderStatus })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={OrderStatus.OPEN}>Aberta</SelectItem>
                      <SelectItem value={OrderStatus.IN_PROGRESS}>Em Andamento</SelectItem>
                      <SelectItem value={OrderStatus.FINISHED}>Concluída</SelectItem>
                      <SelectItem value={OrderStatus.CANCELED}>Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* MUDANÇA: usa 'startDate' */}
                <div>
                  <Label htmlFor="startDate">Data de Início</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* MUDANÇA: usa 'endDate' */}
              {formData.status === OrderStatus.FINISHED && (
                <div>
                  <Label htmlFor="endDate">Data de Conclusão</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              )}

              {/* MUDANÇA: Lógica de Peças/Serviços atualizada */}
              <div>
                <Label>Serviços</Label>
                <div className="border rounded-lg p-4 max-h-32 overflow-y-auto">
                  {servicos.length === 0 ? (
                    <p className="text-sm text-gray-500">Nenhum serviço cadastrado</p>
                  ) : (
                    <div className="space-y-2">
                      {servicos.map((servico) => (
                        <div key={servico.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={formData.servicos.some(s => s.id === servico.id!)}
                            onCheckedChange={(checked) => handleServicoChange(servico.id!, !!checked)}
                          />
                          <label className="text-sm flex-1">
                            {servico.name} - {formatCurrency(servico.price)}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Peças</Label>
                <div className="border rounded-lg p-4 max-h-32 overflow-y-auto">
                  {pecas.length === 0 ? (
                    <p className="text-sm text-gray-500">Nenhuma peça cadastrada</p>
                  ) : (
                    <div className="space-y-2">
                      {pecas.map((peca) => (
                        <div key={peca.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={formData.pecas.some(p => p.id === peca.id!)}
                            onCheckedChange={(checked) => handlePecaChange(peca.id!, !!checked)}
                          />
                          <label className="text-sm flex-1">
                            {peca.name} - {formatCurrency(peca.price)}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* MUDANÇA: usa 'totalValue' */}
              <div>
                <Label htmlFor="totalValue">Valor Total</Label>
                <Input
                  id="totalValue"
                  type="number"
                  step="0.01"
                  value={formData.totalValue || calcularValorTotal()}
                  onChange={(e) => setFormData({ ...formData, totalValue: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Valor calculado automaticamente: {formatCurrency(calcularValorTotal())}
                </p>
              </div>

              {/* MUDANÇA: usa 'observations' */}
              <div>
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  value={formData.observations || ''}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  placeholder="Observações adicionais..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Salvando...' : (editingOrdem ? 'Atualizar' : 'Criar')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por número, cliente, veículo ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              {/* MUDANÇA: usa Enums */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value={OrderStatus.OPEN}>Abertas</SelectItem>
                  <SelectItem value={OrderStatus.IN_PROGRESS}>Em Andamento</SelectItem>
                  <SelectItem value={OrderStatus.FINISHED}>Concluídas</SelectItem>
                  <SelectItem value={OrderStatus.CANCELED}>Canceladas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Ordens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Ordens de Serviço ({filteredOrdens.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrdens.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Nenhuma ordem encontrada com os filtros aplicados.' 
                : 'Nenhuma ordem de serviço cadastrada ainda.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ordem</TableHead>
                    <TableHead>Cliente/Veículo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Datas</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrdens.map((ordem) => (
                    <TableRow key={ordem.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            {/* MUDANÇA: usa 'number' e 'description' */}
                            <div>{ordem.number}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {ordem.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <User className="h-3 w-3" />
                            {getClienteNome(ordem.clientId)}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Car className="h-3 w-3" />
                            {getVeiculo(ordem.vehicleId)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getStatusColor(ordem.status)} flex items-center gap-1`}>
                            {getStatusIcon(ordem.status)}
                            {getStatusText(ordem.status)}
                          </Badge>
                          {/* MUDANÇA: usa Enums */}
                          <Select 
                            value={ordem.status} 
                            onValueChange={(value) => handleStatusChange(ordem.id!, value as OrderStatus)}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={OrderStatus.OPEN}>Aberta</SelectItem>
                              <SelectItem value={OrderStatus.IN_PROGRESS}>Em Andamento</SelectItem>
                              <SelectItem value={OrderStatus.FINISHED}>Concluída</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {/* MUDANÇA: usa 'totalValue' */}
                          {formatCurrency(ordem.totalValue)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {/* MUDANÇA: usa 'startDate' e 'endDate' */}
                          <div>Início: {new Date(ordem.startDate).toLocaleDateString('pt-BR')}</div>
                          {ordem.endDate && (
                            <div>Fim: {new Date(ordem.endDate).toLocaleDateString('pt-BR')}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(ordem)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {/* MUDANÇA: usa 'number' */}
                                  Tem certeza que deseja excluir a ordem de serviço "{ordem.number}"? 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(ordem.id!)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}