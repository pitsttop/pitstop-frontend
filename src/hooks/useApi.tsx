import { useState } from 'react';
import api from '../services/api';

// --- INTERFACES CORRIGIDAS (para bater com o schema.prisma) ---

// Estes Enums vêm do seu Prisma e devem ser usados no frontend
export enum UserRole {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
}

export enum OrderStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
  CANCELED = 'CANCELED',
}

// Interfaces para as Relações (Muitos-para-Muitos)
export interface PartUsage {
  id: string
  quantity: number
  orderId: string
  partId: string
  // part?: Peca 
}

export interface ServiceUsage {
  id: string
  orderId: string
  serviceId: string
  // service?: Servico
}

// Interfaces Principais
export interface User {
  id: string
  email: string
  name: string | null
  role: UserRole
  createdAt: string 
}

export interface Cliente { // Model Client
  id: string
  name: string
  phone: string
  email: string | null 
  address: string | null 
  createdAt: string
  // vehicles?: Veiculo[]
  // orders?: OrdemServico[]
}

export interface Veiculo { // Model Vehicle
  id: string
  plate: string
  model: string
  brand: string
  year: number
  color: string | null 
  createdAt: string
  ownerId: string
  // owner?: Cliente
  // orders?: OrdemServico[]
}

export interface OrdemServico { // Model Order
  id: string
  description: string
  status: OrderStatus 
  totalValue: number | null 
  createdAt: string
  updatedAt: string
  clientId: string
  vehicleId: string
  partsUsed: PartUsage[]
  servicesPerformed: ServiceUsage[]
  number: string;             
  observations: string | null; 
  startDate: string;       
  endDate: string | null;
  
}

export interface Peca { // Model Part
  id: string
  name: string
  description: string | null 
  price: number
  stock: number
  // orders?: PartUsage[]
}

export interface Servico { // Model Service
  id: string
  name: string
  description: string | null 
  price: number
  // orders?: ServiceUsage[]
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

// --- ESSA É A PARTE QUE ESTAVA FALTANDO ---
// --- A LÓGICA DO HOOK ---

export function useApi() {
  const [loading, setLoading] = useState(false);

  // --- FUNÇÃO makeRequest USANDO AXIOS ---
  const makeRequest = async (endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any) => {
    setLoading(true);
    try {
      const response = await api.request({
        url: endpoint,
        method: method,
        data: data, 
      });

      return response.data;
    } catch (error: any) {
      console.error(`Erro na requisição ${method} ${endpoint}:`, error);
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // --- FUNÇÕES DO CRUD ---

  // Dashboard
  const getDashboardStats = async (): Promise<DashboardStats> => {
    // A API do backend retorna nomes em inglês e uma estrutura
    // diferente (ordersByStatus). Aqui fazemos o mapeamento para
    // a interface `DashboardStats` usada pelo frontend.
    const res: any = await makeRequest('/dashboard', 'GET');

    return {
      totalClientes: res.totalClients ?? 0,
      totalVeiculos: res.totalVehicles ?? 0,
      totalOrdens: res.totalOrders ?? 0,
      totalPecas: res.partsCount ?? 0,
      totalServicos: res.servicesCount ?? 0,
      ordensAbertas: res.ordersByStatus?.OPEN ?? 0,
      ordensAndamento: res.ordersByStatus?.IN_PROGRESS ?? 0,
      ordensConcluidas: res.ordersByStatus?.FINISHED ?? 0,
      receita: res.totalRevenue ?? 0,
    } as DashboardStats;
  }

  // Clientes
  const getClientes = async (): Promise<Cliente[]> => {
    return makeRequest('/clientes', 'GET');
  }

  const createCliente = async (cliente: Omit<Cliente, 'id' | 'createdAt'>): Promise<Cliente> => {
    return makeRequest('/clientes', 'POST', cliente);
  }

  const updateCliente = async (id: string, cliente: Partial<Omit<Cliente, 'id' | 'createdAt'>>): Promise<Cliente> => {
    return makeRequest(`/clientes/${id}`, 'PUT', cliente);
  }

  const deleteCliente = async (id: string): Promise<void> => {
    return makeRequest(`/clientes/${id}`, 'DELETE');
  }
  // Veículos
  const getVeiculos = async (): Promise<Veiculo[]> => {
    return makeRequest('/veiculos', 'GET');
  }

  // Agora aceitamos 'ownerId' no payload, pois o frontend seleciona o cliente
  const createVeiculo = async (veiculo: Omit<Veiculo, 'id' | 'createdAt'>): Promise<Veiculo> => {
    return makeRequest('/veiculos', 'POST', veiculo);
  }

  const updateVeiculo = async (id: string, veiculo: Partial<Omit<Veiculo, 'id' | 'createdAt'>>): Promise<Veiculo> => {
    return makeRequest(`/veiculos/${id}`, 'PUT', veiculo);
  }

  const deleteVeiculo = async (id: string): Promise<void> => {
    return makeRequest(`/veiculos/${id}`, 'DELETE');
  }

  // Ordens de Serviço
  const getOrdens = async (): Promise<OrdemServico[]> => {
    return makeRequest('/ordens', 'GET');
  }

  const createOrdem = async (ordem: Omit<OrdemServico, 'id' | 'createdAt' | 'updatedAt' | 'partsUsed' | 'servicesPerformed'>): Promise<OrdemServico> => {
    return makeRequest('/ordens', 'POST', ordem);
  }

  const updateOrdem = async (id: string, ordem: Partial<Omit<OrdemServico, 'id' | 'createdAt' | 'updatedAt' | 'partsUsed' | 'servicesPerformed'>>): Promise<OrdemServico> => {
    return makeRequest(`/ordens/${id}`, 'PUT', ordem);
  }

  const deleteOrdem = async (id: string): Promise<void> => {
    return makeRequest(`/ordens/${id}`, 'DELETE');
  }

  // Peças
  const getPecas = async (): Promise<Peca[]> => {
    return makeRequest('/pecas', 'GET');
  }

  const createPeca = async (peca: Omit<Peca, 'id'>): Promise<Peca> => {
    return makeRequest('/pecas', 'POST', peca);
  }

  const updatePeca = async (id: string, peca: Partial<Omit<Peca, 'id'>>): Promise<Peca> => {
    return makeRequest(`/pecas/${id}`, 'PUT', peca);
  }

  const deletePeca = async (id: string): Promise<void> => {
    return makeRequest(`/pecas/${id}`, 'DELETE');
  }

  // Serviços
  const getServicos = async (): Promise<Servico[]> => {
    return makeRequest('/servicos', 'GET');
  }

  const createServico = async (servico: Omit<Servico, 'id'>): Promise<Servico> => {
    return makeRequest('/servicos', 'POST', servico);
  }

  const updateServico = async (id: string, servico: Partial<Omit<Servico, 'id'>>): Promise<Servico> => {
    return makeRequest(`/servicos/${id}`, 'PUT', servico);
  }

  const deleteServico = async (id: string): Promise<void> => {
    return makeRequest(`/servicos/${id}`, 'DELETE');
  }

  return {
    loading,
    getDashboardStats,
    getClientes, createCliente, updateCliente, deleteCliente,
    getVeiculos, createVeiculo, updateVeiculo, deleteVeiculo,
    getOrdens, createOrdem, updateOrdem, deleteOrdem,
    getPecas, createPeca, updatePeca, deletePeca,
    getServicos, createServico, updateServico, deleteServico,
  }
}