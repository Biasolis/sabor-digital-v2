import db from '../database/db.js';

// Criar uma nova categoria
export const createCategory = async (req, res) => {
  const { name } = req.body;
  const tenantId = req.user.tenant_id;

  if (!name) {
    return res.status(400).json({ message: 'O nome da categoria é obrigatório.' });
  }

  try {
    const query = `
      INSERT INTO categories (tenant_id, name) 
      VALUES ($1, $2) 
      RETURNING id, name;
    `;
    const result = await db.query(query, [tenantId, name]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    // Código de erro '23505' é para violação de unique constraint no Postgres
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Essa categoria já existe.' });
    }
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Listar todas as categorias do tenant
export const listCategories = async (req, res) => {
  const tenantId = req.tenant.id; // MODIFICADO: Vem do middleware resolveTenant

  try {
    const query = `
      SELECT id, name FROM categories WHERE tenant_id = $1 ORDER BY "order", name;
    `;
    const result = await db.query(query, [tenantId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Atualizar uma categoria
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const tenantId = req.user.tenant_id;

  if (!name) {
    return res.status(400).json({ message: 'O nome da categoria é obrigatório.' });
  }

  try {
    const query = `
      UPDATE categories SET name = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND tenant_id = $3
      RETURNING id, name;
    `;
    const result = await db.query(query, [name, id, tenantId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Categoria não encontrada ou não pertence à sua loja.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Esse nome de categoria já está em uso.' });
    }
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Deletar uma categoria
export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const tenantId = req.user.tenant_id;

  try {
    // No futuro, podemos adicionar uma verificação para não deletar categorias com produtos
    const query = `
      DELETE FROM categories WHERE id = $1 AND tenant_id = $2;
    `;
    const result = await db.query(query, [id, tenantId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Categoria não encontrada ou não pertence à sua loja.' });
    }

    res.status(204).send(); // 204 No Content para sucesso na deleção
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};