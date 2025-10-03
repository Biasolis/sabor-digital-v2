import bcrypt from 'bcryptjs';
import db from '../database/db.js';
import { createCustomer, createSubscription } from '../services/mercadopagoService.js';

// Função principal para o fluxo de assinatura
export const createSubscriptionAndTenant = async (req, res) => {
  const {
    tenantName,
    subdomain,
    adminName,
    adminEmail,
    adminPassword,
    planId,
    billingCycle, // 'monthly' ou 'annually'
    cardToken,    // Token do cartão gerado pelo frontend
  } = req.body;

  if (!tenantName || !subdomain || !adminName || !adminEmail || !adminPassword || !planId || !billingCycle || !cardToken) {
    return res.status(400).json({ message: 'Todos os campos do formulário são obrigatórios.' });
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Verifica se subdomínio ou e-mail do admin já existem
    const existingTenant = await client.query('SELECT id FROM tenants WHERE subdomain = $1', [subdomain]);
    if (existingTenant.rowCount > 0) throw new Error('Este subdomínio já está em uso.');

    const existingUser = await client.query('SELECT id FROM superadmins WHERE email = $1', [adminEmail]);
    if (existingUser.rowCount > 0) throw new Error('Este e-mail já está em uso.');

    // 2. Busca os detalhes do plano selecionado no nosso banco
    const planResult = await client.query('SELECT * FROM plans WHERE id = $1', [planId]);
    if (planResult.rowCount === 0) throw new Error('Plano não encontrado.');
    const plan = planResult.rows[0];

    const gatewayPlanId = billingCycle === 'annually' ? plan.gateway_plan_id_annually : plan.gateway_plan_id_monthly;
    if (!gatewayPlanId) throw new Error('ID do plano no gateway de pagamento não configurado.');

    // 3. Cria o cliente no Mercado Pago
    const customerId = await createCustomer(adminEmail, adminName);

    // 4. Cria a assinatura no Mercado Pago
    const subscription = await createSubscription(gatewayPlanId, customerId, cardToken);
    if (subscription.status !== 'authorized') {
        throw new Error('Não foi possível autorizar a assinatura. Verifique os dados do cartão.');
    }

    // 5. Se a assinatura foi criada com sucesso, cria o tenant no nosso banco
    const nextBillingDate = new Date(subscription.next_payment_date);
    const tenantQuery = `
      INSERT INTO tenants (name, subdomain, plan_id, subscription_status, billing_cycle, next_billing_date, gateway_subscription_id)
      VALUES ($1, $2, $3, 'active', $4, $5, $6) RETURNING id;
    `;
    const tenantResult = await client.query(tenantQuery, [tenantName, subdomain, planId, billingCycle, nextBillingDate, subscription.id]);
    const newTenantId = tenantResult.rows[0].id;

    // 6. Cria o usuário administrador para o novo tenant
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(adminPassword, salt);
    const userQuery = `
      INSERT INTO users (tenant_id, name, email, password_hash, role)
      VALUES ($1, $2, $3, $4, 'admin');
    `;
    await client.query(userQuery, [newTenantId, adminName, adminEmail, password_hash]);

    // 7. Cria o usuário de sistema (Super Admin) no novo tenant
    const superAdminRes = await client.query('SELECT * FROM superadmins ORDER BY created_at ASC LIMIT 1');
    if (superAdminRes.rowCount > 0) {
        const superAdmin = superAdminRes.rows[0];
        const systemUserQuery = `
          INSERT INTO users (tenant_id, name, email, password_hash, role, is_system_user)
          VALUES ($1, $2, $3, $4, 'admin', true);
        `;
        await client.query(systemUserQuery, [newTenantId, superAdmin.name, superAdmin.email, superAdmin.password_hash]);
    }

    await client.query('COMMIT');

    // Futuramente, podemos retornar um token de login para o novo usuário
    res.status(201).json({ message: 'Assinatura e restaurante criados com sucesso!' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro no processo de assinatura:', error);
    res.status(400).json({ message: error.message || 'Não foi possível completar a assinatura.' });
  } finally {
    client.release();
  }
};