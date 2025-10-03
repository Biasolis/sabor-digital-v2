import jwt from 'jsonwebtoken';
import 'dotenv/config';

// Middleware para proteger rotas de clientes
export const protectCustomer = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Verificamos se o token pertence a um cliente
      if (decoded.role !== 'customer') {
        return res.status(403).json({ message: 'Acesso negado. Rota exclusiva para clientes.' });
      }

      req.customer = decoded; // Anexamos os dados do cliente em req.customer
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Não autorizado, token inválido.' });
    }
  }
  if (!token) {
    return res.status(401).json({ message: 'Não autorizado, nenhum token fornecido.' });
  }
};