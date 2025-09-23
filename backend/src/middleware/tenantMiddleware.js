import db from '../database/db.js';

// Middleware para identificar o tenant baseado em um header de subdomínio
export const resolveTenant = async (req, res, next) => {
  // Para rotas já protegidas, o tenant_id virá do token JWT.
  // O middleware `protect` anexa as informações do usuário, incluindo o tenant_id.
  if (req.user && req.user.tenant_id) {
    req.tenant = { id: req.user.tenant_id };
    return next();
  }

  // Para rotas públicas, esperamos um header customizado com o subdomínio
  const subdomain = req.headers['x-tenant-subdomain'];

  if (!subdomain) {
    // Se nem o token nem o header estiverem presentes, não podemos identificar o tenant.
    return res.status(400).json({ message: 'Não foi possível identificar a loja. Subdomínio não especificado.' });
  }

  try {
    const tenantResult = await db.query(
      "SELECT id, name FROM tenants WHERE subdomain = $1 AND status = 'active'",
      [subdomain]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ message: 'Loja não encontrada ou inativa.' });
    }

    // Anexa a informação do tenant na requisição para ser usada pelo controller
    req.tenant = tenantResult.rows[0]; 
    next();
  } catch (error) {
    console.error('Erro ao resolver tenant:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};