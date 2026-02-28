export type ISODateTime = string;

/**
 * Запланированное действие пользователя.
 * plannedAt может быть null для незапланированной задачи.
 */
export interface PlannedAction {
  id: string;
  description: string;
  plannedAt: ISODateTime | null;
  status: 'active' | 'completed' | 'cancelled';
  order: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

/**
 * Комментарий к событию.
 */
export interface EventComment {
  id: string;
  eventId: string;
  text: string;
  createdAt: ISODateTime;
}

/**
 * Событие в хронологической ленте.
 */
export interface EventItem {
  id: string;
  actionId?: string;
  type?: 'manual' | 'action-completed' | 'action-cancelled' | 'action-overdue' | 'action-reopened';
  description: string;
  occurredAt: ISODateTime;
  comments: ReadonlyArray<EventComment>;
}
