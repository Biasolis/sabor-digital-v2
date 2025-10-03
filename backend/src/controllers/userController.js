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
    // MODIFICADO: Adicionado "is_system_user = false" para ocultar o superadmin
    const query = `
      SELECT id, name, email, role, created_at 
      FROM users 
      WHERE tenant_id = $1 AND is_system_user = false 
      ORDER BY name;
    `;
    const result = await db.query(query, [tenantId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// NOVA FUNÇÃO: Atualizar um usuário
export const updateUser = async (req, res) => {
    const { id: userId } = req.params;
    const { name, email, role, password } = req.body;
    const { tenant_id } = req.user;

    if (!name || !email || !role) {
        return res.status(400).json({ message: 'Nome, email e função são obrigatórios.' });
    }

    try {
        let password_hash;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            password_hash = await bcrypt.hash(password, salt);
        }

        const currentUser = await db.query('SELECT password_hash FROM users WHERE id = $1 AND tenant_id = $2', [userId, tenant_id]);
        if(currentUser.rowCount === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const query = `
            UPDATE users SET
                name = $1,
                email = $2,
                role = $3,
                password_hash = $4,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $5 AND tenant_id = $6 AND is_system_user = false
            RETURNING id, name, email, role;
        `;

        const result = await db.query(query, [name, email, role, password_hash || currentUser.rows[0].password_hash, userId, tenant_id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado ou é um usuário de sistema.' });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') { // unique_violation
            return res.status(409).json({ message: 'Este e-mail já está em uso por outro usuário.' });
        }
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};