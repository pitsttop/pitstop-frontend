import { useEffect, useState } from 'react'
// A interface 'Cliente' importada já é a NOVA (com name, phone, etc.)
import { useApi, Cliente } from '../hooks/useApi' 
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog'
import { Plus, Edit, Trash2, User, Mail, Phone, MapPin, CreditCard, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { isValidPhone, formatPhoneInput, getValidationErrorMessage } from '../utils/validation'

// Tipo para o formulário. Omitimos campos que não vêm do formulário.
type ClienteFormData = Omit<Cliente, 'id' | 'createdAt'>;

export function Clientes() {
  const { getClientes, createCliente, updateCliente, deleteCliente, loading } = useApi()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  
  // MUDANÇA: O estado do formulário agora usa os campos corretos (name, phone, etc.)
  // e removemos o 'cpf'
  const [formData, setFormData] = useState<ClienteFormData>({
    name: '',
    email: '', // O formulário usará string, mesmo o tipo podendo ser null
    phone: '',
    address: '', // O formulário usará string, mesmo o tipo podendo ser null
  })

  useEffect(() => {
    loadClientes()
  }, [])

  const loadClientes = async () => {
    try {
      const data = await getClientes()
      setClientes(data)
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
      toast.error('Erro ao carregar clientes')
    }
  }

  // MUDANÇA: resetForm atualizado para os campos novos
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: ''
    })
    setEditingCliente(null)
    }

    const handleDialogClose = () => {
      setDialogOpen(false)
      resetForm()
    }

    const handleOpenDialog = () => {
      setPhoneError(null)
      setEditingCliente(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: ''
      })
      setDialogOpen(true)
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
     // Valida o telefone
     if (!isValidPhone(formData.phone)) {
       setPhoneError(getValidationErrorMessage('phone', 'phone'))
       toast.error(getValidationErrorMessage('phone', 'phone'))
       return
     }
     setPhoneError(null)

    // Prepara os dados para enviar, tratando campos nulos
    const dataToSubmit: ClienteFormData = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email || null, // Envia null se o email estiver vazio
      address: formData.address || null, // Envia null se o endereço estiver vazio
    };
    
    try {
      if (editingCliente) {
        await updateCliente(editingCliente.id!, dataToSubmit) // MUDANÇA: usa dataToSubmit
        toast.success('Cliente atualizado com sucesso!')
      } else {
        await createCliente(dataToSubmit) // MUDANÇA: usa dataToSubmit
        toast.success('Cliente criado com sucesso!')
      }
      
      setDialogOpen(false)
      resetForm()
      loadClientes()
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)
      toast.error('Erro ao salvar cliente')
    }
  }

  // MUDANÇA: handleEdit atualizado para os campos novos
  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setFormData({
      name: cliente.name,
      email: cliente.email || '', // Garante que o valor no form não seja null
      phone: cliente.phone,
      address: cliente.address || '' // Garante que o valor no form não seja null
    })
     setPhoneError(null)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCliente(id)
      toast.success('Cliente excluído com sucesso!')
      loadClientes()
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
      toast.error('Erro ao excluir cliente')
    }
  }

  // MUDANÇA: filteredClientes atualizado para os campos novos (name, phone)
  // e removemos a busca por 'cpf'
  const filteredClientes = clientes.filter(cliente =>
    cliente.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cliente.email || '').toLowerCase().includes(searchTerm.toLowerCase()) || // Proteção contra null
    cliente.phone.includes(searchTerm)
  )

  // MUDANÇA: Removemos a função formatCPF que não é mais usada

  const formatPhone = (phone: string) => {
    // Adiciona uma verificação caso 'phone' seja nulo ou indefinido (embora seja string)
    if (!phone) return 'N/A';
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  return (
    <div className="p-6 space-y-6">
      {/* ... (Cabeçalho "Gestão de Clientes" e botão "Novo Cliente" não mudam) ... */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1>Gestão de Clientes</h1>
          <p className="text-gray-600">Gerencie informações dos seus clientes</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
              <Button onClick={handleOpenDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* MUDANÇA: Formulário atualizado para 'name' */}
              <div>
                <Label htmlFor="name">Nome Completo</Label> 
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Digite o nome completo"
                />
              </div>
              
              {/* MUDANÇA: value do email protegido contra null */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''} 
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              
              {/* MUDANÇA: Formulário atualizado para 'phone' */}
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                   onChange={(e) => setFormData({ ...formData, phone: formatPhoneInput(e.target.value) })}
                   onBlur={() => {
                     if (formData.phone && !isValidPhone(formData.phone)) {
                       setPhoneError(getValidationErrorMessage('phone', 'phone'))
                     } else {
                       setPhoneError(null)
                     }
                   }}
                  required
                  placeholder="(11) 99999-9999"
                   className={phoneError ? 'border-red-500' : ''}
                />
                 {phoneError && (
                   <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                     <AlertCircle className="w-4 h-4" />
                     <span>{phoneError}</span>
                   </div>
                 )}
              </div>
              
              {/* MUDANÇA: Div do CPF removida */}
              
              {/* MUDANÇA: Formulário atualizado para 'address' */}
              <div>
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Endereço completo"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Salvando...' : (editingCliente ? 'Atualizar' : 'Criar')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                   onClick={handleDialogClose}
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
              {/* MUDANÇA: Placeholder da busca atualizado (sem CPF) */}
              <Input
                placeholder="Buscar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Clientes ({filteredClientes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredClientes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Nenhum cliente encontrado com os termos de busca.' : 'Nenhum cliente cadastrado ainda.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Contato</TableHead>
                    {/* MUDANÇA: Coluna CPF removida */}
                    <TableHead>Endereço</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            {/* MUDANÇA: cliente.nome -> cliente.name */}
                            <div>{cliente.name}</div>
                            <div className="text-sm text-gray-500">
                              Cliente desde {new Date(cliente.createdAt || '').toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {/* MUDANÇA: Proteção contra email nulo */}
                            {cliente.email || 'N/A'}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {/* MUDANÇA: cliente.telefone -> cliente.phone */}
                            {formatPhone(cliente.phone)}
                          </div>
                        </div>
                      </TableCell>
                      
                      {/* MUDANÇA: Célula da tabela (TableCell) do CPF foi REMOVIDA */}
                      
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {/* MUDANÇA: cliente.endereco -> cliente.address */}
                          <span className="truncate max-w-xs" title={cliente.address || ''}>
                            {cliente.address || 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(cliente)}
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
                                  {/* MUDANÇA: cliente.nome -> cliente.name */}
                                  Tem certeza que deseja excluir o cliente "{cliente.name}"? 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(cliente.id!)}
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