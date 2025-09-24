import db from '../database/db.js';

// Função para buscar as estatísticas globais do sistema
export const getSystemStats = async (req, res) => {
  try {
    // 1. Contar todos os tenants
    const tenantsResult = await db.query('SELECT COUNT(id) as total_tenants FROM tenants;');
    const totalTenants = parseInt(tenantsResult.rows[0].total_tenants, 10) || 0;

    // 2. Contar tenants ativos
    const activeTenantsResult = await db.query("SELECT COUNT(id) as active_tenants FROM tenants WHERE status = 'active';");
    const activeTenants = parseInt(activeTenantsResult.rows[0].active_tenants, 10) || 0;

    // 3. Contar todos os planos
    const plansResult = await db.query('SELECT COUNT(id) as total_plans FROM plans;');
    const totalPlans = parseInt(plansResult.rows[0].total_plans, 10) || 0;
    
    // Futuramente, poderíamos adicionar mais estatísticas aqui, como total de usuários, total de vendas, etc.

    res.status(200).json({
      totalTenants,
      activeTenants,
      totalPlans,
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas do sistema:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};