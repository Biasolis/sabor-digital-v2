import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database/db.js';
import 'dotenv/config';

export const login = async (req, res) => {
  const { email, password, subdomain } = req.body;

  if (!email || !password || !subdomain) {
    return res.status(400).json({ message: 'Email, senha e subdomínio são obrigatórios.' });
  }

  try {
    // 1. Encontrar o tenant pelo subdomínio
    const tenantResult = await db.query('SELECT id, name FROM tenants WHERE subdomain = $1 AND status = \'active\'', [subdomain]);
    const tenant = tenantResult.rows[0];

    if (!tenant) {
      return res.status(404).json({ message: 'Loja não encontrada ou inativa.' });
    }

    // 2. Encontrar o usuário pelo email DENTRO do tenant encontrado
    const userResult = await db.query(
      'SELECT id, name, email, role, password_hash FROM users WHERE email = $1 AND tenant_id = $2', 
      [email, tenant.id]
    );
    const user = userResult.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // 3. Comparar a senha
    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // 4. Gerar o Token JWT com informações do usuário e do tenant
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role,
        tenant_id: tenant.id // Essencial para autorização e isolamento de dados
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '8h'
      }
    );

    // 5. Enviar a resposta
    res.status(200).json({
      message: 'Login bem-sucedido!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      tenant: {
        id: tenant.id,
        name: tenant.name
      }
    });

  } catch (error) {
    console.error('Erro no login do usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};