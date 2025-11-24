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
import { Plus, Edit, Trash2, Car, User, Calendar, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { isValidPlate, formatPlateInput, getValidationErrorMessage } from '../utils/validation'

type VeiculoFormData = Omit<Veiculo, 'id' | 'createdAt'>;

export function Veiculos() {
  const { getVeiculos, createVeiculo, updateVeiculo, deleteVeiculo, getClientes, loading } = useApi()
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingVeiculo, setEditingVeiculo] = useState<Veiculo | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [plateError, setPlateError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<VeiculoFormData>({
    ownerId: '', 
    brand: '', 
    model: '',   
    year: new Date().getFullYear(), 
    plate: '',   
    color: '',   
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
      ownerId: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      plate: '',
      color: '',
    })
    setEditingVeiculo(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.ownerId) {
      toast.error('Selecione um cliente')
      return
    }

    if (!isValidPlate(formData.plate)) {
      setPlateError(getValidationErrorMessage('plate', 'plate'))
      toast.error(getValidationErrorMessage('plate', 'plate'))
      return
    }

    setPlateError(null)
    
    const dataToSubmit: VeiculoFormData = {
      ...formData,
      color: formData.color || null,
    };
    
    try {
      if (editingVeiculo) {
        await updateVeiculo(editingVeiculo.id!, dataToSubmit)
        toast.success('Veículo atualizado com sucesso!')
      } else {
        await createVeiculo(dataToSubmit)
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
      ownerId: veiculo.ownerId,
      brand: veiculo.brand,
      model: veiculo.model,
      year: veiculo.year,
      plate: veiculo.plate,
      color: veiculo.color || '', 
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
    return cliente?.name || 'Cliente não encontrado' 
  }

  const filteredVeiculos = veiculos.filter(veiculo => {
    const clienteNome = getClienteNome(veiculo.ownerId) 
    return (
      veiculo.brand.toLowerCase().includes(searchTerm.toLowerCase()) || 
      veiculo.model.toLowerCase().includes(searchTerm.toLowerCase()) || 
      veiculo.plate.toLowerCase().includes(searchTerm.toLowerCase()) || 
      clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veiculo.year.toString().includes(searchTerm) 
    )
  })

  const formatPlaca = (placa: string) => {
    if (placa.length === 7) {
      return placa.replace(/([A-Z]{3})([0-9]{4})/, '$1-$2')
    }
    return placa
  }


  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 data-testid="admin-veiculos-title">Gestão de Veículos</h1>
          <p className="text-gray-600">Gerencie a frota de veículos dos seus clientes</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setPlateError(null)
            resetForm()
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm()
              setPlateError(null)
            }}>
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
                <Select value={formData.ownerId} onValueChange={(value) => setFormData({ ...formData, ownerId: value })}>
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand">Marca</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    required
                    placeholder="Ex: Toyota"
                  />
                </div>
                
                <div>
                  <Label htmlFor="model">Modelo</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    required
                    placeholder="Ex: Corolla"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Ano</Label>
                  <Select value={formData.year.toString()} onValueChange={(value) => setFormData({ ...formData, year: parseInt(value) })}>
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
                  <Label htmlFor="plate">Placa</Label>
                  <Input
                    id="plate"
                    value={formData.plate}
                    onChange={(e) => setFormData({ ...formData, plate: formatPlateInput(e.target.value) })}
                    onBlur={() => {
                      if (formData.plate && !isValidPlate(formData.plate)) {
                        setPlateError(getValidationErrorMessage('plate', 'plate'))
                      } else {
                        setPlateError(null)
                      }
                    }}
                    required
                    placeholder="ABC-1234 ou ABC1D23"
                    maxLength={8}
                    className={plateError ? 'border-red-500' : ''}
                  />
                  {plateError && (
                    <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{plateError}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1"> 
                <div>
                  <Label htmlFor="color">Cor</Label>
                  <Input
                    id="color"
                    value={formData.color || ''}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="Ex: Branco"
                  />
                </div>
                
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
                            <div>{veiculo.brand} {veiculo.model}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              {veiculo.year} • {veiculo.color || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {getClienteNome(veiculo.ownerId)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {formatPlaca(veiculo.plate)}
                        </Badge>
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
                                  Tem certeza que deseja excluir o veículo "{veiculo.brand} {veiculo.model} - {formatPlaca(veiculo.plate)}"? 
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