import db from '../database/db.js';
// import { createSubscriptionPlan } from '../services/mercadopagoService.js'; // Descomente quando o serviço estiver pronto

// ATENÇÃO: Por enquanto, vamos manter a chamada ao serviço comentada
// para evitar erros até que as credenciais do Mercado Pago sejam configuradas.

// Criar um novo plano
export const createPlan = async (req, res) => {
  const { name, price_monthly, price_annually, features, is_public } = req.body;

  if (!name || price_monthly === undefined || price_annually === undefined) {
    return res.status(400).json({ message: 'Nome e preços (mensal e anual) são obrigatórios.' });
  }

  try {
    // Lógica para criar os planos no Mercado Pago (será ativada no futuro)
    // const gateway_plan_id_monthly = await createSubscriptionPlan(`${name} - Mensal`, price_monthly, 'months');
    // const gateway_plan_id_annually = await createSubscriptionPlan(`${name} - Anual`, price_annually, 'years');

    const query = `
      INSERT INTO plans (name, price_monthly, price_annually, features, is_public)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const result = await db.query(query, [name, price_monthly, price_annually, features || {}, is_public || true]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Já existe um plano com este nome.' });
    }
    console.error('Erro ao criar plano:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Listar todos os planos
export const listPlans = async (req, res) => {
  try {
    const query = 'SELECT * FROM plans ORDER BY price_monthly;';
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
  const { name, price_monthly, price_annually, features, is_public } = req.body;

  if (!name || price_monthly === undefined || price_annually === undefined) {
    return res.status(400).json({ message: 'Nome e preços são obrigatórios.' });
  }

  try {
    // No futuro, aqui teríamos a lógica para ATUALIZAR os planos no Mercado Pago também.
    
    const query = `
      UPDATE plans 
      SET name = $1, price_monthly = $2, price_annually = $3, features = $4, is_public = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *;
    `;
    const result = await db.query(query, [name, price_monthly, price_annually, features || {}, is_public, id]);
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
    const usageCheck = await db.query('SELECT id FROM tenants WHERE plan_id = $1', [id]);
    if (usageCheck.rowCount > 0) {
      return res.status(409).json({ message: 'Não é possível excluir um plano que está em uso por um ou mais clientes.' });
    }
    
    // No futuro, adicionar lógica para INATIVAR o plano no Mercado Pago.

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