<script setup lang="ts">
import { PhPlusCircle } from '@phosphor-icons/vue';
import { computed, onMounted, ref } from 'vue';
import ActionCard from '@/components/elements/ActionCard.vue';
import ActionDialog from '@/components/ui/ActionDialog.vue';
import ActionsFilterBar from '@/components/ui/ActionsFilterBar.vue';
import { useActionsFeed } from '@/composables/useActionsFeed';
import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';
import type { PlannedAction } from '@/types/domain';

const actionsFeed = useActionsFeed();
const deleteConfirm = useDeleteConfirm();
const search = actionsFeed.search;

const showDialog = ref(false);
const editingAction = ref<PlannedAction | null>(null);
const draggingActionId = ref<string | null>(null);
const dragInProgress = ref(false);

onMounted(async () => {
  await actionsFeed.load();
});

const list = computed(() => actionsFeed.unscheduledActions.value);

const openCreate = () => {
  editingAction.value = null;
  showDialog.value = true;
};

const openEdit = (action: PlannedAction) => {
  if (dragInProgress.value) {
    return;
  }
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

const onDragStart = (actionId: string) => {
  dragInProgress.value = true;
  draggingActionId.value = actionId;
};

const onDragEnd = () => {
  setTimeout(() => {
    dragInProgress.value = false;
    draggingActionId.value = null;
  }, 0);
};

const onDropAt = async (targetIndex: number) => {
  if (!draggingActionId.value) {
    return;
  }
  await actionsFeed.moveUnscheduled(draggingActionId.value, targetIndex);
  draggingActionId.value = null;
  dragInProgress.value = false;
};

const onDropToEnd = async () => {
  if (!draggingActionId.value) {
    return;
  }
  await actionsFeed.moveUnscheduled(draggingActionId.value, list.value.length);
  draggingActionId.value = null;
  dragInProgress.value = false;
};
</script>

<template>
  <section class="screen">
    <div class="toolbar-sticky">
      <ActionsFilterBar v-model:search="search" search-placeholder="Поиск по действиям">
        <template #after>
          <button type="button" class="btn toolbar-icon-btn" aria-label="Добавить действие" @click="openCreate">
            <PhPlusCircle :size="20" />
          </button>
        </template>
      </ActionsFilterBar>
    </div>

    <div
      v-if="list.length"
      class="actions-list"
      @dragover.prevent
      @drop.prevent="onDropToEnd"
    >
      <template v-for="(action, index) in list" :key="action.id">
        <div
          class="draggable-wrapper"
          @dragover.prevent
          @drop.stop.prevent="onDropAt(index)"
        >
          <ActionCard
            :action="action"
            :draggable="true"
            @card-click="openEdit(action)"
            @drag-start="onDragStart(action.id)"
            @drag-end="onDragEnd"
            @delete="deleteActionById(action.id)"
            @complete="actionsFeed.setActionStatus(action.id, 'completed')"
            @cancel="actionsFeed.setActionStatus(action.id, 'cancelled')"
            @reopen="actionsFeed.setActionStatus(action.id, 'active')"
          />
        </div>
      </template>
    </div>
    <p v-else class="empty-state">Внеплановых действий пока нет.</p>

    <ActionDialog
      :visible="showDialog"
      :title="editingAction ? 'Редактировать действие' : 'Создать действие'"
      :action="editingAction"
      :default-planned-at="null"
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
