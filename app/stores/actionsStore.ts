import { reactive, readonly } from 'vue';
import { actionsRepository } from '@/api/repositories/actionsRepository';
import type { PlannedAction } from '@/types/domain';

const state = reactive({
  items: [] as PlannedAction[],
  isLoaded: false,
});

const persist = async () => {
  await actionsRepository.saveAll(state.items);
};

export const useActionsStore = () => {
  const load = async () => {
    if (state.isLoaded) {
      return;
    }
    state.items = await actionsRepository.getAll();
    state.isLoaded = true;
  };

  const setActions = async (items: PlannedAction[]) => {
    state.items = items;
    await persist();
  };

  return {
    state: readonly(state),
    load,
    setActions,
  };
};
