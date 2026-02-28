<script setup lang="ts">
import { PhSortAscending, PhSortDescending } from '@phosphor-icons/vue';
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    showSortToggle?: boolean;
    compact?: boolean;
    searchPlaceholder?: string;
  }>(),
  {
    showSortToggle: false,
    compact: true,
    searchPlaceholder: 'Поиск',
  },
);

const modelSearch = defineModel<string>('search', { required: true });
const modelSortDirection = defineModel<'asc' | 'desc'>('sortDirection', {
  default: 'asc',
});

const sortTitle = computed(() =>
  modelSortDirection.value === 'asc' ? 'Старые -> новые' : 'Новые -> старые',
);

const toggleSort = () => {
  modelSortDirection.value = modelSortDirection.value === 'asc' ? 'desc' : 'asc';
};
</script>

<template>
  <section class="filters" :class="{ 'with-sort-toggle': props.showSortToggle, compact: props.compact }">
    <label class="field">
      <span v-if="!props.compact">Поиск</span>
      <input v-model="modelSearch" type="text" :placeholder="props.searchPlaceholder" />
    </label>

    <button
      v-if="props.showSortToggle"
      type="button"
      class="btn sort-toggle-btn"
      :title="sortTitle"
      :aria-label="sortTitle"
      @click="toggleSort"
    >
      <PhSortAscending v-if="modelSortDirection === 'asc'" :size="18" />
      <PhSortDescending v-else :size="18" />
    </button>
    <slot name="after" />
  </section>
</template>
