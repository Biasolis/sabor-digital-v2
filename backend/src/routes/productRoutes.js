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

// Configuração do Multer para upload em memória
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

// Todas as rotas de produtos requerem que o usuário esteja logado em um tenant
router.use(protect, isTenantUser);

// CRUD Básico de Produtos
router.get('/', listProducts);
router.post('/', isTenantAdmin, createProduct);
router.put('/:id', isTenantAdmin, updateProduct);
router.delete('/:id', isTenantAdmin, deleteProduct);

// Upload de Imagem
router.post(
  '/:id/image', 
  isTenantAdmin, 
  upload.single('image'), 
  uploadProductImage
);

// Rotas para Gerenciamento de Receita
router.get('/:productId/recipe', isTenantAdmin, getProductRecipe);
router.post('/:productId/recipe', isTenantAdmin, defineProductRecipe);


export default router;