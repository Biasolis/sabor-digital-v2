import db from '../database/db.js';
import { sendMessage as sendTicketzMessage } from '../services/ticketzService.js';

// NOVA FUNÇÃO: Listar todas as comandas de um tenant
export const listOrders = async (req, res) => {
  const { tenant_id } = req.user;
  const { status } = req.query; // Filtro opcional por status

  try {
    let query = `
      SELECT o.id, o.status, o.total_amount, t.number as table_number
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      WHERE o.tenant_id = $1
    `;
    const params = [tenant_id];

    if (status) {
      query += ` AND o.status = $2`;
      params.push(status);
    }
    
    query += ` ORDER BY o.created_at ASC;`;

    const result = await db.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar comandas:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};


// Abrir uma nova comanda para uma mesa
export const createOrder = async (req, res) => {
  const { table_id, customer_id } = req.body;
  const { tenant_id, id: user_id } = req.user;

  if (!table_id) {
    return res.status(400).json({ message: 'O ID da mesa é obrigatório.' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const tableResult = await client.query(
      'SELECT status FROM tables WHERE id = $1 AND tenant_id = $2',
      [table_id, tenant_id]
    );
    if (tableResult.rows.length === 0) {
      throw new Error('Mesa não encontrada.');
    }
    if (tableResult.rows[0].status !== 'available') {
      throw new Error('A mesa não está disponível.');
    }

    const orderQuery = `
      INSERT INTO orders (tenant_id, table_id, user_id, status, customer_id)
      VALUES ($1, $2, $3, 'pending', $4)
      RETURNING *;
    `;
    const orderResult = await client.query(orderQuery, [tenant_id, table_id, user_id, customer_id]);

    await client.query(
      'UPDATE tables SET status = \'occupied\' WHERE id = $1',
      [table_id]
    );

    await client.query('COMMIT');
    res.status(201).json(orderResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar comanda:', error);
    res.status(400).json({ message: error.message || 'Não foi possível criar a comanda.' });
  } finally {
    client.release();
  }
};

// Adicionar um item a uma comanda existente
export const addOrderItem = async (req, res) => {
  const { orderId } = req.params;
  const { product_id, quantity, observation } = req.body;
  const { tenant_id } = req.user;

  if (!product_id || !quantity || quantity <= 0) {
    return res.status(400).json({ message: 'ID do produto e quantidade são obrigatórios.' });
  }
  
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    const productResult = await client.query(
        'SELECT price FROM products WHERE id = $1 AND tenant_id = $2',
        [product_id, tenant_id]
    );
    if (productResult.rows.length === 0) {
        throw new Error('Produto não encontrado ou não pertence a esta loja.');
    }
    const unit_price = productResult.rows[0].price;

    const itemQuery = `
      INSERT INTO order_items (order_id, product_id, quantity, unit_price, observation)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const itemResult = await client.query(itemQuery, [orderId, product_id, quantity, unit_price, observation]);

    const itemTotal = quantity * unit_price;
    await client.query(
      'UPDATE orders SET total_amount = total_amount + $1 WHERE id = $2',
      [itemTotal, orderId]
    );

    await client.query('COMMIT');
    res.status(201).json(itemResult.rows[0]);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao adicionar item à comanda:', error);
    res.status(400).json({ message: error.message || 'Não foi possível adicionar o item.' });
  } finally {
    client.release();
  }
};

// Obter os detalhes completos de uma comanda
export const getOrderDetails = async (req, res) => {
  const { orderId } = req.params;
  const { tenant_id } = req.user;

  try {
    const orderQuery = `
      SELECT o.id, o.status, o.total_amount, o.created_at, t.number as table_number
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      WHERE o.id = $1 AND o.tenant_id = $2;
    `;
    const orderResult = await db.query(orderQuery, [orderId, tenant_id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Comanda não encontrada.' });
    }

    const itemsQuery = `
      SELECT i.quantity, i.unit_price, i.observation, p.name as product_name
      FROM order_items i
      JOIN products p ON i.product_id = p.id
      WHERE i.order_id = $1;
    `;
    const itemsResult = await db.query(itemsQuery, [orderId]);

    const response = {
      ...orderResult.rows[0],
      items: itemsResult.rows,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Erro ao buscar detalhes da comanda:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// ATUALIZADO: Função para atualizar status e disparar notificação
export const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status, payment_method } = req.body;
  const { tenant_id } = req.user;

  const allowedStatus = ['pending', 'in_progress', 'ready', 'delivered', 'canceled', 'paid'];
  if (!status || !allowedStatus.includes(status)) {
    return res.status(400).json({ message: 'Status inválido.' });
  }
  if (status === 'paid' && !payment_method) {
    return res.status(400).json({ message: 'Método de pagamento é obrigatório para marcar como pago.'});
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const currentOrder = await client.query(
      'SELECT status, table_id, total_amount, customer_id FROM orders WHERE id = $1 AND tenant_id = $2',
      [orderId, tenant_id]
    );

    if (currentOrder.rowCount === 0) {
      throw new Error('Comanda não encontrada.');
    }

    const { status: oldStatus, table_id, total_amount, customer_id } = currentOrder.rows[0];

    if (status === 'paid' && oldStatus !== 'paid') {
      const openSession = await client.query(
        "SELECT id FROM cash_sessions WHERE tenant_id = $1 AND status = 'open'",
        [tenant_id]
      );
      if(openSession.rowCount === 0){
        throw new Error('Nenhuma sessão de caixa aberta. Não é possível registrar o pagamento.');
      }
      const cash_session_id = openSession.rows[0].id;
      
      await client.query(
        `INSERT INTO transactions (tenant_id, cash_session_id, order_id, type, amount, payment_method, description)
         VALUES ($1, $2, $3, 'revenue', $4, $5, $6)`,
        [tenant_id, cash_session_id, orderId, total_amount, payment_method, `Venda da comanda ${orderId}`]
      );
        
      const orderItems = await client.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
        [orderId]
      );

      for (const item of orderItems.rows) {
        const recipe = await client.query(
          'SELECT inventory_item_id, quantity_consumed FROM product_inventory_usage WHERE product_id = $1',
          [item.product_id]
        );
        for (const ingredient of recipe.rows) {
          const totalToDeduct = item.quantity * ingredient.quantity_consumed;
          await client.query(
            'UPDATE inventory_items SET quantity_on_hand = quantity_on_hand - $1 WHERE id = $2',
            [totalToDeduct, ingredient.inventory_item_id]
          );
        }
      }
      
      if (table_id) {
        await client.query(
          'UPDATE tables SET status = \'available\' WHERE id = $1',
          [table_id]
        );
      }
    }

    const query = `
      UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND tenant_id = $3
      RETURNING id, status;
    `;
    const result = await client.query(query, [status, orderId, tenant_id]);
    
    if (customer_id) {
        const customer = await client.query('SELECT phone, name FROM customers WHERE id = $1', [customer_id]);
        if (customer.rowCount > 0) {
            const { phone, name } = customer.rows[0];
            let messageBody = '';
            switch(status) {
                case 'in_progress':
                    messageBody = `Olá ${name}, seu pedido #${orderId.substring(0, 5)} já está sendo preparado!`;
                    break;
                case 'ready':
                    messageBody = `Boas notícias, ${name}! Seu pedido #${orderId.substring(0, 5)} está pronto para ser servido/retirado.`;
                    break;
                case 'delivered':
                    messageBody = `Seu pedido #${orderId.substring(0, 5)} foi entregue. Bom apetite!`;
                    break;
            }
            if (messageBody) {
                sendTicketzMessage(phone, messageBody);
            }
        }
    }

    await client.query('COMMIT');
    res.status(200).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar status da comanda:', error);
    res.status(500).json({ message: 'Erro interno do servidor.', details: error.message });
  } finally {
    client.release();
  }
};