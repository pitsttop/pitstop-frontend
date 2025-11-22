import { useState } from 'react';
import api from '../services/api';

// --- INTERFACES CORRIGIDAS (para bater com o schema.prisma) ---

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
  part: Peca 
}

export interface ServiceUsage {
  id: string
  orderId: string
  serviceId: string
  service: Servico
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
  userId: string; // Adicionado para a rota de cadastro funcionar
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
  ownerId: string; // É o ID do Cliente que aponta para o dono
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
}

export interface Servico { // Model Service
  id: string
  name: string
  description: string | null 
  price: number
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

// --- FUNÇÕES DO HOOK ---

export function useApi() {
  const [loading, setLoading] = useState(false);

  // --- FUNÇÃO makeRequest USANDO AXIOS ---
  const makeRequest = async (endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET', data?: any) => {
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
      // Receita Total: Lendo o valor que o Backend envia
      receita: res.totalRevenue ?? 0,
    } as DashboardStats;
  }

  // Clientes, Veículos, Peças, Serviços (mantidos iguais)
  const getClientes = async (): Promise<Cliente[]> => makeRequest('/clientes', 'GET');
  const createCliente = async (cliente: Omit<Cliente, 'id' | 'createdAt'>): Promise<Cliente> => makeRequest('/clientes', 'POST', cliente);
  const updateCliente = async (id: string, cliente: Partial<Omit<Cliente, 'id' | 'createdAt'>>): Promise<Cliente> => makeRequest(`/clientes/${id}`, 'PUT', cliente);
  const deleteCliente = async (id: string): Promise<void> => makeRequest(`/clientes/${id}`, 'DELETE');
  const getVeiculos = async (): Promise<Veiculo[]> => makeRequest('/veiculos', 'GET');
  const createVeiculo = async (veiculo: Omit<Veiculo, 'id' | 'createdAt'>): Promise<Veiculo> => makeRequest('/veiculos', 'POST', veiculo);
  const updateVeiculo = async (id: string, veiculo: Partial<Omit<Veiculo, 'id' | 'createdAt'>>): Promise<Veiculo> => makeRequest(`/veiculos/${id}`, 'PUT', veiculo);
  const deleteVeiculo = async (id: string): Promise<void> => makeRequest(`/veiculos/${id}`, 'DELETE');
  const getPecas = async (): Promise<Peca[]> => makeRequest('/pecas', 'GET');
  const createPeca = async (peca: Omit<Peca, 'id'>): Promise<Peca> => makeRequest('/pecas', 'POST', peca);
  const updatePeca = async (id: string, peca: Partial<Omit<Peca, 'id'>>): Promise<Peca> => makeRequest(`/pecas/${id}`, 'PUT', peca);
  const deletePeca = async (id: string): Promise<void> => makeRequest(`/pecas/${id}`, 'DELETE');
  const getServicos = async (): Promise<Servico[]> => makeRequest('/servicos', 'GET');
  const createServico = async (servico: Omit<Servico, 'id'>): Promise<Servico> => makeRequest('/servicos', 'POST', servico);
  const updateServico = async (id: string, servico: Partial<Omit<Servico, 'id'>>): Promise<Servico> => makeRequest(`/servicos/${id}`, 'PUT', servico);
  const deleteServico = async (id: string): Promise<void> => makeRequest(`/servicos/${id}`, 'DELETE');
  
  // --- FUNÇÕES DE ORDEM DE SERVIÇO CORRIGIDAS ---
  
  const getOrdens = async (): Promise<OrdemServico[]> => makeRequest('/ordens', 'GET');

  const createOrdem = async (ordem: Omit<OrdemServico, 'id' | 'createdAt' | 'updatedAt' | 'partsUsed' | 'servicesPerformed'>): Promise<OrdemServico> => {
    return makeRequest('/ordens', 'POST', ordem);
  }

  // MUDANÇA: Função de atualização de Status (PATCH)
  // Aceita o payload completo para o PATCH (status, totalValue, endDate)
  const updateOrdemStatus = async (
    id: string,
    payload: { status: OrderStatus | string; totalValue: number | null, endDate?: string } // Payload completo para o PATCH
  ) => {
    // A rota PATCH /ordens/:id/status precisa receber o status E o valor
    return makeRequest(`/ordens/${id}/status`, 'PATCH', payload);
  }
  
  // Função de atualização de Detalhes da Ordem (PUT)
  const updateOrdem = async (id: string, ordem: Partial<Omit<OrdemServico, 'id' | 'createdAt' | 'updatedAt' | 'partsUsed' | 'servicesPerformed'>>): Promise<OrdemServico> => {
    return makeRequest(`/ordens/${id}`, 'PUT', ordem);
  }

  const deleteOrdem = async (id: string): Promise<void> => makeRequest(`/ordens/${id}`, 'DELETE');

  // Funções de Itens
  
  const addPartToOrdem = async (orderId: string, partId: string, quantity: number) => {
    return makeRequest(`/ordens/${orderId}/pecas`, 'POST', { partId, quantity });
  }

  const addServiceToOrdem = async (orderId: string, serviceId: string) => {
    return makeRequest(`/ordens/${orderId}/servicos`, 'POST', { serviceId });
  }
  
  // --- EXPORTAÇÃO ---
  return {
    loading,
    getDashboardStats,
    getClientes, createCliente, updateCliente, deleteCliente,
    getVeiculos, createVeiculo, updateVeiculo, deleteVeiculo,
    getOrdens, createOrdem, updateOrdem, deleteOrdem, updateOrdemStatus, // Exporta a nova função
    getPecas, createPeca, updatePeca, deletePeca,
    getServicos, createServico, updateServico, deleteServico,
    addPartToOrdem, addServiceToOrdem, // Exporta as funções de adição
  }
}