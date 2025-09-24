import { Router } from 'express';
import { 
    createCustomer, 
    listCustomers, 
    getCustomerDetails, 
    updateCustomer, 
    deleteCustomer 
} from '../controllers/customerController.js';
import { protect, isTenantAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Todas as rotas de clientes são protegidas e apenas para admins da loja
router.use(protect, isTenantAdmin);

router.get('/', listCustomers);
router.post('/', createCustomer);
router.get('/:id', getCustomerDetails);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;