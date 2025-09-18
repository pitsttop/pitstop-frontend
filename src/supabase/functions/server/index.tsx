import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))

app.use('*', logger(console.log))

// Initialize Supabase
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Auth middleware
async function requireAuth(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return null;
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user?.id) {
    return null;
  }
  
  return user.id;
}

// Check if there are any existing admins
async function hasExistingAdmins() {
  try {
    const admins = await kv.getByPrefix('user:admin:')
    return admins.length > 0
  } catch (error) {
    console.log('Error checking existing admins:', error)
    return false
  }
}

// Auth routes
app.post('/make-server-d3d28263/signup', async (c) => {
  try {
    const { email, password, name, userType } = await c.req.json()
    
    // Security check: Only allow admin creation if no admins exist (first user) or if request is from an existing admin
    let finalUserType = userType || 'cliente'
    
    if (finalUserType === 'admin') {
      const hasAdmins = await hasExistingAdmins()
      
      if (hasAdmins) {
        // Check if the request is from an authenticated admin
        const accessToken = c.req.header('Authorization')?.split(' ')[1]
        if (!accessToken) {
          return c.json({ error: 'Apenas administradores podem criar contas de administrador' }, 403)
        }
        
        const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
        if (authError || !user?.id) {
          return c.json({ error: 'Token de autenticação inválido' }, 403)
        }
        
        // Check if the authenticated user is an admin
        const adminUser = await kv.get(`user:admin:${user.id}`)
        if (!adminUser) {
          return c.json({ error: 'Apenas administradores podem criar contas de administrador' }, 403)
        }
      }
      // If no admins exist, allow the first admin to be created
    }
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, userType: finalUserType },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })
    
    if (error) {
      console.log('Signup error:', error)
      return c.json({ error: error.message }, 400)
    }
    
    // Store user type in KV store for quick access
    if (finalUserType === 'admin') {
      await kv.set(`user:admin:${data.user.id}`, {
        id: data.user.id,
        email: data.user.email,
        name,
        createdAt: new Date().toISOString()
      })
    }
    
    return c.json({ user: data.user })
  } catch (error) {
    console.log('Signup error:', error)
    return c.json({ error: 'Internal server error during signup' }, 500)
  }
})

// Route for checking if system has admins (used by frontend)
app.get('/make-server-d3d28263/has-admins', async (c) => {
  try {
    const hasAdmins = await hasExistingAdmins()
    return c.json({ hasAdmins })
  } catch (error) {
    console.log('Error checking admins:', error)
    return c.json({ error: 'Error checking admin status' }, 500)
  }
})

// Route for admins to create new admin users
app.post('/make-server-d3d28263/create-admin', async (c) => {
  try {
    const userId = await requireAuth(c.req.raw)
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    // Check if the authenticated user is an admin
    const adminUser = await kv.get(`user:admin:${userId}`)
    if (!adminUser) {
      return c.json({ error: 'Apenas administradores podem criar contas de administrador' }, 403)
    }
    
    const { email, password, name } = await c.req.json()
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, userType: 'admin' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })
    
    if (error) {
      console.log('Create admin error:', error)
      return c.json({ error: error.message }, 400)
    }
    
    // Store user type in KV store for quick access
    await kv.set(`user:admin:${data.user.id}`, {
      id: data.user.id,
      email: data.user.email,
      name,
      createdAt: new Date().toISOString(),
      createdBy: userId
    })
    
    return c.json({ user: data.user })
  } catch (error) {
    console.log('Create admin error:', error)
    return c.json({ error: 'Internal server error during admin creation' }, 500)
  }
})

