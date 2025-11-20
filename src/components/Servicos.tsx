import { useEffect, useState } from 'react'
import { useApi, Servico } from '../hooks/useApi'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
// MUDANÇA: Imports não utilizados removidos (Badge, Select)
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog'
import { Plus, Edit, Trash2, Settings, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

// MUDANÇA: Tipo de formulário para bater com a interface Servico (sem ID)
type ServicoFormData = Omit<Servico, 'id'>;

export function Servicos() {
  const { getServicos, createServico, updateServico, deleteServico, loading } = useApi()
  const [servicos, setServicos] = useState<Servico[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingServico, setEditingServico] = useState<Servico | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  // MUDANÇA: Filtro de categoria removido
  
  // MUDANÇA: 'formData' atualizado para bater com a interface (sem tempoDuracao, categoria)
  const [formData, setFormData] = useState<ServicoFormData>({
    name: '',
    description: '',
    price: 0,
  })

  // MUDANÇA: Array de 'categorias' removido

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

  // MUDANÇA: 'resetForm' atualizado
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
    })
    setEditingServico(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prepara dados para enviar (convertendo campos vazios para null)
    const dataToSubmit: ServicoFormData = {
      ...formData,
      description: formData.description || null,
    };
    
    try {
      if (editingServico) {
        await updateServico(editingServico.id!, dataToSubmit)
        toast.success('Serviço atualizado com sucesso!')
      } else {
        await createServico(dataToSubmit)
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

  // MUDANÇA: 'handleEdit' atualizado
  const handleEdit = (servico: Servico) => {
    setEditingServico(servico)
    setFormData({
      name: servico.name,
      description: servico.description || '', // Protege contra null
      price: servico.price,
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

  // MUDANÇA: 'filteredServicos' atualizado (sem categoria)
  const filteredServicos = servicos.filter(servico => {
    const matchesSearch = (
      servico.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (servico.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    return matchesSearch
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // MUDANÇA: Funções 'formatDuration', 'getCategoryColor', 'uniqueCategories' removidas

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
              {/* MUDANÇA: usa 'name' */}
              <div>
                <Label htmlFor="name">Nome do Serviço</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Nome do serviço"
                />
              </div>
              
              {/* MUDANÇA: Campo 'categoria' REMOVIDO */}
              
              {/* MUDANÇA: usa 'description' */}
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição detalhada do serviço"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1"> {/* MUDANÇA: Apenas um campo agora */}
                {/* MUDANÇA: usa 'price' */}
                <div>
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    required
                    min="0"
                    placeholder="0.00"
                  />
                </div>
                
                {/* MUDANÇA: Campo 'tempoDuracao' REMOVIDO */}
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
              {/* MUDANÇA: Placeholder atualizado */}
              <Input
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* MUDANÇA: Filtro de 'categoria' REMOVIDO */}
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
              {searchTerm 
                ? 'Nenhum serviço encontrado com os filtros aplicados.'
                : 'Nenhum serviço cadastrado ainda.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serviço</TableHead>
                    {/* MUDANÇA: Coluna 'Categoria' REMOVIDA */}
                    <TableHead>Preço</TableHead>
                    {/* MUDANÇA: Coluna 'Duração' REMOVIDA */}
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
                            {/* MUDANÇA: usa 'name' e 'description' */}
                            <div>{servico.name}</div>
                            {servico.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {servico.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      {/* MUDANÇA: Coluna 'Categoria' REMOVIDA */}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {/* MUDANÇA: usa 'price' */}
                          {formatCurrency(servico.price)}
                        </div>
                      </TableCell>
                      {/* MUDANÇA: Coluna 'Duração' REMOVIDA */}
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
                                  {/* MUDANÇA: usa 'name' */}
                                  Tem certeza que deseja excluir o serviço "{servico.name}"? 
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
      
      {/* MUDANÇA: Card "Resumo por Categoria" REMOVIDO */}
    </div>
  )
}