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

// Nova função para obter dados do usuário logado
export const getMe = async (req, res) => {
  // Os dados do usuário foram anexados em req.user pelo middleware 'protect'
  const { id, email, role } = req.user;
  res.status(200).json({
    id,
    email,
    role
  });
};