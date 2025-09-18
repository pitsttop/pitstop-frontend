import { useState } from 'react'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { isSupabaseConfigured } from '../utils/supabase/client'
import { useAuth } from './useAuth'

export interface Cliente {
  id?: string
  nome: string
  email: string
  telefone: string
  endereco: string
  cpf: string
  createdAt?: string
  updatedAt?: string
}

export interface Veiculo {
  id?: string
  clienteId: string
  marca: string
  modelo: string
  ano: number
  placa: string
  cor: string
  combustivel: string
  km: number
  createdAt?: string
  updatedAt?: string
}

export interface OrdemServico {
  id?: string
  numero?: string
  clienteId: string
  veiculoId: string
  descricao: string
  servicosIds: string[]
  pecasIds: string[]
  valor: number
  status: 'aberta' | 'andamento' | 'concluida'
  dataInicio: string
  dataFim?: string
  observacoes?: string
  createdAt?: string
  updatedAt?: string
}

export interface Peca {
  id?: string
  nome: string
  codigo: string
  descricao: string
  preco: number
  estoque: number
  estoqueMinimo: number
  fornecedor: string
  createdAt?: string
  updatedAt?: string
}

export interface Servico {
  id?: string
  nome: string
  descricao: string
  preco: number
  tempoDuracao: number // em minutos
  categoria: string
  createdAt?: string
  updatedAt?: string
}

export interface DashboardStats {
  totalClientes: number
  totalVeiculos: number
  totalOrdens: number
  totalPecas: number
  totalServicos: number
  ordensAbertas: number
  ordensAndamento: number
  ordensConcluidas: number
  receita: number
}

export function useApi() {
  const { accessToken } = useAuth()
  const [loading, setLoading] = useState(false)

  const makeRequest = async (endpoint: string, options?: RequestInit) => {
    setLoading(true)
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase não está configurado. Verifique suas credenciais.')
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d3d28263${endpoint}`,
        {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            ...options?.headers,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro na requisição')
      }

      return data
    } catch (error) {
      console.error('API Request error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Dashboard
  const getDashboardStats = async (): Promise<DashboardStats> => {
    return makeRequest('/dashboard')
  }

  // Clientes
  const getClientes = async (): Promise<Cliente[]> => {
    return makeRequest('/clientes')
  }

  const createCliente = async (cliente: Omit<Cliente, 'id'>): Promise<Cliente> => {
    return makeRequest('/clientes', {
      method: 'POST',
      body: JSON.stringify(cliente),
    })
  }

  const updateCliente = async (id: string, cliente: Partial<Cliente>): Promise<Cliente> => {
    return makeRequest(`/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cliente),
    })
  }

  const deleteCliente = async (id: string): Promise<void> => {
    return makeRequest(`/clientes/${id}`, {
      method: 'DELETE',
    })
  }

  // Veículos
  const getVeiculos = async (): Promise<Veiculo[]> => {
    return makeRequest('/veiculos')
  }

  const createVeiculo = async (veiculo: Omit<Veiculo, 'id'>): Promise<Veiculo> => {
    return makeRequest('/veiculos', {
      method: 'POST',
      body: JSON.stringify(veiculo),
    })
  }

  const updateVeiculo = async (id: string, veiculo: Partial<Veiculo>): Promise<Veiculo> => {
    return makeRequest(`/veiculos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(veiculo),
    })
  }

  const deleteVeiculo = async (id: string): Promise<void> => {
    return makeRequest(`/veiculos/${id}`, {
      method: 'DELETE',
    })
  }

  // Ordens de Serviço
  const getOrdens = async (): Promise<OrdemServico[]> => {
    return makeRequest('/ordens')
  }

  const createOrdem = async (ordem: Omit<OrdemServico, 'id' | 'numero'>): Promise<OrdemServico> => {
    return makeRequest('/ordens', {
      method: 'POST',
      body: JSON.stringify(ordem),
    })
  }

  const updateOrdem = async (id: string, ordem: Partial<OrdemServico>): Promise<OrdemServico> => {
    return makeRequest(`/ordens/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ordem),
    })
  }

  const deleteOrdem = async (id: string): Promise<void> => {
    return makeRequest(`/ordens/${id}`, {
      method: 'DELETE',
    })
  }

  // Peças
  const getPecas = async (): Promise<Peca[]> => {
    return makeRequest('/pecas')
  }

  const createPeca = async (peca: Omit<Peca, 'id'>): Promise<Peca> => {
    return makeRequest('/pecas', {
      method: 'POST',
      body: JSON.stringify(peca),
    })
  }

  const updatePeca = async (id: string, peca: Partial<Peca>): Promise<Peca> => {
    return makeRequest(`/pecas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(peca),
    })
  }

  const deletePeca = async (id: string): Promise<void> => {
    return makeRequest(`/pecas/${id}`, {
      method: 'DELETE',
    })
  }

  // Serviços
  const getServicos = async (): Promise<Servico[]> => {
    return makeRequest('/servicos')
  }

  const createServico = async (servico: Omit<Servico, 'id'>): Promise<Servico> => {
    return makeRequest('/servicos', {
      method: 'POST',
      body: JSON.stringify(servico),
    })
  }

  const updateServico = async (id: string, servico: Partial<Servico>): Promise<Servico> => {
    return makeRequest(`/servicos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(servico),
    })
  }

  const deleteServico = async (id: string): Promise<void> => {
    return makeRequest(`/servicos/${id}`, {
      method: 'DELETE',
    })
  }

  return {
    loading,
    // Dashboard
    getDashboardStats,
    // Clientes
    getClientes,
    createCliente,
    updateCliente,
    deleteCliente,
    // Veículos
    getVeiculos,
    createVeiculo,
    updateVeiculo,
    deleteVeiculo,
    // Ordens
    getOrdens,
    createOrdem,
    updateOrdem,
    deleteOrdem,
    // Peças
    getPecas,
    createPeca,
    updatePeca,
    deletePeca,
    // Serviços
    getServicos,
    createServico,
    updateServico,
    deleteServico,
  }
}