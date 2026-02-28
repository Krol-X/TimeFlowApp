import type { EventItem, PlannedAction } from '@/types/domain';

export const STORAGE_KEYS = {
  actions: 'timeflow.actions.v1',
  events: 'timeflow.events.v1',
  theme: 'timeflow.theme.v1',
  confirmDelete: 'timeflow.confirmDelete.v1',
} as const;

export const DEFAULT_ACTIONS: PlannedAction[] = [];

export const DEFAULT_EVENTS: EventItem[] = [];
