<script setup lang="ts">
import { PhTrash } from '@phosphor-icons/vue';
import type { EventItem } from '@/types/domain';

defineProps<{
  event: EventItem;
  canDelete?: boolean;
}>();

defineEmits<{
  cardClick: [];
  delete: [];
}>();

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));

const lastCommentPreview = (event: EventItem) => {
  if (!event.comments.length) {
    return '';
  }
  const latest = [...event.comments].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  if (!latest) {
    return '';
  }
  const text = latest.text.trim();
  return text.length > 90 ? `${text.slice(0, 90)}...` : text;
};
</script>

<template>
  <article
    class="card event-card clickable"
    :class="{ 'system-event-card': event.type && event.type !== 'manual' }"
    @click="$emit('cardClick')"
  >
    <div class="card-topline">
      <header class="event-header">
        <p class="event-description">{{ event.description }}</p>
        <time class="event-time">{{ formatDate(event.occurredAt) }}</time>
      </header>
      <button
        v-if="canDelete"
        type="button"
        class="icon-btn danger"
        aria-label="Удалить событие"
        @click.stop="$emit('delete')"
      >
        <PhTrash :size="16" />
      </button>
    </div>
    <div v-if="event.comments.length" class="event-comments-preview">
      <p class="event-comment-preview">{{ lastCommentPreview(event) }}</p>
      <p class="event-comments-count">Комментариев: {{ event.comments.length }}</p>
    </div>
  </article>
</template>
