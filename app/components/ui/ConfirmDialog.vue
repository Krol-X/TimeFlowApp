<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    visible: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
  }>(),
  {
    title: 'Подтверждение',
    confirmText: 'Удалить',
    cancelText: 'Отмена',
  },
);

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>

<template>
  <Teleport to="body">
    <div v-if="props.visible" class="dialog-backdrop" @click.self="$emit('cancel')">
      <section class="dialog-card confirm-dialog-card">
        <header class="dialog-header">
          <h2>{{ props.title }}</h2>
        </header>
        <p class="confirm-message">{{ props.message }}</p>
        <div class="dialog-actions">
          <button type="button" class="btn danger-btn" @click="$emit('confirm')">{{ props.confirmText }}</button>
          <button type="button" class="btn" @click="$emit('cancel')">{{ props.cancelText }}</button>
        </div>
      </section>
    </div>
  </Teleport>
</template>
