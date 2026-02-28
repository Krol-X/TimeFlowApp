import type { ActionsRepository } from '@/api/contracts';
import { DEFAULT_ACTIONS, STORAGE_KEYS } from '@/constants/storage';
import type { PlannedAction } from '@/types/domain';
import { readStorage, writeStorage } from '@/utils/storage';

const migrateAction = (item: Record<string, unknown>, index: number): PlannedAction => {
  const legacyTime = typeof item.plannedTime === 'string' ? item.plannedTime : null;
  const isLegacyUnscheduled = Boolean(item.isUnscheduled);
  const today = new Date().toISOString().slice(0, 10);
  const legacyPlannedAt = legacyTime ? new Date(`${today}T${legacyTime}:00`).toISOString() : null;

  return {
    id: String(item.id ?? `${Date.now()}-${index}`),
    description: String(item.description ?? ''),
    plannedAt:
      typeof item.plannedAt === 'string'
        ? item.plannedAt
        : isLegacyUnscheduled
          ? null
          : legacyPlannedAt,
    status:
      item.status === 'completed' || item.status === 'cancelled' || item.status === 'active'
        ? item.status
        : 'active',
    order: Number.isFinite(Number(item.order)) ? Number(item.order) : index,
    createdAt:
      typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
    updatedAt:
      typeof item.updatedAt === 'string' ? item.updatedAt : new Date().toISOString(),
  };
};

export class LocalActionsRepository implements ActionsRepository {
  async getAll(): Promise<PlannedAction[]> {
    const raw = readStorage<Record<string, unknown>[]>(STORAGE_KEYS.actions, DEFAULT_ACTIONS);
    const actions = Array.isArray(raw)
      ? raw.map((item, index) => migrateAction(item, index))
      : [];
    return actions;
  }

  async saveAll(actions: PlannedAction[]): Promise<void> {
    writeStorage(STORAGE_KEYS.actions, actions);
  }
}

export const actionsRepository = new LocalActionsRepository();
