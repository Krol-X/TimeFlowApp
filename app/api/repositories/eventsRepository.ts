import type { EventsRepository } from '@/api/contracts';
import { DEFAULT_EVENTS, STORAGE_KEYS } from '@/constants/storage';
import type { EventComment, EventItem } from '@/types/domain';
import { readStorage, writeStorage } from '@/utils/storage';

export class LocalEventsRepository implements EventsRepository {
  async getAll(): Promise<EventItem[]> {
    const events = readStorage<EventItem[]>(STORAGE_KEYS.events, DEFAULT_EVENTS);
    return Array.isArray(events) ? events : [];
  }

  async saveAll(events: EventItem[]): Promise<void> {
    writeStorage(STORAGE_KEYS.events, events);
  }

  async addComment(eventId: string, comment: EventComment): Promise<EventItem[]> {
    const events = await this.getAll();
    const updated = events.map((event) =>
      event.id === eventId ? { ...event, comments: [...event.comments, comment] } : event,
    );
    await this.saveAll(updated);
    return updated;
  }

  async deleteComment(eventId: string, commentId: string): Promise<EventItem[]> {
    const events = await this.getAll();
    const updated = events.map((event) =>
      event.id === eventId
        ? { ...event, comments: event.comments.filter((comment) => comment.id !== commentId) }
        : event,
    );
    await this.saveAll(updated);
    return updated;
  }
}

export const eventsRepository = new LocalEventsRepository();
