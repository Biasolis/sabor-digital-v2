import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { testConnection } from './database/db.js';
import superadminRoutes from './routes/superadminRoutes.js';
import tenantRoutes from './routes/tenantRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import cashRegisterRoutes from './routes/cashRegisterRoutes.js'; // Nova importação
import cashSessionRoutes from './routes/cashSessionRoutes.js';   // Nova importação

// Testa a conexão com o banco de dados antes de iniciar o servidor
await testConnection();

const app = express();

// Middlewares essenciais
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'API do Sabor Digital V2 está operacional!',
    version: '1.0.0',
    database: 'connected'
  });
});

// Rotas da Aplicação
app.use('/api/superadmin', superadminRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/cash-registers', cashRegisterRoutes); // Novo uso
app.use('/api/cash-sessions', cashSessionRoutes);   // Novo uso

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});