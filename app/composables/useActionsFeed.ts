import { computed, ref } from 'vue';
import { useEventsStore } from '@/stores/eventsStore';
import { useActionsStore } from '@/stores/actionsStore';
import type { EventItem, PlannedAction } from '@/types/domain';

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const normalizeOrder = (items: PlannedAction[]): PlannedAction[] =>
  items.map((item, index) => ({ ...item, order: index }));

const toIsoFromDateTimeLocal = (value: string | null): string | null => {
  if (!value) {
    return null;
  }
  return new Date(value).toISOString();
};

const sortManual = (items: PlannedAction[]): PlannedAction[] =>
  [...items].sort((a, b) => a.order - b.order);

export const useActionsFeed = () => {
  const actionsStore = useActionsStore();
  const eventsStore = useEventsStore();
  const search = ref('');
  const scheduledSortDirection = ref<'asc' | 'desc'>('asc');

  const actions = computed(() => actionsStore.state.items);

  const filtered = computed(() => {
    const query = search.value.trim().toLowerCase();
    return actions.value.filter((item) =>
      item.description.toLowerCase().includes(query),
    );
  });

  const scheduledActions = computed(() => {
    const list = filtered.value.filter((item) => !!item.plannedAt && item.status === 'active');
    if (scheduledSortDirection.value === 'asc') {
      return [...list].sort((a, b) => (a.plannedAt ?? '').localeCompare(b.plannedAt ?? ''));
    }
    return [...list].sort((a, b) => (b.plannedAt ?? '').localeCompare(a.plannedAt ?? ''));
  });

  const unscheduledActions = computed(() =>
    sortManual(filtered.value.filter((item) => !item.plannedAt && item.status === 'active')),
  );

  const archivedActions = computed(() =>
    [...filtered.value.filter((item) => item.status !== 'active')].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    ),
  );

  const makeEventId = () => `evt-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

  const appendSystemEvent = async (payload: {
    actionId: string;
    type: NonNullable<EventItem['type']>;
    description: string;
    occurredAt?: string;
  }) => {
    await eventsStore.load();
    const next: EventItem[] = [
      ...eventsStore.state.items,
      {
        id: makeEventId(),
        actionId: payload.actionId,
        type: payload.type,
        description: payload.description,
        occurredAt: payload.occurredAt ?? new Date().toISOString(),
        comments: [],
      },
    ];
    await eventsStore.setEvents(next);
  };

  const syncOverdueEvents = async () => {
    await eventsStore.load();
    const now = new Date().toISOString();
    const overdueActions = actionsStore.state.items.filter(
      (item) => item.status === 'active' && !!item.plannedAt && item.plannedAt < now,
    );
    if (!overdueActions.length) {
      return;
    }

    const existingOverdue = new Set(
      eventsStore.state.items
        .filter((event) => event.type === 'action-overdue' && event.actionId)
        .map((event) => event.actionId as string),
    );

    const overdueEvents = overdueActions
      .filter((action) => !existingOverdue.has(action.id))
      .map((action) => ({
        id: makeEventId(),
        actionId: action.id,
        type: 'action-overdue' as const,
        description: `Действие просрочено: ${action.description}`,
        occurredAt: now,
        comments: [],
      }));

    if (!overdueEvents.length) {
      return;
    }

    await eventsStore.setEvents([...eventsStore.state.items, ...overdueEvents]);
  };

  const load = async () => {
    await actionsStore.load();
    await syncOverdueEvents();
  };

  const createAction = async (payload: {
    description: string;
    plannedAt: string | null;
    insertAt?: 'start' | 'end';
  }) => {
    const now = new Date().toISOString();
    const base: PlannedAction = {
      id: makeId(),
      description: payload.description.trim(),
      plannedAt: toIsoFromDateTimeLocal(payload.plannedAt),
      status: 'active',
      order: actions.value.length,
      createdAt: now,
      updatedAt: now,
    };

    let next = [...actions.value];
    if (!base.plannedAt) {
      const ordered = sortManual(actions.value);
      const unscheduledPositions = ordered
        .map((item, index) => (!item.plannedAt ? index : -1))
        .filter((index) => index !== -1);
      const insertAt = payload.insertAt ?? 'end';
      const globalIndex =
        unscheduledPositions.length === 0
          ? ordered.length
          : insertAt === 'start'
            ? unscheduledPositions[0]
            : unscheduledPositions[unscheduledPositions.length - 1] + 1;
      next = [...ordered.slice(0, globalIndex), base, ...ordered.slice(globalIndex)];
    } else {
      next.push(base);
    }

    await actionsStore.setActions(normalizeOrder(next));
    await syncOverdueEvents();
  };

  const updateAction = async (
    actionId: string,
    payload: { description: string; plannedAt: string | null },
  ) => {
    const next = actions.value.map((item) =>
      item.id === actionId
        ? {
            ...item,
            description: payload.description.trim(),
            plannedAt: toIsoFromDateTimeLocal(payload.plannedAt),
            updatedAt: new Date().toISOString(),
          }
        : item,
    );
    await actionsStore.setActions(normalizeOrder(next));
    await syncOverdueEvents();
  };

  const moveUnscheduled = async (actionId: string, targetIndex: number) => {
    const ordered = sortManual(actions.value);
    const unscheduled = ordered.filter((item) => !item.plannedAt);
    const sourceIndex = unscheduled.findIndex((item) => item.id === actionId);
    if (sourceIndex < 0) {
      return;
    }

    const reordered = [...unscheduled];
    const [moved] = reordered.splice(sourceIndex, 1);
    const bounded = Math.max(0, Math.min(targetIndex, reordered.length));
    reordered.splice(bounded, 0, { ...moved, updatedAt: new Date().toISOString() });

    let pointer = 0;
    const merged = ordered.map((item) => (item.plannedAt ? item : reordered[pointer++]));
    await actionsStore.setActions(normalizeOrder(merged));
  };

  const setActionStatus = async (
    actionId: string,
    status: PlannedAction['status'],
  ) => {
    const target = actions.value.find((item) => item.id === actionId);
    if (!target) {
      return;
    }
    const previousStatus = target.status;
    if (previousStatus === status) {
      return;
    }

    const next = actions.value.map((item) =>
      item.id === actionId
        ? {
            ...item,
            status,
            updatedAt: new Date().toISOString(),
          }
        : item,
    );
    await actionsStore.setActions(normalizeOrder(next));
    await syncOverdueEvents();

    if (!target.plannedAt) {
      return;
    }

    if (status === 'completed') {
      await appendSystemEvent({
        actionId,
        type: 'action-completed',
        description: `Действие завершено: ${target.description}`,
      });
    } else if (status === 'cancelled') {
      await appendSystemEvent({
        actionId,
        type: 'action-cancelled',
        description: `Действие отменено: ${target.description}`,
      });
    } else if (status === 'active') {
      await appendSystemEvent({
        actionId,
        type: 'action-reopened',
        description: `Действие возвращено в активные: ${target.description}`,
      });
    }
  };

  const deleteAction = async (actionId: string) => {
    const next = actions.value.filter((item) => item.id !== actionId);
    await actionsStore.setActions(normalizeOrder(next));
  };

  return {
    search,
    scheduledSortDirection,
    actions,
    scheduledActions,
    unscheduledActions,
    archivedActions,
    load,
    createAction,
    updateAction,
    moveUnscheduled,
    setActionStatus,
    deleteAction,
  };
};
