import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database/db.js';
import 'dotenv/config';

// Registrar um novo cliente
export const registerCustomer = async (req, res) => {
  const { first_name, phone, cpf, password } = req.body;
  
  // O subdomínio vem do middleware 'resolveTenant'
  const tenant_id = req.tenant.id;

  if (!first_name || !phone || !password || !cpf) {
    return res.status(400).json({ message: 'Nome, CPF, telefone e senha são obrigatórios.' });
  }

  try {
    // Verifica se já existe um cliente com este CPF ou telefone no tenant
    const existingCustomer = await db.query(
      'SELECT id FROM customers WHERE (cpf = $1 OR phone = $2) AND tenant_id = $3',
      [cpf, phone, tenant_id]
    );

    if (existingCustomer.rows.length > 0) {
      return res.status(409).json({ message: 'CPF ou telefone já cadastrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO customers (tenant_id, first_name, phone, cpf, password_hash)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, first_name, phone, cpf;
    `;
    const result = await db.query(query, [tenant_id, first_name, phone, cpf, password_hash]);
    
    res.status(201).json(result.rows[0]);

  } catch (error) {
     if (error.code === '23505') {
      return res.status(409).json({ message: 'CPF ou telefone já cadastrado.' });
    }
    console.error('Erro no registro do cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};


// Login do cliente
export const loginCustomer = async (req, res) => {
  const { cpf, password } = req.body;
  const tenant_id = req.tenant.id;

  if (!cpf || !password) {
    return res.status(400).json({ message: 'CPF e senha são obrigatórios.' });
  }

  try {
    const userResult = await db.query(
      'SELECT id, first_name, cpf, password_hash FROM customers WHERE cpf = $1 AND tenant_id = $2', 
      [cpf, tenant_id]
    );
    const customer = userResult.rows[0];

    if (!customer) {
      return res.status(401).json({ message: 'CPF ou senha inválidos.' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, customer.password_hash);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'CPF ou senha inválidos.' });
    }

    const token = jwt.sign(
      { 
        id: customer.id,
        cpf: customer.cpf,
        role: 'customer', // Adicionamos um 'role' para diferenciar dos funcionários
        tenant_id: tenant_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      message: 'Login bem-sucedido!',
      token,
      customer: {
        id: customer.id,
        name: customer.first_name,
        cpf: customer.cpf
      }
    });

  } catch (error) {
    console.error('Erro no login do cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};