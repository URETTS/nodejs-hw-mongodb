import express from 'express';
import {
  handleGetAllContacts,
  handleGetContactById,
  handleCreateContact,
  handleUpdateContact,
  handleDeleteContact,
  handlePatchContact,
} from '../controllers/contactsController.js';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { isValidId } from '../middlewares/isValidId.js';
import {
  createContactSchema,
  patchContactSchema,
} from '../schemas/contactSchemas.js';

const router = express.Router();

router.get('/', ctrlWrapper(handleGetAllContacts));

router.get('/:contactId', isValidId, ctrlWrapper(handleGetContactById));

router.post(
  '/',
  validateBody(createContactSchema),
  ctrlWrapper(handleCreateContact)
);

router.put(
  '/:contactId',
  isValidId,
  validateBody(createContactSchema),
  ctrlWrapper(handleUpdateContact)
);

router.patch(
  '/:contactId',
  isValidId,
  validateBody(patchContactSchema),
  ctrlWrapper(handlePatchContact)
);

router.delete('/:contactId', isValidId, ctrlWrapper(handleDeleteContact));

export default router;
