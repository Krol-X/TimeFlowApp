import { reactive, readonly } from 'vue';
import { eventsRepository } from '@/api/repositories/eventsRepository';
import type { EventComment, EventItem } from '@/types/domain';

const state = reactive({
  items: [] as EventItem[],
  isLoaded: false,
});

const persist = async () => {
  await eventsRepository.saveAll(state.items);
};

export const useEventsStore = () => {
  const load = async () => {
    if (state.isLoaded) {
      return;
    }
    state.items = await eventsRepository.getAll();
    state.isLoaded = true;
  };

  const setEvents = async (items: EventItem[]) => {
    state.items = items;
    await persist();
  };

  const appendComment = async (eventId: string, comment: EventComment) => {
    state.items = await eventsRepository.addComment(eventId, comment);
  };

  const removeComment = async (eventId: string, commentId: string) => {
    state.items = await eventsRepository.deleteComment(eventId, commentId);
  };

  return {
    state: readonly(state),
    load,
    setEvents,
    appendComment,
    removeComment,
  };
};
