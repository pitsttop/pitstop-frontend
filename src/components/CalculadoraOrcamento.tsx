import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { Calculator, Plus, Trash2, DollarSign, Wrench, Package, AlertCircle, Download, Share } from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface OrcamentoItem {
  id: string
  tipo: 'servico' | 'peca'
  nome: string
  categoria: string
  preco: number
  quantidade: number
  total: number
}

export function CalculadoraOrcamento() {
  const [itens, setItens] = useState<OrcamentoItem[]>([])
  const [novoItem, setNovoItem] = useState({
    tipo: 'servico' as 'servico' | 'peca',
    nome: '',
    categoria: '',
    preco: '',
    quantidade: '1'
  })

  const servicosDisponiveis = [
    { nome: 'Troca de óleo', categoria: 'Manutenção', preco: 80 },
    { nome: 'Alinhamento', categoria: 'Pneus', preco: 60 },
    { nome: 'Balanceamento', categoria: 'Pneus', preco: 40 },
    { nome: 'Troca pastilhas freio', categoria: 'Freios', preco: 150 },
    { nome: 'Troca disco freio', categoria: 'Freios', preco: 300 },
    { nome: 'Revisão geral', categoria: 'Manutenção', preco: 200 },
    { nome: 'Troca correia dentada', categoria: 'Motor', preco: 400 },
    { nome: 'Troca velas', categoria: 'Motor', preco: 120 },
    { nome: 'Limpeza bicos injetores', categoria: 'Motor', preco: 180 },
    { nome: 'Recarga ar condicionado', categoria: 'Climatização', preco: 100 }
  ]

  const pecasDisponiveis = [
    { nome: 'Óleo motor 5W30', categoria: 'Lubrificantes', preco: 45 },
    { nome: 'Filtro de óleo', categoria: 'Filtros', preco: 25 },
    { nome: 'Filtro de ar', categoria: 'Filtros', preco: 35 },
    { nome: 'Pastilha freio dianteira', categoria: 'Freios', preco: 80 },
    { nome: 'Disco freio dianteiro', categoria: 'Freios', preco: 150 },
    { nome: 'Correia dentada', categoria: 'Motor', preco: 120 },
    { nome: 'Vela ignição', categoria: 'Motor', preco: 25 },
    { nome: 'Bateria 60Ah', categoria: 'Elétrica', preco: 300 },
    { nome: 'Pneu 185/65 R15', categoria: 'Pneus', preco: 350 },
    { nome: 'Amortecedor dianteiro', categoria: 'Suspensão', preco: 200 }
  ]

  const adicionarItem = () => {
    if (!novoItem.nome || !novoItem.preco) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    const preco = parseFloat(novoItem.preco)
    const quantidade = parseInt(novoItem.quantidade)
    
    if (isNaN(preco) || preco <= 0) {
      toast.error('Preço deve ser um número válido')
      return
    }

    if (isNaN(quantidade) || quantidade <= 0) {
      toast.error('Quantidade deve ser um número válido')
      return
    }

    const item: OrcamentoItem = {
      id: Date.now().toString(),
      tipo: novoItem.tipo,
      nome: novoItem.nome,
      categoria: novoItem.categoria,
      preco: preco,
      quantidade: quantidade,
      total: preco * quantidade
    }

    setItens(prev => [...prev, item])
    setNovoItem({
      tipo: 'servico',
      nome: '',
      categoria: '',
      preco: '',
      quantidade: '1'
    })
    
    toast.success('Item adicionado ao orçamento')
  }

  const removerItem = (id: string) => {
    setItens(prev => prev.filter(item => item.id !== id))
    toast.success('Item removido do orçamento')
  }

  const selecionarItemPredefinido = (item: any) => {
    setNovoItem(prev => ({
      ...prev,
      nome: item.nome,
      categoria: item.categoria,
      preco: item.preco.toString()
    }))
  }

  const calcularTotal = () => {
    return itens.reduce((total, item) => total + item.total, 0)
  }

  const calcularTotalPorTipo = (tipo: 'servico' | 'peca') => {
    return itens
      .filter(item => item.tipo === tipo)
      .reduce((total, item) => total + item.total, 0)
  }

  const exportarOrcamento = () => {
    const data = {
      itens,
      totais: {
        servicos: calcularTotalPorTipo('servico'),
        pecas: calcularTotalPorTipo('peca'),
        total: calcularTotal()
      },
      data: new Date().toLocaleString('pt-BR')
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orcamento-${Date.now()}.json`
    a.click()
    
    toast.success('Orçamento exportado com sucesso')
  }

  const limparOrcamento = () => {
    setItens([])
    toast.success('Orçamento limpo')
  }

  const itensDisponiveis = novoItem.tipo === 'servico' ? servicosDisponiveis : pecasDisponiveis

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Calculadora de Orçamento</h1>
        <p className="text-gray-600">Simule o valor dos serviços e peças para seu veículo</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Item Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                Adicionar Item
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={novoItem.tipo} onValueChange={(value) => setNovoItem(prev => ({ ...prev, tipo: value as 'servico' | 'peca', nome: '', categoria: '', preco: '' }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="servico">
                      <div className="flex items-center">
                        <Wrench className="mr-2 h-4 w-4" />
                        Serviço
                      </div>
                    </SelectItem>
                    <SelectItem value="peca">
                      <div className="flex items-center">
                        <Package className="mr-2 h-4 w-4" />
                        Peça
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="nome">Nome/Descrição</Label>
                <Input
                  id="nome"
                  value={novoItem.nome}
                  onChange={(e) => setNovoItem(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Digite ou selecione abaixo"
                />
              </div>

              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Input
                  id="categoria"
                  value={novoItem.categoria}
                  onChange={(e) => setNovoItem(prev => ({ ...prev, categoria: e.target.value }))}
                  placeholder="Ex: Manutenção, Freios"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="preco">Preço (R$)</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    value={novoItem.preco}
                    onChange={(e) => setNovoItem(prev => ({ ...prev, preco: e.target.value }))}
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <Label htmlFor="quantidade">Qtd</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    min="1"
                    value={novoItem.quantidade}
                    onChange={(e) => setNovoItem(prev => ({ ...prev, quantidade: e.target.value }))}
                  />
                </div>
              </div>

              <Button onClick={adicionarItem} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </CardContent>
          </Card>

          {/* Quick Select */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">
                {novoItem.tipo === 'servico' ? 'Serviços Comuns' : 'Peças Comuns'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {itensDisponiveis.map((item, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-between text-left h-auto p-2"
                    onClick={() => selecionarItemPredefinido(item)}
                  >
                    <div>
                      <div className="font-medium text-xs">{item.nome}</div>
                      <div className="text-xs text-gray-500">{item.categoria}</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      R$ {item.preco}
                    </Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Calculator className="mr-2 h-5 w-5" />
                  Orçamento
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportarOrcamento} disabled={itens.length === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                  <Button variant="outline" size="sm" onClick={limparOrcamento} disabled={itens.length === 0}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {itens.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">Preço Unit.</TableHead>
                        <TableHead className="text-right">Qtd</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itens.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Badge variant={item.tipo === 'servico' ? 'default' : 'secondary'}>
                              {item.tipo === 'servico' ? (
                                <><Wrench className="mr-1 h-3 w-3" />Serviço</>
                              ) : (
                                <><Package className="mr-1 h-3 w-3" />Peça</>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{item.nome}</TableCell>
                          <TableCell>{item.categoria}</TableCell>
                          <TableCell className="text-right">R$ {item.preco.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{item.quantidade}</TableCell>
                          <TableCell className="text-right font-medium">R$ {item.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removerItem(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Summary */}
                  <div className="mt-6 space-y-4">
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-blue-50 border-blue-200">
                          <CardContent className="p-4 text-center">
                            <div className="text-sm text-blue-600 mb-1">Total Serviços</div>
                            <div className="text-xl font-bold text-blue-900">
                              R$ {calcularTotalPorTipo('servico').toFixed(2)}
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-green-50 border-green-200">
                          <CardContent className="p-4 text-center">
                            <div className="text-sm text-green-600 mb-1">Total Peças</div>
                            <div className="text-xl font-bold text-green-900">
                              R$ {calcularTotalPorTipo('peca').toFixed(2)}
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-purple-50 border-purple-200">
                          <CardContent className="p-4 text-center">
                            <div className="text-sm text-purple-600 mb-1">Total Geral</div>
                            <div className="text-2xl font-bold text-purple-900">
                              R$ {calcularTotal().toFixed(2)}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <Alert className="bg-yellow-50 border-yellow-200">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">
                        <strong>Importante:</strong> Este é um orçamento estimativo. Os valores finais podem variar após avaliação técnica do veículo.
                      </AlertDescription>
                    </Alert>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum item adicionado ao orçamento</p>
                  <p className="text-sm">Adicione serviços e peças para calcular o valor total</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}