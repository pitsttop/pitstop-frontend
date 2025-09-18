import { useEffect, useState } from 'react'
import { useApi, OrdemServico, Cliente, Veiculo, Peca, Servico } from '../hooks/useApi'
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
import { toast } from 'sonner@2.0.3'

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
  
  const [formData, setFormData] = useState<Omit<OrdemServico, 'id' | 'numero'>>({
    clienteId: '',
    veiculoId: '',
    descricao: '',
    servicosIds: [],
    pecasIds: [],
    valor: 0,
    status: 'aberta',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: '',
    observacoes: ''
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

  const resetForm = () => {
    setFormData({
      clienteId: '',
      veiculoId: '',
      descricao: '',
      servicosIds: [],
      pecasIds: [],
      valor: 0,
      status: 'aberta',
      dataInicio: new Date().toISOString().split('T')[0],
      dataFim: '',
      observacoes: ''
    })
    setEditingOrdem(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.clienteId || !formData.veiculoId) {
      toast.error('Selecione cliente e veículo')
      return
    }
    
    try {
      if (editingOrdem) {
        await updateOrdem(editingOrdem.id!, formData)
        toast.success('Ordem de serviço atualizada com sucesso!')
      } else {
        await createOrdem(formData)
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

  const handleEdit = (ordem: OrdemServico) => {
    setEditingOrdem(ordem)
    setFormData({
      clienteId: ordem.clienteId,
      veiculoId: ordem.veiculoId,
      descricao: ordem.descricao,
      servicosIds: ordem.servicosIds,
      pecasIds: ordem.pecasIds,
      valor: ordem.valor,
      status: ordem.status,
      dataInicio: ordem.dataInicio,
      dataFim: ordem.dataFim || '',
      observacoes: ordem.observacoes || ''
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

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const updateData: Partial<OrdemServico> = { status: newStatus as OrdemServico['status'] }
      if (newStatus === 'concluida' && !ordens.find(o => o.id === id)?.dataFim) {
        updateData.dataFim = new Date().toISOString().split('T')[0]
      }
      
      await updateOrdem(id, updateData)
      toast.success('Status atualizado com sucesso!')
      loadData()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast.error('Erro ao atualizar status')
    }
  }

  const getClienteNome = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId)
    return cliente?.nome || 'Cliente não encontrado'
  }

  const getVeiculo = (veiculoId: string) => {
    const veiculo = veiculos.find(v => v.id === veiculoId)
    return veiculo ? `${veiculo.marca} ${veiculo.modelo} - ${veiculo.placa}` : 'Veículo não encontrado'
  }

  const getVeiculosByCliente = (clienteId: string) => {
    return veiculos.filter(v => v.clienteId === clienteId)
  }

  const calcularValorTotal = () => {
    const valorServicos = formData.servicosIds.reduce((total, servicoId) => {
      const servico = servicos.find(s => s.id === servicoId)
      return total + (servico?.preco || 0)
    }, 0)

    const valorPecas = formData.pecasIds.reduce((total, pecaId) => {
      const peca = pecas.find(p => p.id === pecaId)
      return total + (peca?.preco || 0)
    }, 0)

    return valorServicos + valorPecas
  }

  const filteredOrdens = ordens.filter(ordem => {
    const matchesSearch = (
      ordem.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClienteNome(ordem.clienteId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getVeiculo(ordem.veiculoId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    const matchesStatus = statusFilter === 'all' || ordem.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aberta':
        return <AlertCircle className="h-4 w-4" />
      case 'andamento':
        return <Clock className="h-4 w-4" />
      case 'concluida':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberta':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'andamento':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'concluida':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

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
                    value={formData.clienteId} 
                    onValueChange={(value) => {
                      setFormData({ ...formData, clienteId: value, veiculoId: '' })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id!}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="veiculo">Veículo</Label>
                  <Select 
                    value={formData.veiculoId} 
                    onValueChange={(value) => setFormData({ ...formData, veiculoId: value })}
                    disabled={!formData.clienteId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {getVeiculosByCliente(formData.clienteId).map((veiculo) => (
                        <SelectItem key={veiculo.id} value={veiculo.id!}>
                          {veiculo.marca} {veiculo.modelo} - {veiculo.placa}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição do Problema</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  required
                  placeholder="Descreva o problema ou serviço solicitado..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as OrdemServico['status'] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aberta">Aberta</SelectItem>
                      <SelectItem value="andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluida">Concluída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dataInicio">Data de Início</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={formData.dataInicio}
                    onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                    required
                  />
                </div>
              </div>

              {formData.status === 'concluida' && (
                <div>
                  <Label htmlFor="dataFim">Data de Conclusão</Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={formData.dataFim}
                    onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                  />
                </div>
              )}

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
                            checked={formData.servicosIds.includes(servico.id!)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  servicosIds: [...formData.servicosIds, servico.id!]
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  servicosIds: formData.servicosIds.filter(id => id !== servico.id)
                                })
                              }
                            }}
                          />
                          <label className="text-sm flex-1">
                            {servico.nome} - {formatCurrency(servico.preco)}
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
                            checked={formData.pecasIds.includes(peca.id!)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  pecasIds: [...formData.pecasIds, peca.id!]
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  pecasIds: formData.pecasIds.filter(id => id !== peca.id)
                                })
                              }
                            }}
                          />
                          <label className="text-sm flex-1">
                            {peca.nome} - {formatCurrency(peca.preco)}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="valor">Valor Total</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={formData.valor || calcularValorTotal()}
                  onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Valor calculado automaticamente: {formatCurrency(calcularValorTotal())}
                </p>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="aberta">Abertas</SelectItem>
                  <SelectItem value="andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluídas</SelectItem>
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
                            <div>{ordem.numero}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {ordem.descricao}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <User className="h-3 w-3" />
                            {getClienteNome(ordem.clienteId)}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Car className="h-3 w-3" />
                            {getVeiculo(ordem.veiculoId)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getStatusColor(ordem.status)} flex items-center gap-1`}>
                            {getStatusIcon(ordem.status)}
                            {ordem.status === 'aberta' ? 'Aberta' : 
                             ordem.status === 'andamento' ? 'Em Andamento' : 'Concluída'}
                          </Badge>
                          <Select 
                            value={ordem.status} 
                            onValueChange={(value) => handleStatusChange(ordem.id!, value)}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="aberta">Aberta</SelectItem>
                              <SelectItem value="andamento">Em Andamento</SelectItem>
                              <SelectItem value="concluida">Concluída</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(ordem.valor)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div>Início: {new Date(ordem.dataInicio).toLocaleDateString('pt-BR')}</div>
                          {ordem.dataFim && (
                            <div>Fim: {new Date(ordem.dataFim).toLocaleDateString('pt-BR')}</div>
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
                                  Tem certeza que deseja excluir a ordem de serviço "{ordem.numero}"? 
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