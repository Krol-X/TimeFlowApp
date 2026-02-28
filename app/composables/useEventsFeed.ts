import { computed, ref } from 'vue';
import { useEventsStore } from '@/stores/eventsStore';
import type { EventItem } from '@/types/domain';

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

export const useEventsFeed = () => {
  const eventsStore = useEventsStore();
  const search = ref('');
  const sortDirection = ref<'asc' | 'desc'>('desc');

  const events = computed(() => {
    const query = search.value.trim().toLowerCase();
    const filtered = eventsStore.state.items.filter((event) =>
      event.description.toLowerCase().includes(query),
    );
    if (sortDirection.value === 'asc') {
      return [...filtered].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
    }
    return [...filtered].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  });

  const load = async () => {
    await eventsStore.load();
  };

  const addEvent = async (payload: { description: string; occurredAt: string | null }) => {
    const next: EventItem[] = [
      ...eventsStore.state.items,
      {
        id: makeId(),
        type: 'manual',
        description: payload.description.trim(),
        occurredAt: payload.occurredAt ?? new Date().toISOString(),
        comments: [],
      },
    ];
    await eventsStore.setEvents(next);
  };

  const addComment = async (eventId: string, text: string) => {
    await eventsStore.appendComment(eventId, {
      id: makeId(),
      eventId,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    });
  };

  const deleteComment = async (eventId: string, commentId: string) => {
    await eventsStore.removeComment(eventId, commentId);
  };

  const updateEvent = async (eventId: string, payload: { description: string; occurredAt: string }) => {
    const next = eventsStore.state.items.map((item) =>
      item.id === eventId
        ? {
            ...item,
            description: payload.description.trim(),
            occurredAt: payload.occurredAt,
          }
        : item,
    );
    await eventsStore.setEvents(next);
  };

  const deleteEvent = async (eventId: string) => {
    const next = eventsStore.state.items.filter((item) => item.id !== eventId);
    await eventsStore.setEvents(next);
  };

  return {
    search,
    sortDirection,
    events,
    load,
    addEvent,
    addComment,
    deleteComment,
    updateEvent,
    deleteEvent,
  };
};