// Cliente routes
app.get('/make-server-d3d28263/clientes', async (c) => {
  try {
    const userId = await requireAuth(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const clientes = await kv.getByPrefix(`cliente:${userId}:`);
    return c.json(clientes);
  } catch (error) {
    console.log('Error fetching clientes:', error);
    return c.json({ error: 'Error fetching clients' }, 500);
  }
});

app.post('/make-server-d3d28263/clientes', async (c) => {
  try {
    const userId = await requireAuth(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const clienteData = await c.req.json();
    const clienteId = `cliente:${userId}:${Date.now()}`;
    
    const cliente = {
      id: clienteId,
      ...clienteData,
      createdAt: new Date().toISOString(),
      userId
    };

    await kv.set(clienteId, cliente);
    return c.json(cliente);
  } catch (error) {
    console.log('Error creating cliente:', error);
    return c.json({ error: 'Error creating client' }, 500);
  }
});

app.put('/make-server-d3d28263/clientes/:id', async (c) => {
  try {
    const userId = await requireAuth(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const clienteId = c.req.param('id');
    const clienteData = await c.req.json();
    
    const existingCliente = await kv.get(clienteId);
    if (!existingCliente || existingCliente.userId !== userId) {
      return c.json({ error: 'Client not found' }, 404);
    }

    const updatedCliente = {
      ...existingCliente,
      ...clienteData,
      updatedAt: new Date().toISOString()
    };

    await kv.set(clienteId, updatedCliente);
    return c.json(updatedCliente);
  } catch (error) {
    console.log('Error updating cliente:', error);
    return c.json({ error: 'Error updating client' }, 500);
  }
});

app.delete('/make-server-d3d28263/clientes/:id', async (c) => {
  try {
    const userId = await requireAuth(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const clienteId = c.req.param('id');
    const existingCliente = await kv.get(clienteId);
    
    if (!existingCliente || existingCliente.userId !== userId) {
      return c.json({ error: 'Client not found' }, 404);
    }

    await kv.del(clienteId);
    return c.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.log('Error deleting cliente:', error);
    return c.json({ error: 'Error deleting client' }, 500);
  }
});

// Veículo routes
app.get('/make-server-d3d28263/veiculos', async (c) => {
  try {
    const userId = await requireAuth(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const veiculos = await kv.getByPrefix(`veiculo:${userId}:`);
    return c.json(veiculos);
  } catch (error) {
    console.log('Error fetching veiculos:', error);
    return c.json({ error: 'Error fetching vehicles' }, 500);
  }
});

app.post('/make-server-d3d28263/veiculos', async (c) => {
  try {
    const userId = await requireAuth(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const veiculoData = await c.req.json();
    const veiculoId = `veiculo:${userId}:${Date.now()}`;
    
    const veiculo = {
      id: veiculoId,
      ...veiculoData,
      createdAt: new Date().toISOString(),
      userId
    };

    await kv.set(veiculoId, veiculo);
    return c.json(veiculo);
  } catch (error) {
    console.log('Error creating veiculo:', error);
    return c.json({ error: 'Error creating vehicle' }, 500);
  }
});

app.put('/make-server-d3d28263/veiculos/:id', async (c) => {
  try {
    const userId = await requireAuth(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const veiculoId = c.req.param('id');
    const veiculoData = await c.req.json();
    
    const existingVeiculo = await kv.get(veiculoId);
    if (!existingVeiculo || existingVeiculo.userId !== userId) {
      return c.json({ error: 'Vehicle not found' }, 404);
    }

    const updatedVeiculo = {
      ...existingVeiculo,
      ...veiculoData,
      updatedAt: new Date().toISOString()
    };

    await kv.set(veiculoId, updatedVeiculo);
    return c.json(updatedVeiculo);
  } catch (error) {
    console.log('Error updating veiculo:', error);
    return c.json({ error: 'Error updating vehicle' }, 500);
  }
});

app.delete('/make-server-d3d28263/veiculos/:id', async (c) => {
  try {
    const userId = await requireAuth(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const veiculoId = c.req.param('id');
    const existingVeiculo = await kv.get(veiculoId);
    
    if (!existingVeiculo || existingVeiculo.userId !== userId) {
      return c.json({ error: 'Vehicle not found' }, 404);
    }

    await kv.del(veiculoId);
    return c.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.log('Error deleting veiculo:', error);
    return c.json({ error: 'Error deleting vehicle' }, 500);
  }
});

// Ordem de Serviço routes
app.get('/make-server-d3d28263/ordens', async (c) => {
  try {
    const userId = await requireAuth(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const ordens = await kv.getByPrefix(`ordem:${userId}:`);
    return c.json(ordens);
  } catch (error) {
    console.log('Error fetching ordens:', error);
    return c.json({ error: 'Error fetching service orders' }, 500);
  }
});

app.post('/make-server-d3d28263/ordens', async (c) => {
  try {
    const userId = await requireAuth(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const ordemData = await c.req.json();
    const ordemId = `ordem:${userId}:${Date.now()}`;
    
    const ordem = {
      id: ordemId,
      numero: `OS-${Date.now()}`,
      ...ordemData,
      status: ordemData.status || 'aberta',
      createdAt: new Date().toISOString(),
      userId
    };

    await kv.set(ordemId, ordem);
    return c.json(ordem);
  } catch (error) {
    console.log('Error creating ordem:', error);
    return c.json({ error: 'Error creating service order' }, 500);
  }
});

app.put('/make-server-d3d28263/ordens/:id', async (c) => {
  try {
    const userId = await requireAuth(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const ordemId = c.req.param('id');
    const ordemData = await c.req.json();
    
    const existingOrdem = await kv.get(ordemId);
    if (!existingOrdem || existingOrdem.userId !== userId) {
      return c.json({ error: 'Service order not found' }, 404);
    }

    const updatedOrdem = {
      ...existingOrdem,
      ...ordemData,
      updatedAt: new Date().toISOString()
    };

    await kv.set(ordemId, updatedOrdem);
    return c.json(updatedOrdem);
  } catch (error) {
    console.log('Error updating ordem:', error);
    return c.json({ error: 'Error updating service order' }, 500);
  }
});

app.delete('/make-server-d3d28263/ordens/:id', async (c) => {
  try {
    const userId = await requireAuth(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const ordemId = c.req.param('id');
    const existingOrdem = await kv.get(ordemId);
    
    if (!existingOrdem || existingOrdem.userId !== userId) {
      return c.json({ error: 'Service order not found' }, 404);
    }

    await kv.del(ordemId);
    return c.json({ message: 'Service order deleted successfully' });
  } catch (error) {
    console.log('Error deleting ordem:', error);
    return c.json({ error: 'Error deleting service order' }, 500);
  }
});

// Peça routes
app.get('/make-server-d3d28263/pecas', async (c) => {
  try {
    const userId = await requireAuth(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const pecas = await kv.getByPrefix(`peca:${userId}:`);
    return c.json(pecas);
  } catch (error) {
    console.log('Error fetching pecas:', error);
    return c.json({ error: 'Error fetching parts' }, 500);
  }
});

app.post('/make-server-d3d28263/pecas', async (c) => {
  try {
    const userId = await requireAuth(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const pecaData = await c.req.json();
    const pecaId = `peca:${userId}:${Date.now()}`;
    
    const peca = {
      id: pecaId,
      ...pecaData,
      createdAt: new Date().toISOString(),
      userId
    };

    await kv.set(pecaId, peca);
    return c.json(peca);
  } catch (error) {
    console.log('Error creating peca:', error);
    return c.json({ error: 'Error creating part' }, 500);
  }
});

app.put('/make-server-d3d28263/pecas/:id', async (c) => {
  try {
    const userId = await requireAuth(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const pecaId = c.req.param('id');
    const pecaData = await c.req.json();
    
    const existingPeca = await kv.get(pecaId);
    if (!existingPeca || existingPeca.userId !== userId) {
      return c.json({ error: 'Part not found' }, 404);
    }

    const updatedPeca = {
      ...existingPeca,
      ...pecaData,
      updatedAt: new Date().toISOString()
    };

    await kv.set(pecaId, updatedPeca);
    return c.json(updatedPeca);
  } catch (error) {
    console.log('Error updating peca:', error);
    return c.json({ error: 'Error updating part' }, 500);
  }
});

app.delete('/make-server-d3d28263/pecas/:id', async (c) => {
  try {
    const userId = await requireAuth(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const pecaId = c.req.param('id');
    const existingPeca = await kv.get(pecaId);
    
    if (!existingPeca || existingPeca.userId !== userId) {
      return c.json({ error: 'Part not found' }, 404);
    }

    await kv.del(pecaId);
    return c.json({ message: 'Part deleted successfully' });
  } catch (error) {
    console.log('Error deleting peca:', error);
    return c.json({ error: 'Error deleting part' }, 500);
  }
});

// Serviço routes
app.get('/make-server-d3d28263/servicos', async (c) => {
  try {
    const userId = await requireAuth(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const servicos = await kv.getByPrefix(`servico:${userId}:`);
    return c.json(servicos);
  } catch (error) {
    console.log('Error fetching servicos:', error);
    return c.json({ error: 'Error fetching services' }, 500);
  }
});

app.post('/make-server-d3d28263/servicos', async (c) => {
  try {
    const userId = await requireAuth(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const servicoData = await c.req.json();
    const servicoId = `servico:${userId}:${Date.now()}`;
    
    const servico = {
      id: servicoId,
      ...servicoData,
      createdAt: new Date().toISOString(),
      userId
    };

    await kv.set(servicoId, servico);
    return c.json(servico);
  } catch (error) {
    console.log('Error creating servico:', error);
    return c.json({ error: 'Error creating service' }, 500);
  }
});

app.put('/make-server-d3d28263/servicos/:id', async (c) => {
  try {
    const userId = await requireAuth(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const servicoId = c.req.param('id');
    const servicoData = await c.req.json();
    
    const existingServico = await kv.get(servicoId);
    if (!existingServico || existingServico.userId !== userId) {
      return c.json({ error: 'Service not found' }, 404);
    }

    const updatedServico = {
      ...existingServico,
      ...servicoData,
      updatedAt: new Date().toISOString()
    };

    await kv.set(servicoId, updatedServico);
    return c.json(updatedServico);
  } catch (error) {
    console.log('Error updating servico:', error);
    return c.json({ error: 'Error updating service' }, 500);
  }
});

app.delete('/make-server-d3d28263/servicos/:id', async (c) => {
  try {
    const userId = await requireAuth(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const servicoId = c.req.param('id');
    const existingServico = await kv.get(servicoId);
    
    if (!existingServico || existingServico.userId !== userId) {
      return c.json({ error: 'Service not found' }, 404);
    }

    await kv.del(servicoId);
    return c.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.log('Error deleting servico:', error);
    return c.json({ error: 'Error deleting service' }, 500);
  }
});

// Dashboard stats
app.get('/make-server-d3d28263/dashboard', async (c) => {
  try {
    const userId = await requireAuth(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const [clientes, veiculos, ordens, pecas, servicos] = await Promise.all([
      kv.getByPrefix(`cliente:${userId}:`),
      kv.getByPrefix(`veiculo:${userId}:`),
      kv.getByPrefix(`ordem:${userId}:`),
      kv.getByPrefix(`peca:${userId}:`),
      kv.getByPrefix(`servico:${userId}:`)
    ]);

    const ordensAbertas = ordens.filter(ordem => ordem.status === 'aberta').length;
    const ordensAndamento = ordens.filter(ordem => ordem.status === 'andamento').length;
    const ordensConcluidas = ordens.filter(ordem => ordem.status === 'concluida').length;

    const receita = ordens
      .filter(ordem => ordem.status === 'concluida')
      .reduce((total, ordem) => total + (ordem.valor || 0), 0);

    return c.json({
      totalClientes: clientes.length,
      totalVeiculos: veiculos.length,
      totalOrdens: ordens.length,
      totalPecas: pecas.length,
      totalServicos: servicos.length,
      ordensAbertas,
      ordensAndamento,
      ordensConcluidas,
      receita
    });
  } catch (error) {
    console.log('Error fetching dashboard stats:', error);
    return c.json({ error: 'Error fetching dashboard statistics' }, 500);
  }
});

Deno.serve(app.fetch)