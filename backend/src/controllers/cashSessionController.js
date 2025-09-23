import db from '../database/db.js';

// Abrir uma nova sessão de caixa
export const openSession = async (req, res) => {
  const { cash_register_id, opening_balance } = req.body;
  const { tenant_id, id: user_id } = req.user;

  if (!cash_register_id || opening_balance === undefined) {
    return res.status(400).json({ message: 'ID do caixa e saldo inicial são obrigatórios.' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Verifica se já existe uma sessão aberta para este caixa
    const existingSession = await client.query(
      "SELECT id FROM cash_sessions WHERE cash_register_id = $1 AND status = 'open'",
      [cash_register_id]
    );
    if (existingSession.rowCount > 0) {
      throw new Error('Este caixa já possui uma sessão aberta.');
    }

    // Cria a sessão
    const sessionQuery = `
      INSERT INTO cash_sessions (tenant_id, cash_register_id, opened_by_user_id, opening_balance)
      VALUES ($1, $2, $3, $4) RETURNING id, status, opened_at;
    `;
    const sessionResult = await client.query(sessionQuery, [tenant_id, cash_register_id, user_id, opening_balance]);
    const newSession = sessionResult.rows[0];

    // Cria a transação inicial de "suprimento" (opening_float)
    if (opening_balance > 0) {
        const transQuery = `
            INSERT INTO transactions (tenant_id, cash_session_id, type, amount, description)
            VALUES ($1, $2, 'opening_float', $3, 'Saldo de abertura do caixa');
        `;
        await client.query(transQuery, [tenant_id, newSession.id, opening_balance]);
    }

    await client.query('COMMIT');
    res.status(201).json(newSession);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao abrir sessão:', error);
    res.status(400).json({ message: error.message || 'Não foi possível abrir a sessão.' });
  } finally {
    client.release();
  }
};

// Fechar uma sessão de caixa
export const closeSession = async (req, res) => {
    const { sessionId } = req.params;
    const { closing_balance } = req.body;
    const { tenant_id, id: user_id } = req.user;

    if (closing_balance === undefined) {
        return res.status(400).json({ message: 'Saldo de fechamento é obrigatório.' });
    }
    
    try {
        const query = `
            UPDATE cash_sessions 
            SET status = 'closed', closed_by_user_id = $1, closing_balance = $2, closed_at = CURRENT_TIMESTAMP
            WHERE id = $3 AND tenant_id = $4 AND status = 'open'
            RETURNING id, status, closed_at;
        `;
        const result = await db.query(query, [user_id, closing_balance, sessionId, tenant_id]);
        
        if(result.rowCount === 0) {
            return res.status(404).json({ message: 'Sessão não encontrada ou já está fechada.' });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao fechar sessão:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};