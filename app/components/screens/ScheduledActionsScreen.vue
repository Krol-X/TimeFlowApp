<script setup lang="ts">
import { PhPlusCircle } from '@phosphor-icons/vue';
import { computed, onMounted, ref } from 'vue';
import ActionCard from '@/components/elements/ActionCard.vue';
import ScheduledActionDialog from '@/components/ui/ActionDialog.vue';
import ActionsFilterBar from '@/components/ui/ActionsFilterBar.vue';
import { useActionsFeed } from '@/composables/useActionsFeed';
import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';
import type { PlannedAction } from '@/types/domain';

const actionsFeed = useActionsFeed();
const deleteConfirm = useDeleteConfirm();
const search = actionsFeed.search;
const scheduledSortDirection = actionsFeed.scheduledSortDirection;

const showDialog = ref(false);
const editingAction = ref<PlannedAction | null>(null);

onMounted(async () => {
  await actionsFeed.load();
});

const list = computed(() => actionsFeed.scheduledActions.value);
const defaultPlannedAt = () => {
  const date = new Date(Date.now() + 60 * 60 * 1000);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const openCreate = () => {
  editingAction.value = null;
  showDialog.value = true;
};

const openEdit = (action: PlannedAction) => {
  editingAction.value = action;
  showDialog.value = true;
};

const closeDialog = () => {
  showDialog.value = false;
  editingAction.value = null;
};

const deleteActionById = async (actionId: string) => {
  if (!(await deleteConfirm.request('Удалить действие?'))) {
    return;
  }
  await actionsFeed.deleteAction(actionId);
};

const deleteCurrent = async () => {
  if (!editingAction.value) {
    return;
  }
  await deleteActionById(editingAction.value.id);
  closeDialog();
};

const saveDialog = async (payload: {
  description: string;
  plannedAt: string | null;
  insertAt: 'start' | 'end';
}) => {
  if (editingAction.value) {
    await actionsFeed.updateAction(editingAction.value.id, {
      description: payload.description,
      plannedAt: payload.plannedAt,
    });
  } else {
    await actionsFeed.createAction({
      description: payload.description,
      plannedAt: payload.plannedAt,
      insertAt: payload.insertAt,
    });
  }
  closeDialog();
};
</script>

<template>
  <section class="screen">
    <div class="toolbar-sticky">
      <ActionsFilterBar
        v-model:search="search"
        v-model:sort-direction="scheduledSortDirection"
        :show-sort-toggle="true"
        search-placeholder="Поиск по действиям"
      >
        <template #after>
          <button type="button" class="btn toolbar-icon-btn" aria-label="Добавить действие" @click="openCreate">
            <PhPlusCircle :size="20" />
          </button>
        </template>
      </ActionsFilterBar>
    </div>

    <div v-if="list.length" class="actions-list">
      <ActionCard
        v-for="action in list"
        :key="action.id"
        :action="action"
        @card-click="openEdit(action)"
        @delete="deleteActionById(action.id)"
        @complete="actionsFeed.setActionStatus(action.id, 'completed')"
        @cancel="actionsFeed.setActionStatus(action.id, 'cancelled')"
        @reopen="actionsFeed.setActionStatus(action.id, 'active')"
      />
    </div>
    <p v-else class="empty-state">Запланированных действий пока нет.</p>

    <ScheduledActionDialog
      :visible="showDialog"
      :title="editingAction ? 'Редактировать действие' : 'Создать действие'"
      :action="editingAction"
      :default-planned-at="defaultPlannedAt()"
      @close="closeDialog"
      @save="saveDialog"
      @delete="deleteCurrent"
    />

    <ConfirmDialog
      :visible="deleteConfirm.visible.value"
      :message="deleteConfirm.message.value"
      @confirm="deleteConfirm.confirm"
      @cancel="deleteConfirm.cancel"
    />
  </section>
</template>
