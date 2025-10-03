import { Router } from 'express';
import multer from 'multer';
import { 
  createProduct, 
  listProducts, 
  updateProduct, 
  deleteProduct,
  uploadProductImage,
  defineProductRecipe,
  getProductRecipe
} from '../controllers/productController.js';
import { protect, isTenantUser, isTenantAdmin } from '../middleware/authMiddleware.js';
import { resolveTenant } from '../middleware/tenantMiddleware.js';

// Configuração do Multer para upload em memória
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

// Rota para listar produtos (PÚBLICA, identificada pelo header)
router.get('/', resolveTenant, listProducts);

// Todas as rotas abaixo requerem que o usuário esteja logado em um tenant
router.use(protect, isTenantUser);

// CRUD Básico de Produtos (protegido)
router.post('/', isTenantAdmin, createProduct);
router.put('/:id', isTenantAdmin, updateProduct);
router.delete('/:id', isTenantAdmin, deleteProduct);

// Upload de Imagem (protegido)
router.post(
  '/:id/image', 
  isTenantAdmin, 
  upload.single('image'), 
  uploadProductImage
);

// Rotas para Gerenciamento de Receita (protegido)
router.get('/:productId/recipe', isTenantAdmin, getProductRecipe);
router.post('/:productId/recipe', isTenantAdmin, defineProductRecipe);


export default router;