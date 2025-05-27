import { Router } from 'express';
import { handleGetAllContacts, handleGetContactById} from '../controllers/contactsController.js';

const router = Router();

router.get('/', handleGetAllContacts);
router.get('/:contactId', handleGetContactById);

export default router;