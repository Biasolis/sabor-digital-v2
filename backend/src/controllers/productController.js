import db from '../database/db.js';
import { uploadFile } from '../lib/s3.js';

// MODIFICADO: Criar um novo produto com controle de estoque opcional
export const createProduct = async (req, res) => {
  const { 
    name, description, price, category_id, barcode,
    control_stock, quantity_on_hand, unit_of_measure 
  } = req.body;
  const tenantId = req.user.tenant_id;

  if (!name || !price || !category_id) {
    return res.status(400).json({ message: 'Nome, preço e categoria são obrigatórios.' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Cria o produto na tabela de produtos
    const productQuery = `
      INSERT INTO products (tenant_id, category_id, name, description, price, barcode)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const productResult = await client.query(productQuery, [tenantId, category_id, name, description, price, barcode]);
    const newProduct = productResult.rows[0];

    // 2. Se o controle de estoque estiver ativado, cria o item e a "receita"
    if (control_stock) {
      if (!unit_of_measure) {
        throw new Error("Unidade de medida é obrigatória para controlar o estoque.");
      }
      // 2a. Cria o item correspondente no estoque
      const inventoryQuery = `
        INSERT INTO inventory_items (tenant_id, name, quantity_on_hand, unit_of_measure)
        VALUES ($1, $2, $3, $4)
        RETURNING id;
      `;
      const inventoryResult = await client.query(inventoryQuery, [tenantId, name, quantity_on_hand || 0, unit_of_measure]);
      const newInventoryItemId = inventoryResult.rows[0].id;

      // 2b. Vincula o produto ao item de estoque (receita de um item só)
      const recipeQuery = `
        INSERT INTO product_inventory_usage (product_id, inventory_item_id, quantity_consumed)
        VALUES ($1, $2, 1);
      `;
      await client.query(recipeQuery, [newProduct.id, newInventoryItemId]);
    }

    await client.query('COMMIT');
    res.status(201).json(newProduct);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar produto:', error);
    // Trata erro de item de estoque com nome duplicado
    if (error.code === '23505' && error.table === 'inventory_items') {
      return res.status(409).json({ message: 'Já existe um item de estoque com este nome. Escolha outro nome para o produto.' });
    }
    res.status(500).json({ message: error.message || 'Erro interno do servidor.' });
  } finally {
    client.release();
  }
};


// Listar produtos
export const listProducts = async (req, res) => {
  const tenantId = req.tenant.id;
  const { category_id } = req.query;

  try {
    // Adicionado p.barcode à seleção
    let queryText = `
      SELECT p.id, p.name, p.description, p.price, p.is_available, p.image_url, p.barcode, c.name as category_name, c.id as category_id
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
    // Adicionado 'barcode'
    const { name, description, price, category_id, is_available, barcode } = req.body;

    if (!name || !price || !category_id) {
        return res.status(400).json({ message: 'Nome, preço e categoria são obrigatórios.' });
    }

    try {
        const query = `
            UPDATE products 
            SET name = $1, description = $2, price = $3, category_id = $4, is_available = $5, barcode = $6, updated_at = CURRENT_TIMESTAMP
            WHERE id = $7 AND tenant_id = $8
            RETURNING *;
        `;
        // Adicionado 'barcode' aos parâmetros
        const result = await db.query(query, [name, description, price, category_id, is_available, barcode, id, tenantId]);

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
  const { recipeItems } = req.body; 
  const { tenant_id } = req.user;

  if (!Array.isArray(recipeItems)) {
    return res.status(400).json({ message: 'O corpo da requisição deve conter um array "recipeItems".' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      'DELETE FROM product_inventory_usage WHERE product_id = $1',
      [productId]
    );

    for (const item of recipeItems) {
      const { inventory_item_id, quantity_consumed } = item;
      if (!inventory_item_id || !quantity_consumed) {
        throw new Error('Cada item da receita deve ter "inventory_item_id" e "quantity_consumed".');
      }
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