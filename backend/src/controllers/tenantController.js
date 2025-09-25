import bcrypt from 'bcryptjs';
import db from '../database/db.js';
import { uploadFile } from '../lib/s3.js';

// Função para o Super Admin criar um novo tenant
export const createTenant = async (req, res) => {
  const { 
    name, subdomain, plan_id, admin_name, admin_email, admin_password,
    ticketz_api_url, ticketz_api_token 
  } = req.body;

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
      INSERT INTO tenants (name, subdomain, plan_id, ticketz_api_url, ticketz_api_token) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id;
    `;
    const tenantResult = await client.query(tenantQuery, [name, subdomain, plan_id, ticketz_api_url, ticketz_api_token]);
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

// Para o Super Admin listar todos os tenants
export const listTenants = async (req, res) => {
    // ALTERADO: Adicionado plan_id para exibição no frontend
    try {
        const query = 'SELECT id, name, subdomain, status, plan_id, created_at FROM tenants ORDER BY created_at DESC;';
        const result = await db.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Erro ao listar tenants:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// Para o Super Admin atualizar um tenant específico
export const updateTenant = async (req, res) => {
    const { id } = req.params;
    const { 
      name, subdomain, status, plan_id, 
      ticketz_api_url, ticketz_api_token 
    } = req.body;

    if (!name || !subdomain || !status || !plan_id) {
        return res.status(400).json({ message: 'Nome, subdomínio, plano e status são obrigatórios.' });
    }

    try {
        const query = `
            UPDATE tenants 
            SET name = $1, subdomain = $2, status = $3, plan_id = $4, 
                ticketz_api_url = $5, ticketz_api_token = $6, updated_at = CURRENT_TIMESTAMP
            WHERE id = $7
            RETURNING *;
        `;
        const result = await db.query(query, [name, subdomain, status, plan_id, ticketz_api_url, ticketz_api_token, id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Cliente (tenant) não encontrado.' });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Este subdomínio já está em uso por outro cliente.' });
        }
        console.error('Erro ao atualizar tenant:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// NOVA FUNÇÃO: Para o Super Admin deletar um tenant
export const deleteTenant = async (req, res) => {
  const { id } = req.params;
  try {
    // A opção ON DELETE CASCADE na tabela 'users' garantirá que os usuários sejam removidos junto com o tenant.
    const result = await db.query('DELETE FROM tenants WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Cliente (tenant) não encontrado.' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar tenant:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};


// Para o usuário logado (admin da loja) buscar os dados do seu próprio tenant
export const getMyTenant = async (req, res) => {
  const tenantId = req.user.tenant_id;

  try {
    const query = `
      SELECT id, name, subdomain, status, created_at, logo_url, 
             primary_color, secondary_color, is_open,
             ticketz_api_url, ticketz_api_token 
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

// Para o admin do tenant atualizar suas configurações
export const updateMyTenant = async (req, res) => {
    const tenantId = req.user.tenant_id;
    const is_open = req.body.is_open === 'true'; 
    const { name, primary_color, secondary_color, ticketz_api_url, ticketz_api_token } = req.body;
    let logo_url;

    try {
        if (req.file) {
            const { buffer, mimetype } = req.file;
            logo_url = await uploadFile(buffer, mimetype, tenantId);
        }

        const currentTenant = await db.query('SELECT logo_url FROM tenants WHERE id = $1', [tenantId]);
        
        const query = `
            UPDATE tenants SET
                name = $1,
                primary_color = $2,
                secondary_color = $3,
                logo_url = $4,
                is_open = $5,
                ticketz_api_url = $6,
                ticketz_api_token = $7,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $8
            RETURNING *;
        `;
        
        const params = [
            name,
            primary_color,
            secondary_color,
            logo_url || currentTenant.rows[0].logo_url,
            is_open,
            ticketz_api_url,
            ticketz_api_token,
            tenantId
        ];
        
        const result = await db.query(query, params);
        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Erro ao atualizar configurações do tenant:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// Retorna dados públicos de um tenant para o cardápio
export const getPublicTenantInfo = async (req, res) => {
    const { id } = req.tenant;
    try {
        const query = `
            SELECT name, logo_url, primary_color, secondary_color, is_open
            FROM tenants
            WHERE id = $1;
        `;
        const result = await db.query(query, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Informações da loja não encontradas.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar informações públicas do tenant:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};