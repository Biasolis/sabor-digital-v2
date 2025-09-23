import bcrypt from 'bcryptjs';
import db from '../database/db.js';

// Função para o Super Admin criar um novo tenant
export const createTenant = async (req, res) => {
  const { name, subdomain, plan_id, admin_name, admin_email, admin_password } = req.body;

  if (!name || !subdomain || !plan_id || !admin_name || !admin_email || !admin_password) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    const existingTenant = await client.query('SELECT id FROM tenants WHERE subdomain = $1', [subdomain]);
    if (existingTenant.rows.length > 0) {
      throw new Error('Este subdomínio já está em uso.');
    }

    const tenantQuery = `
      INSERT INTO tenants (name, subdomain, plan_id) 
      VALUES ($1, $2, $3) 
      RETURNING id;
    `;
    const tenantResult = await client.query(tenantQuery, [name, subdomain, plan_id]);
    const newTenantId = tenantResult.rows[0].id;

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(admin_password, salt);

    const userQuery = `
      INSERT INTO users (tenant_id, name, email, password_hash, role)
      VALUES ($1, $2, $3, $4, 'admin');
    `;
    await client.query(userQuery, [newTenantId, admin_name, admin_email, password_hash]);

    await client.query('COMMIT');

    res.status(201).json({ 
      message: 'Tenant e usuário administrador criados com sucesso!',
      tenant_id: newTenantId 
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar tenant:', error);
    if (error.message.includes('subdomínio')) {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: 'Erro interno do servidor ao criar o tenant.' });
  } finally {
    client.release();
  }
};

// NOVA FUNÇÃO: Para o usuário logado buscar os dados do seu próprio tenant
export const getMyTenant = async (req, res) => {
  // O ID do tenant vem do token, que foi decodificado pelo middleware 'protect'
  const tenantId = req.user.tenant_id;

  try {
    const query = `
      SELECT id, name, subdomain, status, created_at 
      FROM tenants 
      WHERE id = $1;
    `;
    const result = await db.query(query, [tenantId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tenant não encontrado.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar dados do tenant:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};