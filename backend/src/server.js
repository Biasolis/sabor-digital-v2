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
import cashRegisterRoutes from './routes/cashRegisterRoutes.js';
import cashSessionRoutes from './routes/cashSessionRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import planRoutes from './routes/planRoutes.js';
import superAdminDashboardRoutes from './routes/superAdminDashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js'; // Nova importação

await testConnection();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'API do Sabor Digital V2 está operacional!',
    version: '1.0.0',
    database: 'connected'
  });
});

// Rotas da Aplicação
app.use('/api/superadmin', superadminRoutes);
app.use('/api/superadmin/dashboard', superAdminDashboardRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/cash-registers', cashRegisterRoutes);
app.use('/api/cash-sessions', cashSessionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/reports', reportRoutes); // Novo uso

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});