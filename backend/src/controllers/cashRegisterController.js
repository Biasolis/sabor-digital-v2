import db from '../database/db.js';

// Criar um novo caixa
export const createCashRegister = async (req, res) => {
  const { name } = req.body;
  const { tenant_id } = req.user;

  if (!name) {
    return res.status(400).json({ message: 'O nome do caixa é obrigatório.' });
  }

  try {
    const query = 'INSERT INTO cash_registers (tenant_id, name) VALUES ($1, $2) RETURNING *;';
    const result = await db.query(query, [tenant_id, name]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Já existe um caixa com este nome.' });
    }
    console.error('Erro ao criar caixa:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// MODIFICADO: Listar caixas com o status da sessão atual
export const listCashRegisters = async (req, res) => {
  const { tenant_id } = req.user;
  try {
    const query = `
      SELECT 
        cr.id, 
        cr.name, 
        cr.is_active,
        cs.id as open_session_id,
        CASE WHEN cs.id IS NOT NULL THEN 'open' ELSE 'closed' END as session_status
      FROM 
        cash_registers cr
      LEFT JOIN 
        cash_sessions cs ON cr.id = cs.cash_register_id AND cs.status = 'open'
      WHERE 
        cr.tenant_id = $1 
      ORDER BY 
        cr.name;
    `;
    const result = await db.query(query, [tenant_id]);
    res.status(200).json(result.rows);
  } catch (error)
 {
    console.error('Erro ao listar caixas:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};