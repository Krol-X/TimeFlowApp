<script setup lang="ts">
import DatePicker from 'primevue/datepicker';
import { PhPaperPlaneTilt, PhTrash } from '@phosphor-icons/vue';
import { computed, ref, watch } from 'vue';
import type { EventItem } from '@/types/domain';

const props = defineProps<{
  visible: boolean;
  title: string;
  event?: EventItem | null;
  readonly?: boolean;
  canDelete?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  save: [payload: { description: string; occurredAt: string | null }];
  delete: [];
  addComment: [eventId: string, text: string];
  deleteComment: [eventId: string, commentId: string];
}>();

const description = ref('');
const occurredAt = ref<Date | null>(null);
const commentText = ref('');

watch(
  () => props.visible,
  (isOpen) => {
    if (!isOpen) {
      return;
    }
    description.value = props.event?.description ?? '';
    occurredAt.value = props.event?.occurredAt ? new Date(props.event.occurredAt) : new Date();
    commentText.value = '';
  },
);

const close = () => emit('close');

const submit = () => {
  if (!description.value.trim()) {
    return;
  }
  emit('save', {
    description: description.value,
    occurredAt: occurredAt.value ? occurredAt.value.toISOString() : null,
  });
};

const submitComment = () => {
  if (!props.event || !commentText.value.trim()) {
    return;
  }
  emit('addComment', props.event.id, commentText.value);
  commentText.value = '';
};

const removeComment = (commentId: string) => {
  if (!props.event) {
    return;
  }
  emit('deleteComment', props.event.id, commentId);
};

const sortedComments = computed(() =>
  [...(props.event?.comments ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
);

const formatCommentDate = (iso: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="dialog-backdrop" @click.self="close">
      <section class="dialog-card">
        <header class="dialog-header">
          <h2>{{ title }}</h2>
          <button type="button" class="icon-btn" aria-label="Закрыть диалог" @click="close">×</button>
        </header>

        <form class="dialog-form" @submit.prevent="submit">
          <label class="field">
            <span>Описание</span>
            <input
              v-model="description"
              type="text"
              placeholder="Например: Созвон завершен"
              :disabled="props.readonly"
            />
          </label>

          <label class="field">
            <span>Дата и время (24ч)</span>
            <DatePicker
              v-model="occurredAt"
              showTime
              hourFormat="24"
              dateFormat="dd.mm.yy"
              showIcon
              iconDisplay="input"
              :manualInput="false"
              :disabled="props.readonly"
              fluid
            />
          </label>

          <div class="dialog-actions">
            <button v-if="!props.readonly" type="submit" class="btn primary">Сохранить</button>
            <button
              v-if="props.canDelete"
              type="button"
              class="btn danger-btn"
              @click="$emit('delete')"
            >
              Удалить
            </button>
            <button type="button" class="btn" @click="close">Отмена</button>
          </div>
        </form>

        <section v-if="props.event" class="dialog-comments">
          <form class="comment-form" @submit.prevent="submitComment">
            <input
              v-model="commentText"
              type="text"
              placeholder="Добавить комментарий"
              aria-label="Комментарий к событию"
            />
            <button type="submit" class="icon-btn comment-send-btn" aria-label="Отправить комментарий">
              <PhPaperPlaneTilt :size="14" />
            </button>
          </form>
          <div class="event-comments-scroll">
            <div v-if="sortedComments.length" class="event-comments">
              <div v-for="comment in sortedComments" :key="comment.id" class="event-comment-row">
                <p class="event-comment">{{ comment.text }}</p>
                <div class="comment-side">
                  <time class="event-comment-time">{{ formatCommentDate(comment.createdAt) }}</time>
                  <button
                    type="button"
                    class="icon-btn tiny danger"
                    aria-label="Удалить комментарий"
                    @click="removeComment(comment.id)"
                  >
                    <PhTrash :size="12" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>
    </div>
  </Teleport>
</template>
