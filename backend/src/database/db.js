import pg from 'pg';
import 'dotenv/config';

// O pg vai ler automaticamente a variável de ambiente DATABASE_URL
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // Adicione a configuração de SSL necessária para conexões com o Neon
  ssl: {
    rejectUnauthorized: false,
  },
});

// Função para testar a conexão
export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
    client.release(); // Libera o cliente de volta para o pool
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error);
    // Encerra o processo se não conseguir conectar, pois a aplicação não pode funcionar sem o DB
    process.exit(1); 
  }
}

// Exportamos uma função 'query' e o próprio 'pool' para termos mais controle
export default {
  query: (text, params) => pool.query(text, params),
  pool: pool,
};