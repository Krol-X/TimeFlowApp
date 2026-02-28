import { STORAGE_KEYS } from '@/constants/storage';
import { readStorage } from '@/utils/storage';

export const askDeleteConfirmation = (message = 'Удалить?'): boolean => {
  const confirmationEnabled = readStorage<boolean>(STORAGE_KEYS.confirmDelete, true);

  if (!confirmationEnabled || typeof window === 'undefined') {
    return true;
  }

  return window.confirm(message);
};
