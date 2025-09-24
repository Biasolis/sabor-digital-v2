import db from '../database/db.js';

// Gerar Relatório de Vendas
export const getSalesReport = async (req, res) => {
  const { tenant_id } = req.user;
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'As datas de início e fim são obrigatórias.' });
  }

  try {
    const query = `
      SELECT 
        id, 
        order_id, 
        amount, 
        payment_method, 
        description,
        created_at
      FROM 
        transactions
      WHERE 
        tenant_id = $1 
        AND type = 'revenue' 
        AND created_at BETWEEN $2 AND $3
      ORDER BY 
        created_at DESC;
    `;
    
    // Adiciona a hora final do dia para incluir todas as transações do dia final.
    const adjustedEndDate = `${endDate}T23:59:59.999Z`;

    const result = await db.query(query, [tenant_id, startDate, adjustedEndDate]);
    
    // Calcula os totais para o frontend
    const totalRevenue = result.rows.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
    const totalTransactions = result.rows.length;

    res.status(200).json({
      transactions: result.rows,
      summary: {
        totalRevenue,
        totalTransactions,
      }
    });

  } catch (error) {
    console.error('Erro ao gerar relatório de vendas:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};