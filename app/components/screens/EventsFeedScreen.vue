<script setup lang="ts">
import { PhPlusCircle } from '@phosphor-icons/vue';
import { computed, onMounted, ref } from 'vue';
import EventCard from '@/components/elements/EventCard.vue';
import ActionsFilterBar from '@/components/ui/ActionsFilterBar.vue';
import EventDialog from '@/components/ui/EventDialog.vue';
import { useEventsFeed } from '@/composables/useEventsFeed';
import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';
import type { EventItem } from '@/types/domain';

const eventsFeed = useEventsFeed();
const deleteConfirm = useDeleteConfirm();
const events = eventsFeed.events;
const search = eventsFeed.search;
const sortDirection = eventsFeed.sortDirection;
const showDialog = ref(false);
const editingEventId = ref<string | null>(null);
const currentEvent = computed(
  () => events.value.find((event) => event.id === editingEventId.value) ?? null,
);

onMounted(async () => {
  await eventsFeed.load();
});

const isSystemEvent = (event: EventItem) => event.type !== undefined && event.type !== 'manual';

const openCreate = () => {
  editingEventId.value = null;
  showDialog.value = true;
};

const openDetails = (event: EventItem) => {
  editingEventId.value = event.id;
  showDialog.value = true;
};

const closeDialog = () => {
  showDialog.value = false;
  editingEventId.value = null;
};

const deleteEventById = async (eventId: string) => {
  if (!(await deleteConfirm.request('Удалить событие?'))) {
    return;
  }
  await eventsFeed.deleteEvent(eventId);
};

const deleteComment = async (eventId: string, commentId: string) => {
  if (!(await deleteConfirm.request('Удалить комментарий?'))) {
    return;
  }
  await eventsFeed.deleteComment(eventId, commentId);
};

const saveDialog = async (payload: { description: string; occurredAt: string | null }) => {
  if (currentEvent.value) {
    await eventsFeed.updateEvent(currentEvent.value.id, {
      description: payload.description,
      occurredAt: payload.occurredAt ?? new Date().toISOString(),
    });
  } else {
    await eventsFeed.addEvent({
      description: payload.description,
      occurredAt: payload.occurredAt,
    });
  }
  closeDialog();
};

const deleteCurrent = async () => {
  if (!currentEvent.value) {
    return;
  }
  await deleteEventById(currentEvent.value.id);
  closeDialog();
};
</script>

<template>
  <section class="screen">
    <div class="toolbar-sticky">
      <ActionsFilterBar
        v-model:search="search"
        v-model:sort-direction="sortDirection"
        :show-sort-toggle="true"
        search-placeholder="Поиск по событиям"
      >
        <template #after>
          <button type="button" class="btn toolbar-icon-btn" aria-label="Добавить событие" @click="openCreate">
            <PhPlusCircle :size="20" />
          </button>
        </template>
      </ActionsFilterBar>
    </div>

    <div v-if="events.length" class="events-list">
      <section v-for="event in events" :key="event.id" class="event-block">
        <EventCard
          :event="event"
          :can-delete="true"
          @card-click="openDetails(event)"
          @delete="deleteEventById(event.id)"
        />
      </section>
    </div>
    <p v-else class="empty-state">Событий пока нет.</p>

    <EventDialog
      :visible="showDialog"
      :title="currentEvent ? 'Событие' : 'Создать событие'"
      :event="currentEvent"
      :readonly="!!currentEvent && isSystemEvent(currentEvent)"
      :can-delete="!!currentEvent"
      @close="closeDialog"
      @save="saveDialog"
      @delete="deleteCurrent"
      @add-comment="eventsFeed.addComment"
      @delete-comment="deleteComment"
    />

    <ConfirmDialog
      :visible="deleteConfirm.visible.value"
      :message="deleteConfirm.message.value"
      @confirm="deleteConfirm.confirm"
      @cancel="deleteConfirm.cancel"
    />
  </section>
</template>
