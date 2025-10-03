import bcrypt from 'bcryptjs';
import db from '../database/db.js';

async function createSuperAdmin() {
  const email = 'superadmin@sabordigital.com';
  const name = 'Super Admin';
  const plainPassword = 'admin123'; // Use uma senha mais forte em produção

  try {
    // Verifica se o superadmin já existe
    const existingAdmin = await db.query('SELECT * FROM superadmins WHERE email = $1', [email]);

    if (existingAdmin.rows.length > 0) {
      console.log('Super Admin com este email já existe.');
      return;
    }

    // Criptografa a senha
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(plainPassword, salt);

    // Insere no banco de dados
    const queryText = `
      INSERT INTO superadmins(name, email, password_hash)
      VALUES($1, $2, $3)
      RETURNING id, email;
    `;
    const values = [name, email, password_hash];
    
    const result = await db.query(queryText, values);
    
    console.log('✅ Super Admin criado com sucesso:');
    console.log(result.rows[0]);

  } catch (error) {
    console.error('❌ Erro ao criar Super Admin:', error);
  } finally {
    // Forma correta e segura de encerrar a conexão
    await db.pool.end();
  }
}

createSuperAdmin();