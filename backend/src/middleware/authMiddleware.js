import jwt from 'jsonwebtoken';
import 'dotenv/config';

export const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Erro de autenticação:', error.message);
      return res.status(401).json({ message: 'Não autorizado, token inválido.' });
    }
  }
  if (!token) {
    return res.status(401).json({ message: 'Não autorizado, nenhum token fornecido.' });
  }
};

export const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    return res.status(403).json({ message: 'Acesso negado. Rota exclusiva para Super Admins.' });
  }
};

export const isTenantUser = (req, res, next) => {
  if (req.user && req.user.tenant_id) {
    next();
  } else {
    return res.status(403).json({ message: 'Acesso negado. Rota exclusiva para usuários de tenants.' });
  }
};

export const isTenantAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Acesso negado. Rota exclusiva para administradores da loja.' });
  }
};

export const isOperationalUser = (req, res, next) => {
  const allowedRoles = ['admin', 'caixa', 'garcom'];
  if (req.user && allowedRoles.includes(req.user.role)) {
    next();
  } else {
    return res.status(403).json({ message: 'Acesso negado. Função não permitida para esta operação.' });
  }
};

export const isKitchenStaff = (req, res, next) => {
  const allowedRoles = ['admin', 'caixa', 'cozinha'];
  if (req.user && allowedRoles.includes(req.user.role)) {
    next();
  } else {
    return res.status(403).json({ message: 'Acesso negado. Apenas cozinha, caixa ou admin podem realizar esta ação.' });
  }
};