<script setup lang="ts">
import DatePicker from 'primevue/datepicker';
import { computed, ref, watch } from 'vue';
import type { PlannedAction } from '@/types/domain';

const props = defineProps<{
  visible: boolean;
  title: string;
  action?: PlannedAction | null;
  defaultPlannedAt?: string | null;
}>();

const emit = defineEmits<{
  close: [];
  save: [payload: { description: string; plannedAt: string | null; insertAt: 'start' | 'end' }];
  delete: [];
}>();

const description = ref('');
const plannedDateTime = ref<Date | null>(null);
const insertAt = ref<'start' | 'end'>('end');
const wasInitiallyPlanned = ref(false);

const hasDate = computed(() => !!plannedDateTime.value);
const showInsertPosition = computed(
  () => !hasDate.value && (!props.action || wasInitiallyPlanned.value),
);

watch(
  () => props.visible,
  (isOpen) => {
    if (!isOpen) {
      return;
    }
    description.value = props.action?.description ?? '';
    const sourceDate = props.action?.plannedAt ?? props.defaultPlannedAt ?? null;
    plannedDateTime.value = sourceDate ? new Date(sourceDate) : null;
    wasInitiallyPlanned.value = !!props.action?.plannedAt;
    insertAt.value = 'end';
  },
);

const close = () => emit('close');

const submit = () => {
  if (!description.value.trim()) {
    return;
  }
  emit('save', {
    description: description.value,
    plannedAt: plannedDateTime.value ? plannedDateTime.value.toISOString() : null,
    insertAt: insertAt.value,
  });
};
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
            <input v-model="description" type="text" placeholder="Например: Подготовить презентацию" />
          </label>

          <label class="field">
            <span>Дата и время (24ч)</span>
            <DatePicker
              v-model="plannedDateTime"
              showTime
              hourFormat="24"
              dateFormat="dd.mm.yy"
              showIcon
              iconDisplay="input"
              showClear
              :manualInput="false"
              fluid
            />
          </label>

          <label v-if="showInsertPosition" class="field">
            <span>Позиция в ленте</span>
            <select v-model="insertAt">
              <option value="start">В начало списка</option>
              <option value="end">В конец списка</option>
            </select>
          </label>

          <div class="dialog-actions">
            <button type="submit" class="btn primary">Сохранить</button>
            <button
              v-if="props.action"
              type="button"
              class="btn danger-btn"
              @click="$emit('delete')"
            >
              Удалить
            </button>
            <button type="button" class="btn" @click="close">Отмена</button>
          </div>
        </form>
      </section>
    </div>
  </Teleport>
</template>
