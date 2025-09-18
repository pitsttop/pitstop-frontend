import { useEffect, useState } from 'react'
import { useApi, Veiculo, Cliente } from '../hooks/useApi'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog'
import { Plus, Edit, Trash2, Car, User, Calendar, Gauge } from 'lucide-react'
import { toast } from 'sonner@2.0.3'

export function Veiculos() {
  const { getVeiculos, createVeiculo, updateVeiculo, deleteVeiculo, getClientes, loading } = useApi()
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingVeiculo, setEditingVeiculo] = useState<Veiculo | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [formData, setFormData] = useState<Omit<Veiculo, 'id'>>({
    clienteId: '',
    marca: '',
    modelo: '',
    ano: new Date().getFullYear(),
    placa: '',
    cor: '',
    combustivel: '',
    km: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [veiculosData, clientesData] = await Promise.all([
        getVeiculos(),
        getClientes()
      ])
      setVeiculos(veiculosData)
      setClientes(clientesData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados')
    }
  }

  const resetForm = () => {
    setFormData({
      clienteId: '',
      marca: '',
      modelo: '',
      ano: new Date().getFullYear(),
      placa: '',
      cor: '',
      combustivel: '',
      km: 0
    })
    setEditingVeiculo(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.clienteId) {
      toast.error('Selecione um cliente')
      return
    }
    
    try {
      if (editingVeiculo) {
        await updateVeiculo(editingVeiculo.id!, formData)
        toast.success('Veículo atualizado com sucesso!')
      } else {
        await createVeiculo(formData)
        toast.success('Veículo criado com sucesso!')
      }
      
      setDialogOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      console.error('Erro ao salvar veículo:', error)
      toast.error('Erro ao salvar veículo')
    }
  }

  const handleEdit = (veiculo: Veiculo) => {
    setEditingVeiculo(veiculo)
    setFormData({
      clienteId: veiculo.clienteId,
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      ano: veiculo.ano,
      placa: veiculo.placa,
      cor: veiculo.cor,
      combustivel: veiculo.combustivel,
      km: veiculo.km
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteVeiculo(id)
      toast.success('Veículo excluído com sucesso!')
      loadData()
    } catch (error) {
      console.error('Erro ao excluir veículo:', error)
      toast.error('Erro ao excluir veículo')
    }
  }

  const getClienteNome = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId)
    return cliente?.nome || 'Cliente não encontrado'
  }

  const filteredVeiculos = veiculos.filter(veiculo => {
    const clienteNome = getClienteNome(veiculo.clienteId)
    return (
      veiculo.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veiculo.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veiculo.ano.toString().includes(searchTerm)
    )
  })

  const formatPlaca = (placa: string) => {
    // Formato brasileiro: ABC-1234 ou ABC1D23
    if (placa.length === 7) {
      return placa.replace(/([A-Z]{3})([0-9]{4})/, '$1-$2')
    }
    return placa
  }

  const formatKm = (km: number) => {
    return new Intl.NumberFormat('pt-BR').format(km) + ' km'
  }

  const combustivelOptions = [
    { value: 'gasolina', label: 'Gasolina' },
    { value: 'etanol', label: 'Etanol' },
    { value: 'flex', label: 'Flex' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'gnv', label: 'GNV' },
    { value: 'eletrico', label: 'Elétrico' },
    { value: 'hibrido', label: 'Híbrido' }
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1>Gestão de Veículos</h1>
          <p className="text-gray-600">Gerencie a frota de veículos dos seus clientes</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Veículo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingVeiculo ? 'Editar Veículo' : 'Novo Veículo'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="cliente">Cliente</Label>
                <Select value={formData.clienteId} onValueChange={(value) => setFormData({ ...formData, clienteId: value })}>
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="marca">Marca</Label>
                  <Input
                    id="marca"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    required
                    placeholder="Ex: Toyota"
                  />
                </div>
                
                <div>
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input
                    id="modelo"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    required
                    placeholder="Ex: Corolla"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ano">Ano</Label>
                  <Select value={formData.ano.toString()} onValueChange={(value) => setFormData({ ...formData, ano: parseInt(value) })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="placa">Placa</Label>
                  <Input
                    id="placa"
                    value={formData.placa}
                    onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                    required
                    placeholder="ABC-1234"
                    maxLength={8}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cor">Cor</Label>
                  <Input
                    id="cor"
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                    required
                    placeholder="Ex: Branco"
                  />
                </div>
                
                <div>
                  <Label htmlFor="combustivel">Combustível</Label>
                  <Select value={formData.combustivel} onValueChange={(value) => setFormData({ ...formData, combustivel: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {combustivelOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="km">Quilometragem</Label>
                <Input
                  id="km"
                  type="number"
                  value={formData.km}
                  onChange={(e) => setFormData({ ...formData, km: parseInt(e.target.value) || 0 })}
                  required
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Salvando...' : (editingVeiculo ? 'Atualizar' : 'Criar')}
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

      {/* Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Buscar por marca, modelo, placa, cliente ou ano..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Veículos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Veículos ({filteredVeiculos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVeiculos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Nenhum veículo encontrado com os termos de busca.' : 'Nenhum veículo cadastrado ainda.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Detalhes</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVeiculos.map((veiculo) => (
                    <TableRow key={veiculo.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Car className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div>{veiculo.marca} {veiculo.modelo}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              {veiculo.ano} • {veiculo.cor}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {getClienteNome(veiculo.clienteId)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {formatPlaca(veiculo.placa)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1">
                            <Gauge className="h-3 w-3" />
                            {formatKm(veiculo.km)}
                          </div>
                          <div>
                            <Badge variant="secondary" className="text-xs">
                              {combustivelOptions.find(c => c.value === veiculo.combustivel)?.label || veiculo.combustivel}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(veiculo)}
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
                                  Tem certeza que deseja excluir o veículo "{veiculo.marca} {veiculo.modelo} - {formatPlaca(veiculo.placa)}"? 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(veiculo.id!)}
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