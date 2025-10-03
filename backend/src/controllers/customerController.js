import db from '../database/db.js';

// Criar um novo cliente
export const createCustomer = async (req, res) => {
  const { tenant_id } = req.user;
  const {
    first_name, last_name, cpf, birth_date, email, phone,
    address_street, address_number, address_complement, address_neighborhood,
    address_city, address_state, address_zip_code,
    accepts_email_marketing, accepts_whatsapp_marketing
  } = req.body;

  if (!first_name || !phone) {
    return res.status(400).json({ message: 'Nome e telefone são obrigatórios.' });
  }

  try {
    const query = `
      INSERT INTO customers (
        tenant_id, first_name, last_name, cpf, birth_date, email, phone,
        address_street, address_number, address_complement, address_neighborhood,
        address_city, address_state, address_zip_code,
        accepts_email_marketing, accepts_whatsapp_marketing
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
      ) RETURNING *;
    `;
    const params = [
      tenant_id, first_name, last_name, cpf, birth_date || null, email, phone,
      address_street, address_number, address_complement, address_neighborhood,
      address_city, address_state, address_zip_code,
      accepts_email_marketing || false, accepts_whatsapp_marketing || false
    ];
    const result = await db.query(query, params);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // unique_violation
      return res.status(409).json({ message: 'Já existe um cliente com este CPF ou telefone.' });
    }
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Listar todos os clientes do tenant
export const listCustomers = async (req, res) => {
  const { tenant_id } = req.user;
  try {
    const query = `
      SELECT id, first_name, last_name, phone, email 
      FROM customers 
      WHERE tenant_id = $1 
      ORDER BY first_name, last_name;
    `;
    const result = await db.query(query, [tenant_id]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Obter detalhes de um cliente específico
export const getCustomerDetails = async (req, res) => {
    const { id } = req.params;
    const { tenant_id } = req.user;
    try {
        const query = 'SELECT * FROM customers WHERE id = $1 AND tenant_id = $2;';
        const result = await db.query(query, [id, tenant_id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Cliente não encontrado.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar detalhes do cliente:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// Atualizar um cliente
export const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { tenant_id } = req.user;
  const {
    first_name, last_name, cpf, birth_date, email, phone,
    address_street, address_number, address_complement, address_neighborhood,
    address_city, address_state, address_zip_code,
    accepts_email_marketing, accepts_whatsapp_marketing
  } = req.body;

   if (!first_name || !phone) {
    return res.status(400).json({ message: 'Nome e telefone são obrigatórios.' });
  }

  try {
    const query = `
      UPDATE customers SET
        first_name = $1, last_name = $2, cpf = $3, birth_date = $4, email = $5, phone = $6,
        address_street = $7, address_number = $8, address_complement = $9, address_neighborhood = $10,
        address_city = $11, address_state = $12, address_zip_code = $13,
        accepts_email_marketing = $14, accepts_whatsapp_marketing = $15,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $16 AND tenant_id = $17
      RETURNING *;
    `;
     const params = [
      first_name, last_name, cpf, birth_date || null, email, phone,
      address_street, address_number, address_complement, address_neighborhood,
      address_city, address_state, address_zip_code,
      accepts_email_marketing, accepts_whatsapp_marketing,
      id, tenant_id
    ];
    const result = await db.query(query, params);
     if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'CPF ou telefone já em uso por outro cliente.' });
    }
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Deletar um cliente
export const deleteCustomer = async (req, res) => {
    const { id } = req.params;
    const { tenant_id } = req.user;
    try {
        // Adicionar verificação futura para não deletar clientes com pedidos associados.
        const query = 'DELETE FROM customers WHERE id = $1 AND tenant_id = $2;';
        const result = await db.query(query, [id, tenant_id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Cliente não encontrado.' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar cliente:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};