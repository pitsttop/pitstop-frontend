import { useEffect, useState } from 'react'
import { useApi, Peca } from '../hooks/useApi'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog'
import { Plus, Edit, Trash2, Package, AlertTriangle, CheckCircle, DollarSign, Hash } from 'lucide-react'
import { toast } from 'sonner'

// MUDANÇA: Tipo de formulário para bater com a interface Peca (sem ID)
type PecaFormData = Omit<Peca, 'id'>;

export function Pecas() {
  const { getPecas, createPeca, updatePeca, deletePeca, loading } = useApi()
  const [pecas, setPecas] = useState<Peca[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPeca, setEditingPeca] = useState<Peca | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // MUDANÇA: 'formData' atualizado para bater com a interface (sem codigo, estoqueMinimo, fornecedor)
  const [formData, setFormData] = useState<PecaFormData>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
  })

  useEffect(() => {
    loadPecas()
  }, [])

  const loadPecas = async () => {
    try {
      const data = await getPecas()
      setPecas(data)
    } catch (error) {
      console.error('Erro ao carregar peças:', error)
      toast.error('Erro ao carregar peças')
    }
  }

  // MUDANÇA: 'resetForm' atualizado
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      stock: 0,
    })
    setEditingPeca(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prepara dados para enviar (convertendo campos vazios para null)
    const dataToSubmit: PecaFormData = {
      ...formData,
      description: formData.description || null,
    };
    
    try {
      if (editingPeca) {
        await updatePeca(editingPeca.id!, dataToSubmit)
        toast.success('Peça atualizada com sucesso!')
      } else {
        await createPeca(dataToSubmit)
        toast.success('Peça criada com sucesso!')
      }
      
      setDialogOpen(false)
      resetForm()
      loadPecas()
    } catch (error) {
      console.error('Erro ao salvar peça:', error)
      toast.error('Erro ao salvar peça')
    }
  }

  // MUDANÇA: 'handleEdit' atualizado
  const handleEdit = (peca: Peca) => {
    setEditingPeca(peca)
    setFormData({
      name: peca.name,
      description: peca.description || '', // Protege contra null
      price: peca.price,
      stock: peca.stock,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deletePeca(id)
      toast.success('Peça excluída com sucesso!')
      loadPecas()
    } catch (error) {
      console.error('Erro ao excluir peça:', error)
      toast.error('Erro ao excluir peça')
    }
  }

  // MUDANÇA: 'filteredPecas' atualizado (sem codigo, fornecedor)
  const filteredPecas = pecas.filter(peca =>
    peca.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (peca.description || '').toLowerCase().includes(searchTerm.toLowerCase()) // Protege contra null
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // MUDANÇA: 'getEstoqueStatus' simplificado (sem estoqueMinimo)
  const getEstoqueStatus = (peca: Peca) => {
    if (peca.stock === 0) {
      return { label: 'Sem Estoque', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle }
    } else {
      return { label: 'Em Estoque', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle }
    }
  }
  
  // MUDANÇA: Lógica de 'estoqueBaixo' removida
  const pecasSemEstoque = pecas.filter(peca => peca.stock === 0).length

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1>Gestão de Peças</h1>
          <p className="text-gray-600">Controle o estoque de peças da oficina</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Peça
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPeca ? 'Editar Peça' : 'Nova Peça'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* MUDANÇA: usa 'name' */}
              <div>
                <Label htmlFor="name">Nome da Peça</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Nome da peça"
                />
              </div>
              
              {/* MUDANÇA: Campo 'codigo' REMOVIDO */}
              
              {/* MUDANÇA: usa 'description' */}
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição detalhada da peça"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
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
                
                {/* MUDANÇA: Campo 'fornecedor' REMOVIDO */}
                
                {/* MUDANÇA: usa 'stock' */}
                <div>
                  <Label htmlFor="stock">Estoque Atual</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    required
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>
              
              {/* MUDANÇA: Campo 'estoqueMinimo' REMOVIDO */}
              
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Salvando...' : (editingPeca ? 'Atualizar' : 'Criar')}
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

      {/* MUDANÇA: Alerta de 'estoque baixo' REMOVIDO */}
      {pecasSemEstoque > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-red-800">
                    <strong>{pecasSemEstoque}</strong> peça(s) sem estoque
                  </p>
                  <p className="text-sm text-red-600">Necessário reposição urgente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              {/* MUDANÇA: Placeholder atualizado */}
              <Input
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Peças */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Estoque de Peças ({filteredPecas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPecas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Nenhuma peça encontrada com os termos de busca.' : 'Nenhuma peça cadastrada ainda.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Peça</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Status</TableHead>
                    {/* MUDANÇA: Coluna 'Fornecedor' REMOVIDA */}
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPecas.map((peca) => {
                    const status = getEstoqueStatus(peca)
                    const StatusIcon = status.icon
                    
                    return (
                      <TableRow key={peca.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Package className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              {/* MUDANÇA: usa 'name', 'description' */}
                              <div>{peca.name}</div>
                              {/* MUDANÇA: Coluna 'codigo' REMOVIDA */}
                              {peca.description && (
                                <div className="text-xs text-gray-400 truncate max-w-xs">
                                  {peca.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {/* MUDANÇA: usa 'price' */}
                            {formatCurrency(peca.price)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {/* MUDANÇA: usa 'stock', remove 'estoqueMinimo' */}
                          <div>Atual: <strong>{peca.stock}</strong></div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${status.color} flex items-center gap-1 w-fit`}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        {/* MUDANÇA: Coluna 'fornecedor' REMOVIDA */}
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(peca)}
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
                                    Tem certeza que deseja excluir a peça "{peca.name}"? 
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(peca.id!)}
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
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}