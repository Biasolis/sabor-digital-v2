import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database/db.js';
import 'dotenv/config';

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  try {
    const result = await db.query('SELECT * FROM superadmins WHERE email = $1', [email]);
    const superadmin = result.rows[0];

    if (!superadmin) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, superadmin.password_hash);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { 
        id: superadmin.id,
        email: superadmin.email,
        role: 'superadmin'
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '8h'
      }
    );

    res.status(200).json({
      message: 'Login bem-sucedido!',
      token: token,
      user: {
        id: superadmin.id,
        name: superadmin.name,
        email: superadmin.email
      }
    });

  } catch (error) {
    console.error('Erro no login do Super Admin:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Função para obter dados do usuário logado
export const getMe = async (req, res) => {
  // Os dados do usuário foram anexados em req.user pelo middleware 'protect'
  const { id, email, role } = req.user;
  
  // Para o Super Admin, buscamos o nome na tabela correta
  if (role === 'superadmin') {
      try {
          const result = await db.query('SELECT name FROM superadmins WHERE id = $1', [id]);
          const name = result.rows[0]?.name || 'Super Admin';
          return res.status(200).json({ id, email, role, name });
      } catch (error) {
          return res.status(500).json({ message: 'Erro ao buscar dados do Super Admin.' });
      }
  }

  res.status(200).json({
    id,
    email,
    role
  });
};

// NOVA FUNÇÃO: Atualizar o perfil do Super Admin
export const updateSuperAdminProfile = async (req, res) => {
    const { id: superAdminId, email: currentEmail } = req.user;
    const { name, email, password } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'Nome e email são obrigatórios.' });
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        let password_hash;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            password_hash = await bcrypt.hash(password, salt);

            // Atualiza a senha na tabela principal de superadmins
            await client.query('UPDATE superadmins SET password_hash = $1 WHERE id = $2', [password_hash, superAdminId]);
            
            // Replica a nova senha para todas as contas de sistema nos tenants
            await client.query(
                'UPDATE users SET password_hash = $1 WHERE email = $2 AND is_system_user = true',
                [password_hash, currentEmail]
            );
        }

        // Atualiza o nome e email na tabela principal
        const updatedSuperAdmin = await client.query(
            'UPDATE superadmins SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email',
            [name, email, superAdminId]
        );

        // Se o email mudou, replica a mudança para todas as contas de sistema
        if (currentEmail !== email) {
            await client.query(
                'UPDATE users SET email = $1 WHERE email = $2 AND is_system_user = true',
                [email, currentEmail]
            );
        }

        await client.query('COMMIT');
        res.status(200).json(updatedSuperAdmin.rows[0]);

    } catch (error) {
        await client.query('ROLLBACK');
        if (error.code === '23505') { // unique_violation
            return res.status(409).json({ message: 'Este e-mail já está em uso.' });
        }
        console.error('Erro ao atualizar perfil do Super Admin:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    } finally {
        client.release();
    }
};