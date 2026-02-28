import { ref } from 'vue';
import { STORAGE_KEYS } from '@/constants/storage';
import { readStorage } from '@/utils/storage';

export const useDeleteConfirm = () => {
  const visible = ref(false);
  const message = ref('Удалить?');

  let resolver: ((value: boolean) => void) | null = null;

  const request = async (nextMessage = 'Удалить?') => {
    const enabled = readStorage<boolean>(STORAGE_KEYS.confirmDelete, true);
    if (!enabled) {
      return true;
    }

    message.value = nextMessage;
    visible.value = true;

    return new Promise<boolean>((resolve) => {
      resolver = resolve;
    });
  };

  const confirm = () => {
    visible.value = false;
    resolver?.(true);
    resolver = null;
  };

  const cancel = () => {
    visible.value = false;
    resolver?.(false);
    resolver = null;
  };

  return {
    visible,
    message,
    request,
    confirm,
    cancel,
  };
};
