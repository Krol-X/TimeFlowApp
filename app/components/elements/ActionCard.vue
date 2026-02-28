<script setup lang="ts">
import {
  PhArrowCounterClockwise,
  PhCheckCircle,
  PhProhibit,
  PhTrash,
} from '@phosphor-icons/vue';
import type { PlannedAction } from '@/types/domain';

const props = withDefaults(
  defineProps<{
    action: PlannedAction;
    draggable?: boolean;
    interactive?: boolean;
    archivedView?: boolean;
  }>(),
  {
    draggable: false,
    interactive: true,
    archivedView: false,
  },
);

defineEmits<{
  cardClick: [];
  delete: [];
  complete: [];
  cancel: [];
  reopen: [];
  dragStart: [];
  dragEnd: [];
}>();

const formatDateTime = (iso: string) => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
};
</script>

<template>
  <article
    class="card action-card"
    :class="[`status-${props.action.status}`, { clickable: props.interactive !== false }]"
    :draggable="props.draggable && props.action.status === 'active'"
    @dragstart="$emit('dragStart')"
    @dragend="$emit('dragEnd')"
    @click="props.interactive !== false && $emit('cardClick')"
  >
    <div
      class="card-topline"
    >
      <div class="action-main">
        <p class="action-description">{{ props.action.description }}</p>
        <p v-if="props.action.plannedAt" class="action-time">{{ formatDateTime(props.action.plannedAt) }}</p>
      </div>
      <div class="card-actions">
        <button
          v-if="!props.archivedView && props.action.status !== 'completed'"
          type="button"
          class="icon-btn"
          aria-label="Завершить действие"
          @click.stop="$emit('complete')"
        >
          <PhCheckCircle :size="16" />
        </button>
        <button
          v-if="!props.archivedView && props.action.status !== 'cancelled'"
          type="button"
          class="icon-btn"
          aria-label="Отменить действие"
          @click.stop="$emit('cancel')"
        >
          <PhProhibit :size="16" />
        </button>
        <button
          v-if="props.action.status !== 'active'"
          type="button"
          class="icon-btn"
          aria-label="Вернуть в активные"
          @click.stop="$emit('reopen')"
        >
          <PhArrowCounterClockwise :size="16" />
        </button>
        <button type="button" class="icon-btn danger" aria-label="Удалить действие" @click.stop="$emit('delete')">
          <PhTrash :size="16" />
        </button>
      </div>
    </div>
    <div class="action-meta">
      <span v-if="!props.action.plannedAt" class="action-badge">Внепланово</span>
      <span v-if="props.action.status === 'completed'" class="status-badge completed">Завершено</span>
      <span v-else-if="props.action.status === 'cancelled'" class="status-badge cancelled">Отменено</span>
      <span v-else class="status-badge active">Активно</span>
    </div>
  </article>
</template>
