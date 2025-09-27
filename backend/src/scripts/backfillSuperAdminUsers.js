import db from '../database/db.js';

async function backfillSuperAdminUsers() {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Pega o primeiro Super Admin
    const superAdminRes = await client.query('SELECT * FROM superadmins ORDER BY created_at ASC LIMIT 1');
    if (superAdminRes.rowCount === 0) {
      console.log('Nenhum Super Admin encontrado. Saindo.');
      return;
    }
    const superAdmin = superAdminRes.rows[0];
    console.log(`Super Admin encontrado: ${superAdmin.email}`);

    // 2. Pega todos os tenants
    const tenantsRes = await client.query('SELECT id, name FROM tenants');
    const tenants = tenantsRes.rows;
    console.log(`${tenants.length} tenant(s) encontrado(s).`);

    let createdCount = 0;
    let updatedCount = 0;

    // 3. Itera sobre cada tenant
    for (const tenant of tenants) {
      // 4. Verifica se QUALQUER usuário com o email do superadmin já existe
      const existingUserRes = await client.query(
        'SELECT id, is_system_user FROM users WHERE tenant_id = $1 AND email = $2',
        [tenant.id, superAdmin.email]
      );

      if (existingUserRes.rowCount > 0) {
        const existingUser = existingUserRes.rows[0];
        // Caso A: O usuário já é um usuário de sistema
        if (existingUser.is_system_user) {
          console.log(`- Usuário de sistema já existe e está correto para o tenant "${tenant.name}". Pulando.`);
        } else {
          // Caso B: Existe um usuário normal com o mesmo email, então o transformamos em usuário de sistema
          console.log(`* Convertendo usuário existente para usuário de sistema no tenant "${tenant.name}"...`);
          await client.query(
            'UPDATE users SET is_system_user = true, role = \'admin\' WHERE id = $1',
            [existingUser.id]
          );
          updatedCount++;
        }
      } else {
        // Caso C: Nenhum usuário existe com este email, então criamos um novo
        console.log(`+ Criando novo usuário de sistema para o tenant "${tenant.name}"...`);
        const insertQuery = `
          INSERT INTO users (tenant_id, name, email, password_hash, role, is_system_user)
          VALUES ($1, $2, $3, $4, 'admin', true);
        `;
        await client.query(insertQuery, [
          tenant.id,
          superAdmin.name,
          superAdmin.email,
          superAdmin.password_hash,
        ]);
        createdCount++;
      }
    }

    await client.query('COMMIT');
    console.log('\n✅ Processo concluído!');
    console.log(`${createdCount} novo(s) usuário(s) de sistema criados.`);
    console.log(`${updatedCount} usuário(s) existente(s) atualizados para sistema.`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro durante o processo de backfill:', error);
  } finally {
    client.release();
    await db.pool.end();
  }
}

backfillSuperAdminUsers();