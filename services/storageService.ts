import { FinDocument, UserProfile } from '../types';

const KEY_DOCS = 'contador_amigo_docs';
const KEY_PROFILE = 'contador_amigo_profile';

export const saveDocument = (doc: FinDocument) => {
  const existing = getDocuments();
  const updated = [doc, ...existing];
  localStorage.setItem(KEY_DOCS, JSON.stringify(updated));
};

export const getDocuments = (): FinDocument[] => {
  const data = localStorage.getItem(KEY_DOCS);
  return data ? JSON.parse(data) : [];
};

export const saveProfile = (profile: UserProfile) => {
  localStorage.setItem(KEY_PROFILE, JSON.stringify(profile));
};

export const getProfile = (): UserProfile => {
  const data = localStorage.getItem(KEY_PROFILE);
  return data ? JSON.parse(data) : { name: 'Amigo', companyName: '', cnpj: '', regime: 'MEI' };
};

export const clearData = () => {
  localStorage.removeItem(KEY_DOCS);
  localStorage.removeItem(KEY_PROFILE);
};