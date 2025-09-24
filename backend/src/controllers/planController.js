import db from '../database/db.js';

// Criar um novo plano
export const createPlan = async (req, res) => {
  const { name, price, features, is_public } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ message: 'Nome e preço são obrigatórios.' });
  }

  try {
    const query = `
      INSERT INTO plans (name, price, features, is_public)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await db.query(query, [name, price, features || {}, is_public || true]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // unique_violation
      return res.status(409).json({ message: 'Já existe um plano com este nome.' });
    }
    console.error('Erro ao criar plano:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Listar todos os planos
export const listPlans = async (req, res) => {
  try {
    const query = 'SELECT * FROM plans ORDER BY price;';
    const result = await db.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar planos:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Atualizar um plano
export const updatePlan = async (req, res) => {
  const { id } = req.params;
  const { name, price, features, is_public } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ message: 'Nome e preço são obrigatórios.' });
  }

  try {
    const query = `
      UPDATE plans 
      SET name = $1, price = $2, features = $3, is_public = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *;
    `;
    const result = await db.query(query, [name, price, features || {}, is_public, id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Plano não encontrado.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
     if (error.code === '23505') {
      return res.status(409).json({ message: 'Já existe um plano com este nome.' });
    }
    console.error('Erro ao atualizar plano:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Deletar um plano
export const deletePlan = async (req, res) => {
  const { id } = req.params;
  try {
    // IMPORTANTE: Impede a exclusão de planos que já estão em uso por tenants
    const usageCheck = await db.query('SELECT id FROM tenants WHERE plan_id = $1', [id]);
    if (usageCheck.rowCount > 0) {
      return res.status(409).json({ message: 'Não é possível excluir um plano que está em uso por um ou mais clientes.' });
    }
    
    const result = await db.query('DELETE FROM plans WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Plano não encontrado.' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar plano:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};