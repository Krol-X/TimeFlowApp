<script setup lang="ts">
import { computed, onMounted } from 'vue';
import ActionCard from '@/components/elements/ActionCard.vue';
import ActionsFilterBar from '@/components/ui/ActionsFilterBar.vue';
import { useActionsFeed } from '@/composables/useActionsFeed';
import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';

const actionsFeed = useActionsFeed();
const deleteConfirm = useDeleteConfirm();
const search = actionsFeed.search;

onMounted(async () => {
  await actionsFeed.load();
});

const list = computed(() => actionsFeed.archivedActions.value);

const deleteActionById = async (actionId: string) => {
  if (!(await deleteConfirm.request('Удалить действие?'))) {
    return;
  }
  await actionsFeed.deleteAction(actionId);
};
</script>

<template>
  <section class="screen">
    <div class="toolbar-sticky">
      <ActionsFilterBar v-model:search="search" search-placeholder="Поиск по архиву" />
    </div>

    <div v-if="list.length" class="actions-list">
      <ActionCard
        v-for="action in list"
        :key="action.id"
        :action="action"
        :interactive="false"
        :archived-view="true"
        @delete="deleteActionById(action.id)"
        @reopen="actionsFeed.setActionStatus(action.id, 'active')"
      />
    </div>
    <p v-else class="empty-state">Архив пуст.</p>

    <ConfirmDialog
      :visible="deleteConfirm.visible.value"
      :message="deleteConfirm.message.value"
      @confirm="deleteConfirm.confirm"
      @cancel="deleteConfirm.cancel"
    />
  </section>
</template>
