import db from '../database/db.js';

// Função para buscar as estatísticas do dia para o dashboard
export const getDashboardStats = async (req, res) => {
  const { tenant_id } = req.user;

  try {
    const today = new Date().toISOString().slice(0, 10);

    // 1. Total de Vendas do Dia
    const revenueQuery = `
      SELECT SUM(amount) as total_revenue
      FROM transactions
      WHERE tenant_id = $1 AND type = 'revenue' AND DATE(created_at) = $2;
    `;
    const revenueResult = await db.query(revenueQuery, [tenant_id, today]);
    const totalRevenue = parseFloat(revenueResult.rows[0].total_revenue) || 0;

    // 2. Número Total de Pedidos do Dia
    const ordersQuery = `
      SELECT COUNT(id) as total_orders
      FROM orders
      WHERE tenant_id = $1 AND DATE(created_at) = $2;
    `;
    const ordersResult = await db.query(ordersQuery, [tenant_id, today]);
    const totalOrders = parseInt(ordersResult.rows[0].total_orders, 10) || 0;

    // 3. Ticket Médio
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // 4. Pedidos em Aberto
    const openOrdersQuery = `
      SELECT COUNT(id) as open_orders_count
      FROM orders
      WHERE tenant_id = $1 AND status IN ('pending', 'in_progress', 'ready');
    `;
    const openOrdersResult = await db.query(openOrdersQuery, [tenant_id]);
    const openOrdersCount = parseInt(openOrdersResult.rows[0].open_orders_count, 10) || 0;

    // 5. NOVO: Dados para o Gráfico de Vendas (Últimos 7 dias)
    const salesChartQuery = `
      SELECT 
        date_series.day::date AS sale_date,
        COALESCE(SUM(transactions.amount), 0) AS total_sales
      FROM 
        (SELECT generate_series(
          CURRENT_DATE - interval '6 days', 
          CURRENT_DATE, 
          '1 day'
        ) AS day) AS date_series
      LEFT JOIN 
        transactions ON DATE(transactions.created_at) = date_series.day
        AND transactions.tenant_id = $1
        AND transactions.type = 'revenue'
      GROUP BY 
        date_series.day
      ORDER BY 
        date_series.day ASC;
    `;
    const salesChartResult = await db.query(salesChartQuery, [tenant_id]);
    const salesLast7Days = salesChartResult.rows.map(row => ({
        // Formata a data para um formato amigável (ex: 24/09)
        date: new Date(row.sale_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        total: parseFloat(row.total_sales)
    }));


    res.status(200).json({
      totalRevenue,
      totalOrders,
      averageTicket,
      openOrdersCount,
      salesLast7Days, // Adiciona os novos dados na resposta da API
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};