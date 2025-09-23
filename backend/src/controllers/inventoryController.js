import db from '../database/db.js';

// Criar um novo item de estoque
export const createInventoryItem = async (req, res) => {
  const { name, quantity_on_hand, unit_of_measure } = req.body;
  const tenantId = req.user.tenant_id;

  if (!name || !unit_of_measure) {
    return res.status(400).json({ message: 'Nome e unidade de medida são obrigatórios.' });
  }

  try {
    const query = `
      INSERT INTO inventory_items (tenant_id, name, quantity_on_hand, unit_of_measure)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await db.query(query, [tenantId, name, quantity_on_hand || 0, unit_of_measure]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Este item de estoque já existe.' });
    }
    console.error('Erro ao criar item de estoque:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Listar todos os itens de estoque
export const listInventoryItems = async (req, res) => {
  const tenantId = req.user.tenant_id;
  try {
    const query = `SELECT * FROM inventory_items WHERE tenant_id = $1 ORDER BY name;`;
    const result = await db.query(query, [tenantId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar itens de estoque:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Atualizar um item de estoque (ex: adicionar mais quantidade)
export const updateInventoryItem = async (req, res) => {
  const { id } = req.params;
  const { name, quantity_on_hand, unit_of_measure } = req.body;
  const tenantId = req.user.tenant_id;

  if (!name || !unit_of_measure || quantity_on_hand === undefined) {
    return res.status(400).json({ message: 'Nome, quantidade e unidade de medida são obrigatórios.' });
  }

  try {
    const query = `
      UPDATE inventory_items 
      SET name = $1, quantity_on_hand = $2, unit_of_measure = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND tenant_id = $5
      RETURNING *;
    `;
    const result = await db.query(query, [name, quantity_on_hand, unit_of_measure, id, tenantId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Item não encontrado.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar item de estoque:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// NOVA FUNÇÃO: Deletar um item de estoque
export const deleteInventoryItem = async (req, res) => {
  const { id } = req.params;
  const { tenant_id } = req.user;

  try {
    // Atenção: No futuro, adicionar verificação para impedir a exclusão de itens
    // que estão sendo usados em receitas de produtos.
    const query = 'DELETE FROM inventory_items WHERE id = $1 AND tenant_id = $2;';
    const result = await db.query(query, [id, tenant_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Item de estoque não encontrado.' });
    }

    res.status(204).send(); // Resposta de sucesso sem conteúdo
  } catch (error) {
    console.error('Erro ao deletar item de estoque:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};