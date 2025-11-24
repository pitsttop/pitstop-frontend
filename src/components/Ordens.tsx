import { useEffect, useState } from 'react'
import { useApi, OrdemServico, Cliente, Veiculo, Peca, Servico, OrderStatus } from '../hooks/useApi'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Badge } from '../components/ui/badge'
import { Checkbox } from '../components/ui/checkbox'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog'
import { Plus, Edit, Trash2, FileText, User, Car, Clock, CheckCircle, AlertCircle, Settings, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

type OrdemFormData = Omit<OrdemServico, 'id' | 'createdAt' | 'updatedAt' | 'partsUsed' | 'servicesPerformed' | 'clientId' | 'vehicleId' | 'status'> & {
  clientId: string; 
  vehicleId: string; 
  status: OrderStatus;
  servicosSelecionados: string[]; 
  pecasSelecionadas: { id: string, quantity: number }[];
}

export function Ordens() {
  const { 
    getOrdens, createOrdem, updateOrdem, deleteOrdem,
    updateOrdemStatus,
    addPartToOrdem, addServiceToOrdem,
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
  
  const initialFormData: OrdemFormData = {
    clientId: '',
    vehicleId: '',
    number: '',
    description: '',
    observations: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    servicosSelecionados: [],
    pecasSelecionadas: [],
    totalValue: 0,
    status: OrderStatus.OPEN,
  }

  const [formData, setFormData] = useState<OrdemFormData>(initialFormData)

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

  const resetForm = () => {
    setFormData(initialFormData)
    setEditingOrdem(null)
  }

  const handleEdit = (ordem: OrdemServico) => {
    setEditingOrdem(ordem)
    
    const servicosIds = (ordem.servicesPerformed || []).map(s => s.serviceId);
    
    const pecasList = (ordem.partsUsed || [])
      .map(p => ({ id: p.part?.id || '', quantity: p.quantity }))
      .filter(p => p.id);

    setFormData({
      clientId: ordem.clientId,
      vehicleId: ordem.vehicleId,
      number: ordem.number,
      description: ordem.description,
      observations: ordem.observations || '',
      startDate: new Date(ordem.startDate).toISOString().split('T')[0],
      endDate: ordem.endDate ? new Date(ordem.endDate).toISOString().split('T')[0] : '',
      status: ordem.status,
      totalValue: getOrdemTotalValue(ordem),
      servicosSelecionados: servicosIds,
      pecasSelecionadas: pecasList,
    })
    setDialogOpen(true)
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.clientId || !formData.vehicleId) {
      toast.error('Selecione cliente e veículo')
      return
    }

  const { servicosSelecionados, pecasSelecionadas, ...ordemData } = formData

  const totalCalculado = calcularValorTotal()
  const totalParaEnviar = typeof formData.totalValue === 'number' && !Number.isNaN(formData.totalValue)
    ? Number(formData.totalValue)
    : totalCalculado
    
  const dataToSubmit = {
    ...ordemData,
    startDate: new Date(ordemData.startDate).toISOString(),
    observations: ordemData.observations || null,
    endDate: ordemData.endDate ? new Date(ordemData.endDate).toISOString() : null,
    totalValue: totalParaEnviar,
  };

    try {
      let ordemId = editingOrdem?.id;

      if (editingOrdem) {
        await updateOrdem(ordemId!, dataToSubmit);
        toast.success('Detalhes da ordem atualizados com sucesso!');
      } else {
        const createdOrdem = await createOrdem(dataToSubmit);
        ordemId = createdOrdem.id;
        
        for (const serviceId of servicosSelecionados) {
            await addServiceToOrdem(ordemId, serviceId);
        }

        for (const pecaForm of pecasSelecionadas) {
            await addPartToOrdem(ordemId, pecaForm.id, pecaForm.quantity);
        }
        
        toast.success('Ordem de serviço criada com sucesso!');
      }

      setDialogOpen(false)
      resetForm()
      loadData()
    } catch (error: any) {
      console.error('Erro ao salvar ordem:', error)
      const errorMsg = error.message || 'Erro ao salvar ordem de serviço';
      toast.error(errorMsg)
    }
  }
  
  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    try {
      const ordemAtual = ordens.find(o => o.id === id);

      await updateOrdemStatus(id, {
        status: newStatus,
        totalValue: newStatus === OrderStatus.FINISHED && ordemAtual ? calcularValorTotalDeOrdemExistente(ordemAtual) : null,
        endDate: newStatus === OrderStatus.FINISHED ? new Date().toISOString() : undefined,
      }); 
      
      toast.success('Status atualizado com sucesso!')
      loadData()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast.error('Erro ao atualizar status')
    }
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

  const getClienteNome = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId)
    return cliente?.name || 'Cliente não encontrado'
  }

  const getVeiculo = (vehicleId: string) => {
    const veiculo = veiculos.find(v => v.id === vehicleId)
    return veiculo ? `${veiculo.brand} ${veiculo.model} - ${veiculo.plate}` : 'Veículo não encontrado'
  }

  const getVeiculosByCliente = (clienteId: string) => {
    return veiculos.filter((v: any) => v.ownerId === clienteId) 
  }
  
  const parseMoneyValue = (value: any): number => {
    if (value === null || value === undefined) return 0
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string') {
      const normalized = value
        .replace(/[^0-9,.-]/g, '')
        .replace(',', '.')
      const parsed = parseFloat(normalized)
      return Number.isFinite(parsed) ? parsed : 0
    }
    return 0
  }

  const parseQuantityValue = (value: any): number => {
    if (value === null || value === undefined) return 0
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string') {
      const parsed = parseFloat(value)
      return Number.isFinite(parsed) ? parsed : 0
    }
    return 0
  }

  const getServicePriceFromRelation = (item: any): number => {
    if (!item) return 0
    return parseMoneyValue(
      item.service?.price ??
      item.price ??
      item.valor ??
      item.value ??
      item.amount ??
      item.total
    )
  }

  const getPartPriceFromRelation = (item: any): number => {
    if (!item) return 0
    return parseMoneyValue(
      item.part?.price ??
      item.price ??
      item.valor ??
      item.value ??
      item.amount ??
      item.total
    )
  }

  const calcularValorTotalDeOrdemExistente = (ordem: OrdemServico): number => {
    if (!ordem) return 0

    const servicesTotal = (ordem.servicesPerformed || []).reduce((acc, curr) => {
      return acc + getServicePriceFromRelation(curr)
    }, 0)

    const partsTotal = (ordem.partsUsed || []).reduce((acc, curr) => {
      const rawQuantity = curr.quantity ?? (curr as any)?.qtd ?? (curr as any)?.qtdUtilizada ?? 1
      const quantity = parseQuantityValue(rawQuantity) || 0
      return acc + getPartPriceFromRelation(curr) * (quantity || 0)
    }, 0)

    const total = servicesTotal + partsTotal
    return Number.isFinite(total) ? Number(total) : 0
  }

  const getOrdemTotalValue = (ordem: OrdemServico): number => {
    const existing = ordem?.totalValue
    if (typeof existing === 'number' && Number.isFinite(existing)) {
      return existing
    }
    return calcularValorTotalDeOrdemExistente(ordem)
  }

  const calcularValorTotal = (
    pecasOverride?: { id: string, quantity: number }[] | null,
    servicosOverride?: string[] | null
  ) => {
    const servicosSelecionados = servicosOverride !== undefined && servicosOverride !== null
      ? servicosOverride
      : formData.servicosSelecionados

    const valorServicos = servicosSelecionados.reduce((total, servicoId) => {
      const servico = servicos.find(s => s.id === servicoId)
      return total + (servico?.price || 0)
    }, 0)

    const pecasParaCalcular = pecasOverride !== undefined
      ? (pecasOverride ?? [])
      : formData.pecasSelecionadas

    const valorPecas = pecasParaCalcular.reduce((total, pecaForm) => {
      const peca = pecas.find(p => p.id === pecaForm.id)
      const preco = peca?.price || 0
      return total + preco * (pecaForm.quantity || 0)
    }, 0)

    const total = valorServicos + valorPecas
    return Number.isFinite(total) ? Number(total.toFixed(2)) : 0
  }

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

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.OPEN: return <AlertCircle className="h-4 w-4" />;
      case OrderStatus.IN_PROGRESS: return <Clock className="h-4 w-4" />;
      case OrderStatus.FINISHED: return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
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
      case OrderStatus.OPEN: return 'bg-orange-100 text-orange-800 border-orange-200';
      case OrderStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800 border-blue-200';
      case OrderStatus.FINISHED: return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
  
  const handlePecaChange = (pecaId: string, checked: boolean, currentQuantity: number = 1) => {
     setFormData(prev => {
       const pecas = checked
         ? [...prev.pecasSelecionadas, { id: pecaId, quantity: currentQuantity }]
         : prev.pecasSelecionadas.filter(p => p.id !== pecaId)
       const totalAtualizado = calcularValorTotal(pecas, prev.servicosSelecionados)
       return { ...prev, pecasSelecionadas: pecas, totalValue: totalAtualizado }
     })
  };

  const handlePecaQuantityChange = (pecaId: string, newQuantity: number) => {
     setFormData(prev => {
       const pecas = prev.pecasSelecionadas.map(p =>
         p.id === pecaId ? { ...p, quantity: newQuantity } : p
       )
       const totalAtualizado = calcularValorTotal(pecas, prev.servicosSelecionados)
       return { ...prev, pecasSelecionadas: pecas, totalValue: totalAtualizado }
     })
  };

  const handleServicoChange = (servicoId: string, checked: boolean) => {
     setFormData(prev => {
       const servicosSelecionados = checked
         ? [...prev.servicosSelecionados, servicoId]
         : prev.servicosSelecionados.filter(s => s !== servicoId)
       const totalAtualizado = calcularValorTotal(prev.pecasSelecionadas, servicosSelecionados)
       return { ...prev, servicosSelecionados, totalValue: totalAtualizado }
     })
  };
  
  const getPecaQuantity = (pecaId: string) => {
    return formData.pecasSelecionadas.find(p => p.id === pecaId)?.quantity || 1;
  };
  
  const isPecaSelected = (pecaId: string) => {
    return formData.pecasSelecionadas.some(p => p.id === pecaId);
  };
  
  const isServicoSelected = (servicoId: string) => {
    return formData.servicosSelecionados.some(s => s === servicoId);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="admin-ordens-title">Ordens de Serviço</h1>
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
                    disabled={!!editingOrdem} 
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((cliente) => (
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
                    disabled={!formData.clientId || !!editingOrdem} 
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {getVeiculosByCliente(formData.clientId).map((veiculo) => (
                        <SelectItem key={veiculo.id} value={veiculo.id!}>
                          {veiculo.brand} {veiculo.model} - {veiculo.plate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="description">Descrição do Problema</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    placeholder="Descreva o problema..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
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

                <div>
                  <Label htmlFor="endDate">Data de Conclusão</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    disabled={formData.status !== OrderStatus.FINISHED}
                  />
                </div>
              </div>
              
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

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Itens da Ordem
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Serviços ({formatCurrency(calcularValorTotal() - calcularValorTotal(formData.pecasSelecionadas))})</Label>
                    <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                      {servicos.length === 0 ? (
                        <p className="text-sm text-gray-500">Nenhum serviço cadastrado</p>
                      ) : (
                        servicos.map((servico) => (
                          <div key={servico.id} className="flex items-center justify-between space-x-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    checked={isServicoSelected(servico.id!)}
                                    onCheckedChange={(checked) => handleServicoChange(servico.id!, !!checked)}
                                    disabled={!!editingOrdem} 
                                />
                                <label className="text-sm flex-1">{servico.name}</label>
                            </div>
                            <span className="text-xs text-gray-500">{formatCurrency(servico.price)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Peças ({formatCurrency(calcularValorTotal(formData.pecasSelecionadas))})</Label>
                    <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                      {pecas.length === 0 ? (
                        <p className="text-sm text-gray-500">Nenhuma peça cadastrada</p>
                      ) : (
                        pecas.map((peca) => {
                          const isChecked = isPecaSelected(peca.id!);
                          const quantity = getPecaQuantity(peca.id!);
                          
                          return (
                            <div key={peca.id} className="flex items-center justify-between space-x-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(checked) => handlePecaChange(peca.id!, !!checked)}
                                    disabled={!!editingOrdem} 
                                />
                                <label className="text-sm flex-1">{peca.name}</label>
                              </div>
                              {isChecked && (
                                <Input
                                  type="number"
                                  min="1"
                                  value={quantity}
                                  onChange={(e) => {
                                    const newQuantity = Math.max(1, parseInt(e.target.value) || 1);
                                    handlePecaQuantityChange(peca.id!, newQuantity);
                                  }}
                                  className="w-16 h-8 text-right text-xs"
                                  disabled={!!editingOrdem} 
                                />
                              )}
                              {!isChecked && <span className="text-xs text-gray-500">{formatCurrency(peca.price)}</span>}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                  
                </CardContent>
              </Card>

              <div>
                <Label htmlFor="totalValue">Valor Total Final (R$)</Label>
                <Input
                  id="totalValue"
                  type="number"
                  step="0.01"
                  value={formData.totalValue ?? calcularValorTotal()}
                  onChange={(e) => setFormData({ ...formData, totalValue: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Salvando...' : (editingOrdem ? 'Atualizar Ordem' : 'Criar')}
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

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value={OrderStatus.OPEN}>Aberta</SelectItem>
                  <SelectItem value={OrderStatus.IN_PROGRESS}>Em Andamento</SelectItem>
                  <SelectItem value={OrderStatus.FINISHED}>Concluída</SelectItem>
                  <SelectItem value={OrderStatus.CANCELED}>Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Ordens de Serviço ({filteredOrdens.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrdens.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nenhuma ordem encontrada.</div>
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
                            <div>{ordem.number}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{ordem.description}</div>
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
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(ordem.totalValue)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div>Início: {new Date(ordem.startDate).toLocaleDateString('pt-BR')}</div>
                          {ordem.endDate && (
                            <div>Fim: {new Date(ordem.endDate).toLocaleDateString('pt-BR')}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(ordem)}>
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
                                  Tem certeza que deseja excluir a ordem "{ordem.number}"?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(ordem.id!)} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
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