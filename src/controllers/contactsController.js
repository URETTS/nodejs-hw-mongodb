import createError from 'http-errors';
import {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  patchContact,
} from '../services/contacts.js';

export const handleGetAllContacts = async (req, res) => {
  const contacts = await getAllContacts();
  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const handleGetContactById = async (req, res) => {
  const { contactId } = req.params;
  const contact = await getContactById(contactId);

  if (!contact) {
    throw createError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const handleCreateContact = async (req, res) => {
  const { name, phoneNumber, contactType, email, isFavourite } = req.body;

  if (!name || !phoneNumber || !contactType) {
    throw createError(400, 'Missing required fields: name, phoneNumber, and contactType are required');
  }

  const newContactData = { name, phoneNumber, contactType };

  if (email) newContactData.email = email;
  if (typeof isFavourite !== 'undefined') newContactData.isFavourite = isFavourite;

  const contact = await createContact(newContactData);

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: contact,
  });
};

export const handleUpdateContact = async (req, res) => {
  const { contactId } = req.params;
  const updatedContact = await updateContact(contactId, req.body);

  if (!updatedContact) {
    throw createError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: 'Contact updated successfully!',
    data: updatedContact,
  });
};

export const handleDeleteContact = async (req, res) => {
  const { contactId } = req.params;
  const deletedContact = await deleteContact(contactId);

  if (!deletedContact) {
    throw createError(404, 'Contact not found');
  }

  res.status(204).end();
};

export const handlePatchContact = async (req, res) => {
  const { contactId } = req.params;
  const patchData = req.body;

  if (!Object.keys(patchData).length) {
    throw createError(400, 'Missing fields to update');
  }

  const updatedContact = await patchContact(contactId, patchData);

  if (!updatedContact) {
    throw createError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: updatedContact,
  });
};
