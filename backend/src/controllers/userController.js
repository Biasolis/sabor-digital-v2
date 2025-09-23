import bcrypt from 'bcryptjs';
import db from '../database/db.js';

// Controller para o admin criar um novo usuário em seu tenant
export const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const tenantId = req.user.tenant_id; // O tenant_id vem do token do admin logado

  // Validação
  const allowedRoles = ['caixa', 'cozinha', 'garcom', 'auxiliar'];
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'Função (role) inválida.' });
  }

  try {
    // Verifica se o email já está em uso neste tenant
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1 AND tenant_id = $2', 
      [email, tenantId]
    );
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'Este email já está em uso na sua loja.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO users (tenant_id, name, email, password_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, role;
    `;
    const result = await db.query(query, [tenantId, name, email, password_hash, role]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Controller para o admin listar todos os usuários de seu tenant
export const listUsers = async (req, res) => {
  const tenantId = req.user.tenant_id;

  try {
    const query = `
      SELECT id, name, email, role, created_at FROM users WHERE tenant_id = $1 ORDER BY name;
    `;
    const result = await db.query(query, [tenantId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Adicione aqui futuramente as funções de Update e Delete