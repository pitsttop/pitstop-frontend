import { useEffect, useState } from 'react'
import { useApi, Servico } from '../hooks/useApi'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog'
import { Plus, Edit, Trash2, Settings, Clock, DollarSign, Tag } from 'lucide-react'
import { toast } from 'sonner@2.0.3'

export function Servicos() {
  const { getServicos, createServico, updateServico, deleteServico, loading } = useApi()
  const [servicos, setServicos] = useState<Servico[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingServico, setEditingServico] = useState<Servico | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  
  const [formData, setFormData] = useState<Omit<Servico, 'id'>>({
    nome: '',
    descricao: '',
    preco: 0,
    tempoDuracao: 60,
    categoria: ''
  })

  const categorias = [
    'Manutenção Preventiva',
    'Manutenção Corretiva',
    'Troca de Óleo',
    'Freios',
    'Suspensão',
    'Motor',
    'Transmissão',
    'Elétrica',
    'Ar Condicionado',
    'Pneus',
    'Alinhamento',
    'Balanceamento',
    'Estética',
    'Outros'
  ]

  useEffect(() => {
    loadServicos()
  }, [])

  const loadServicos = async () => {
    try {
      const data = await getServicos()
      setServicos(data)
    } catch (error) {
      console.error('Erro ao carregar serviços:', error)
      toast.error('Erro ao carregar serviços')
    }
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      preco: 0,
      tempoDuracao: 60,
      categoria: ''
    })
    setEditingServico(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingServico) {
        await updateServico(editingServico.id!, formData)
        toast.success('Serviço atualizado com sucesso!')
      } else {
        await createServico(formData)
        toast.success('Serviço criado com sucesso!')
      }
      
      setDialogOpen(false)
      resetForm()
      loadServicos()
    } catch (error) {
      console.error('Erro ao salvar serviço:', error)
      toast.error('Erro ao salvar serviço')
    }
  }

  const handleEdit = (servico: Servico) => {
    setEditingServico(servico)
    setFormData({
      nome: servico.nome,
      descricao: servico.descricao,
      preco: servico.preco,
      tempoDuracao: servico.tempoDuracao,
      categoria: servico.categoria
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteServico(id)
      toast.success('Serviço excluído com sucesso!')
      loadServicos()
    } catch (error) {
      console.error('Erro ao excluir serviço:', error)
      toast.error('Erro ao excluir serviço')
    }
  }

  const filteredServicos = servicos.filter(servico => {
    const matchesSearch = (
      servico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servico.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servico.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    const matchesCategory = categoryFilter === 'all' || servico.categoria === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`
    } else {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      if (remainingMinutes === 0) {
        return `${hours}h`
      } else {
        return `${hours}h${remainingMinutes}min`
      }
    }
  }

  const getCategoryColor = (categoria: string) => {
    const colors: { [key: string]: string } = {
      'Manutenção Preventiva': 'bg-green-100 text-green-800 border-green-200',
      'Manutenção Corretiva': 'bg-red-100 text-red-800 border-red-200',
      'Troca de Óleo': 'bg-blue-100 text-blue-800 border-blue-200',
      'Freios': 'bg-purple-100 text-purple-800 border-purple-200',
      'Suspensão': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Motor': 'bg-orange-100 text-orange-800 border-orange-200',
      'Transmissão': 'bg-pink-100 text-pink-800 border-pink-200',
      'Elétrica': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Ar Condicionado': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'Pneus': 'bg-gray-100 text-gray-800 border-gray-200',
      'Alinhamento': 'bg-teal-100 text-teal-800 border-teal-200',
      'Balanceamento': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Estética': 'bg-rose-100 text-rose-800 border-rose-200',
      'Outros': 'bg-slate-100 text-slate-800 border-slate-200'
    }
    return colors[categoria] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const uniqueCategories = [...new Set(servicos.map(s => s.categoria))].sort()

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1>Catálogo de Serviços</h1>
          <p className="text-gray-600">Gerencie os serviços oferecidos pela oficina</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingServico ? 'Editar Serviço' : 'Novo Serviço'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome do Serviço</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  placeholder="Nome do serviço"
                />
              </div>
              
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição detalhada do serviço"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preco">Preço (R$)</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    value={formData.preco}
                    onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) || 0 })}
                    required
                    min="0"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="tempoDuracao">Duração (minutos)</Label>
                  <Input
                    id="tempoDuracao"
                    type="number"
                    value={formData.tempoDuracao}
                    onChange={(e) => setFormData({ ...formData, tempoDuracao: parseInt(e.target.value) || 60 })}
                    required
                    min="15"
                    step="15"
                    placeholder="60"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Salvando...' : (editingServico ? 'Atualizar' : 'Criar')}
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
                placeholder="Buscar por nome, descrição ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {uniqueCategories.map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Serviços */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Serviços Disponíveis ({filteredServicos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredServicos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || categoryFilter !== 'all'
                ? 'Nenhum serviço encontrado com os filtros aplicados.'
                : 'Nenhum serviço cadastrado ainda.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServicos.map((servico) => (
                    <TableRow key={servico.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Settings className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div>{servico.nome}</div>
                            {servico.descricao && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {servico.descricao}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getCategoryColor(servico.categoria)} flex items-center gap-1 w-fit`}>
                          <Tag className="h-3 w-3" />
                          {servico.categoria}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(servico.preco)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(servico.tempoDuracao)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(servico)}
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
                                  Tem certeza que deseja excluir o serviço "{servico.nome}"? 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(servico.id!)}
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

      {/* Resumo por Categoria */}
      {uniqueCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uniqueCategories.map((categoria) => {
                const servicosCategoria = servicos.filter(s => s.categoria === categoria)
                const precoMedio = servicosCategoria.length > 0 
                  ? servicosCategoria.reduce((acc, s) => acc + s.preco, 0) / servicosCategoria.length 
                  : 0
                
                return (
                  <div key={categoria} className="text-center">
                    <Badge className={`${getCategoryColor(categoria)} mb-2`}>
                      {categoria}
                    </Badge>
                    <div className="text-sm space-y-1">
                      <div>{servicosCategoria.length} serviços</div>
                      <div className="text-gray-500">
                        Média: {formatCurrency(precoMedio)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}