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
  const {
    page = 1,
    perPage = 10,
    sortBy = 'name',
    sortOrder = 'asc',
    type,
    isFavourite,
  } = req.query;

  const parsedPage = parseInt(page, 10);
  const parsedPerPage = parseInt(perPage, 10);
  const { _id: userId } = req.user;

  const result = await getAllContacts(
    parsedPage,
    parsedPerPage,
    sortBy,
    sortOrder,
    type,
    isFavourite,
    userId
  );

  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: result,
  });
};

export const handleGetContactById = async (req, res) => {
  const { contactId } = req.params;
  const { _id: userId } = req.user;

  const contact = await getContactById(contactId, userId);

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
  const { _id: userId } = req.user;

  if (!name || !phoneNumber || !contactType) {
    throw createError(400, 'Missing required fields: name, phoneNumber, and contactType are required');
  }

  const newContactData = {
    name,
    phoneNumber,
    contactType,
    userId,
  };

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
  const { _id: userId } = req.user;

  const updatedContact = await updateContact(contactId, req.body, userId);

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
  const { _id: userId } = req.user;

  const deletedContact = await deleteContact(contactId, userId);

  if (!deletedContact) {
    throw createError(404, 'Contact not found');
  }

  res.status(204).end();
};

export const handlePatchContact = async (req, res) => {
  const { contactId } = req.params;
  const patchData = req.body;
  const { _id: userId } = req.user;

  if (!Object.keys(patchData).length) {
    throw createError(400, 'Missing fields to update');
  }

  const updatedContact = await patchContact(contactId, patchData, userId);

  if (!updatedContact) {
    throw createError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: updatedContact,
  });
};
