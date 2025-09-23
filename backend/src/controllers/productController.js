import db from '../database/db.js';
import { uploadFile } from '../lib/s3.js';

// Criar um novo produto
export const createProduct = async (req, res) => {
  const { name, description, price, category_id } = req.body;
  const tenantId = req.user.tenant_id;

  if (!name || !price || !category_id) {
    return res.status(400).json({ message: 'Nome, preço e categoria são obrigatórios.' });
  }

  try {
    // Validação: Garante que a categoria pertence ao mesmo tenant
    const categoryCheck = await db.query(
      'SELECT id FROM categories WHERE id = $1 AND tenant_id = $2',
      [category_id, tenantId]
    );
    if (categoryCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Categoria inválida ou não pertence à sua loja.' });
    }

    const query = `
      INSERT INTO products (tenant_id, category_id, name, description, price)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const result = await db.query(query, [tenantId, category_id, name, description, price]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Listar produtos, com filtro opcional por categoria
export const listProducts = async (req, res) => {
  const tenantId = req.tenant.id; // MODIFICADO: Vem do middleware resolveTenant
  const { category_id } = req.query; // Pega o category_id da URL (ex: ?category_id=...)

  try {
    let queryText = `
      SELECT p.id, p.name, p.description, p.price, p.is_available, p.image_url, c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.tenant_id = $1
    `;
    const queryParams = [tenantId];

    if (category_id) {
      queryText += ' AND p.category_id = $2';
      queryParams.push(category_id);
    }
    
    queryText += ' ORDER BY c.name, p.name;';

    const result = await db.query(queryText, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Atualizar um produto
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const tenantId = req.user.tenant_id;
    const { name, description, price, category_id, is_available } = req.body;

    if (!name || !price || !category_id) {
        return res.status(400).json({ message: 'Nome, preço e categoria são obrigatórios.' });
    }

    try {
        const query = `
            UPDATE products 
            SET name = $1, description = $2, price = $3, category_id = $4, is_available = $5, updated_at = CURRENT_TIMESTAMP
            WHERE id = $6 AND tenant_id = $7
            RETURNING *;
        `;
        const result = await db.query(query, [name, description, price, category_id, is_available, id, tenantId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Produto não encontrado ou não pertence à sua loja.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};


// Deletar um produto
export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    const tenantId = req.user.tenant_id;

    try {
        const query = `DELETE FROM products WHERE id = $1 AND tenant_id = $2;`;
        const result = await db.query(query, [id, tenantId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Produto não encontrado ou não pertence à sua loja.' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// Upload de imagem para um produto
export const uploadProductImage = async (req, res) => {
  const { id: productId } = req.params;
  const tenantId = req.user.tenant_id;
  
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
  }

  try {
    const { buffer, mimetype } = req.file;
    const imageUrl = await uploadFile(buffer, mimetype, tenantId);

    const query = `
      UPDATE products SET image_url = $1
      WHERE id = $2 AND tenant_id = $3
      RETURNING id, name, image_url;
    `;
    const result = await db.query(query, [imageUrl, productId, tenantId]);

    if (result.rowCount === 0) {
      // No futuro, podemos deletar a imagem do bucket caso o produto não seja encontrado
      return res.status(404).json({ message: 'Produto não encontrado ou não pertence à sua loja.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro no upload da imagem:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao fazer upload da imagem.' });
  }
};

// Define ou atualiza a "receita" de um produto
export const defineProductRecipe = async (req, res) => {
  const { productId } = req.params;
  const { recipeItems } = req.body; // Espera um array: [{ inventory_item_id, quantity_consumed }]
  const { tenant_id } = req.user;

  if (!Array.isArray(recipeItems)) {
    return res.status(400).json({ message: 'O corpo da requisição deve conter um array "recipeItems".' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Apaga a receita antiga para substituir pela nova (abordagem mais simples)
    await client.query(
      'DELETE FROM product_inventory_usage WHERE product_id = $1',
      [productId]
    );

    // 2. Insere os novos itens da receita
    for (const item of recipeItems) {
      const { inventory_item_id, quantity_consumed } = item;
      if (!inventory_item_id || !quantity_consumed) {
        throw new Error('Cada item da receita deve ter "inventory_item_id" e "quantity_consumed".');
      }
      // Validação de segurança: Garante que o item de estoque pertence ao mesmo tenant
      const invItemCheck = await client.query(
        'SELECT id FROM inventory_items WHERE id = $1 AND tenant_id = $2',
        [inventory_item_id, tenant_id]
      );
      if (invItemCheck.rowCount === 0) {
        throw new Error(`Item de estoque com ID ${inventory_item_id} não encontrado ou não pertence à sua loja.`);
      }

      const insertQuery = `
        INSERT INTO product_inventory_usage (product_id, inventory_item_id, quantity_consumed)
        VALUES ($1, $2, $3);
      `;
      await client.query(insertQuery, [productId, inventory_item_id, quantity_consumed]);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Receita do produto definida com sucesso.' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao definir receita do produto:', error);
    res.status(400).json({ message: error.message || 'Não foi possível definir a receita.' });
  } finally {
    client.release();
  }
};

// Obtém a receita de um produto
export const getProductRecipe = async (req, res) => {
  const { productId } = req.params;
  const { tenant_id } = req.user;

  try {
    const query = `
      SELECT 
        piu.inventory_item_id,
        ii.name,
        piu.quantity_consumed,
        ii.unit_of_measure
      FROM product_inventory_usage piu
      JOIN inventory_items ii ON piu.inventory_item_id = ii.id
      WHERE piu.product_id = $1 AND ii.tenant_id = $2;
    `;
    const result = await db.query(query, [productId, tenant_id]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar receita do produto:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};