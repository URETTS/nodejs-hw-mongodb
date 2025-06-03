import { Contact } from '../ models/contactModel.js';

export const getAllContacts = async (
  page = 1,
  perPage = 10,
  sortBy = 'name',
  sortOrder = 'asc',
  type,
  isFavourite
) => {
  const skip = (page - 1) * perPage;

  const sortDirection = sortOrder === 'desc' ? -1 : 1;
  const sortOptions = { [sortBy]: sortDirection };

  const filter = {};
  if (type) filter.contactType = type;
  if (typeof isFavourite !== 'undefined') filter.isFavourite = isFavourite === 'true';

  const [contacts, totalItems] = await Promise.all([
    Contact.find(filter).sort(sortOptions).skip(skip).limit(perPage),
    Contact.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalItems / perPage);

  return {
    data: contacts,
    page,
    perPage,
    totalItems,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
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