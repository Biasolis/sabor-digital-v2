import db from '../database/db.js';

// Obter estatísticas gerais da plataforma para relatórios
export const getPlatformReports = async (req, res) => {
  try {
    // 1. Faturamento total da plataforma (soma de todas as transações de 'revenue')
    const totalRevenueResult = await db.query(
      "SELECT SUM(amount) as total_revenue FROM transactions WHERE type = 'revenue';"
    );
    const totalRevenue = parseFloat(totalRevenueResult.rows[0].total_revenue) || 0;

    // 2. Número total de pedidos na plataforma
    const totalOrdersResult = await db.query(
      "SELECT COUNT(id) as total_orders FROM orders WHERE status = 'paid';"
    );
    const totalOrders = parseInt(totalOrdersResult.rows[0].total_orders, 10) || 0;
    
    // 3. Número total de clientes (tenants) cadastrados
     const totalTenantsResult = await db.query(
      "SELECT COUNT(id) as total_tenants FROM tenants;"
    );
    const totalTenants = parseInt(totalTenantsResult.rows[0].total_tenants, 10) || 0;
    
    // 4. Novos clientes nos últimos 30 dias
    const newTenantsResult = await db.query(
        "SELECT COUNT(id) as new_tenants FROM tenants WHERE created_at >= NOW() - INTERVAL '30 days';"
    );
    const newTenantsLast30Days = parseInt(newTenantsResult.rows[0].new_tenants, 10) || 0;


    // Futuramente, podemos adicionar dados para gráficos, como faturamento por mês.

    res.status(200).json({
      summary: {
        totalRevenue,
        totalOrders,
        totalTenants,
        newTenantsLast30Days,
      }
    });

  } catch (error) {
    console.error('Erro ao gerar relatórios da plataforma:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};