import type { EventComment, EventItem, PlannedAction } from '@/types/domain';

export interface ActionsRepository {
  getAll(): Promise<PlannedAction[]>;
  saveAll(actions: PlannedAction[]): Promise<void>;
}

export interface EventsRepository {
  getAll(): Promise<EventItem[]>;
  saveAll(events: EventItem[]): Promise<void>;
  addComment(eventId: string, comment: EventComment): Promise<EventItem[]>;
  deleteComment(eventId: string, commentId: string): Promise<EventItem[]>;
}
