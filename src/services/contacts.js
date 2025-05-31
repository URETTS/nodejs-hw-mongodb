import { Contact } from '../ models/contactModel.js';

export const getAllContacts = async () => {
  return await Contact.find();
};

export const getContactById = async (id) => {
  return await Contact.findById(id);
};

export const createContact = async (data) => {
  return await Contact.create(data);
};

export const updateContact = async (id, data) => {
  return await Contact.findByIdAndUpdate(id, data, { new: true });
};

export const deleteContact = async (id) => {
  return await Contact.findByIdAndDelete(id);
};

export const patchContact = async (id, data) => {
  return await Contact.findByIdAndUpdate(id, data, { new: true });
};