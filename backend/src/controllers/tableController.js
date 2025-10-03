import db from '../database/db.js';

// Criar uma nova mesa
export const createTable = async (req, res) => {
  const { number } = req.body;
  const tenantId = req.user.tenant_id;

  if (!number || isNaN(parseInt(number, 10))) {
    return res.status(400).json({ message: 'O número da mesa é obrigatório e deve ser um número.' });
  }

  try {
    const query = `
      INSERT INTO tables (tenant_id, "number") 
      VALUES ($1, $2) 
      RETURNING id, "number", status;
    `;
    const result = await db.query(query, [tenantId, number]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: `A mesa número ${number} já existe.` });
    }
    console.error('Erro ao criar mesa:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Listar todas as mesas do tenant
export const listTables = async (req, res) => {
  const tenantId = req.user.tenant_id;

  try {
    const query = `
      SELECT id, "number", status FROM tables WHERE tenant_id = $1 ORDER BY "number";
    `;
    const result = await db.query(query, [tenantId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar mesas:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Deletar uma mesa
export const deleteTable = async (req, res) => {
  const { id } = req.params;
  const tenantId = req.user.tenant_id;

  try {
    // Adicionar verificação futura: não deletar mesas com pedidos abertos.
    const query = `
      DELETE FROM tables WHERE id = $1 AND tenant_id = $2;
    `;
    const result = await db.query(query, [id, tenantId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Mesa não encontrada ou não pertence à sua loja.' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar mesa:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};