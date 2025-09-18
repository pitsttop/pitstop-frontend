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
import { toast } from 'sonner@2.0.3'

export function Pecas() {
  const { getPecas, createPeca, updatePeca, deletePeca, loading } = useApi()
  const [pecas, setPecas] = useState<Peca[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPeca, setEditingPeca] = useState<Peca | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [formData, setFormData] = useState<Omit<Peca, 'id'>>({
    nome: '',
    codigo: '',
    descricao: '',
    preco: 0,
    estoque: 0,
    estoqueMinimo: 0,
    fornecedor: ''
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

  const resetForm = () => {
    setFormData({
      nome: '',
      codigo: '',
      descricao: '',
      preco: 0,
      estoque: 0,
      estoqueMinimo: 0,
      fornecedor: ''
    })
    setEditingPeca(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingPeca) {
        await updatePeca(editingPeca.id!, formData)
        toast.success('Peça atualizada com sucesso!')
      } else {
        await createPeca(formData)
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

  const handleEdit = (peca: Peca) => {
    setEditingPeca(peca)
    setFormData({
      nome: peca.nome,
      codigo: peca.codigo,
      descricao: peca.descricao,
      preco: peca.preco,
      estoque: peca.estoque,
      estoqueMinimo: peca.estoqueMinimo,
      fornecedor: peca.fornecedor
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

  const filteredPecas = pecas.filter(peca =>
    peca.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    peca.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    peca.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    peca.fornecedor.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getEstoqueStatus = (peca: Peca) => {
    if (peca.estoque === 0) {
      return { label: 'Sem Estoque', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle }
    } else if (peca.estoque <= peca.estoqueMinimo) {
      return { label: 'Estoque Baixo', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertTriangle }
    } else {
      return { label: 'Estoque OK', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle }
    }
  }

  const pecasEstoqueBaixo = pecas.filter(peca => peca.estoque <= peca.estoqueMinimo && peca.estoque > 0).length
  const pecasSemEstoque = pecas.filter(peca => peca.estoque === 0).length

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
              <div>
                <Label htmlFor="nome">Nome da Peça</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  placeholder="Nome da peça"
                />
              </div>
              
              <div>
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  required
                  placeholder="Código da peça"
                />
              </div>
              
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição detalhada da peça"
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
                  <Label htmlFor="fornecedor">Fornecedor</Label>
                  <Input
                    id="fornecedor"
                    value={formData.fornecedor}
                    onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                    required
                    placeholder="Nome do fornecedor"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estoque">Estoque Atual</Label>
                  <Input
                    id="estoque"
                    type="number"
                    value={formData.estoque}
                    onChange={(e) => setFormData({ ...formData, estoque: parseInt(e.target.value) || 0 })}
                    required
                    min="0"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="estoqueMinimo">Estoque Mínimo</Label>
                  <Input
                    id="estoqueMinimo"
                    type="number"
                    value={formData.estoqueMinimo}
                    onChange={(e) => setFormData({ ...formData, estoqueMinimo: parseInt(e.target.value) || 0 })}
                    required
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>
              
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

      {/* Alertas de Estoque */}
      {(pecasSemEstoque > 0 || pecasEstoqueBaixo > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pecasSemEstoque > 0 && (
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
          )}
          
          {pecasEstoqueBaixo > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-yellow-800">
                      <strong>{pecasEstoqueBaixo}</strong> peça(s) com estoque baixo
                    </p>
                    <p className="text-sm text-yellow-600">Considere fazer pedido de reposição</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome, código, descrição ou fornecedor..."
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
                    <TableHead>Fornecedor</TableHead>
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
                              <div>{peca.nome}</div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Hash className="h-3 w-3" />
                                {peca.codigo}
                              </div>
                              {peca.descricao && (
                                <div className="text-xs text-gray-400 truncate max-w-xs">
                                  {peca.descricao}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(peca.preco)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div>Atual: <strong>{peca.estoque}</strong></div>
                            <div className="text-sm text-gray-500">
                              Mínimo: {peca.estoqueMinimo}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${status.color} flex items-center gap-1 w-fit`}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {peca.fornecedor}
                        </TableCell>
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
                                    Tem certeza que deseja excluir a peça "{peca.nome}"? 
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