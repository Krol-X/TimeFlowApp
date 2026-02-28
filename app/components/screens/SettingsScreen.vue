<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { STORAGE_KEYS } from '@/constants/storage';
import { readStorage, writeStorage } from '@/utils/storage';

type ThemeMode = 'light' | 'dark';

const savedMode = readStorage<ThemeMode>(STORAGE_KEYS.theme, 'light');
const isDark = ref(savedMode === 'dark');
const confirmDeleteEnabled = ref(readStorage<boolean>(STORAGE_KEYS.confirmDelete, true));

const modeLabel = computed(() => (isDark.value ? 'Ночная' : 'Дневная'));
const deleteConfirmLabel = computed(() => (confirmDeleteEnabled.value ? 'Включено' : 'Выключено'));

const applyTheme = (mode: ThemeMode) => {
  document.documentElement.dataset.theme = mode;
  writeStorage(STORAGE_KEYS.theme, mode);
};

watch(
  isDark,
  (value) => {
    applyTheme(value ? 'dark' : 'light');
  },
  { immediate: true },
);

watch(
  confirmDeleteEnabled,
  (value) => {
    writeStorage(STORAGE_KEYS.confirmDelete, value);
  },
  { immediate: true },
);
</script>

<template>
  <section class="screen">
    <article class="card settings-card">
      <div class="setting-row">
        <div class="setting-copy">
          <p class="setting-title">Ночная тема</p>
          <p class="setting-hint">Текущая: {{ modeLabel }}</p>
        </div>
        <button
          type="button"
          class="theme-toggle"
          :class="{ on: isDark }"
          role="switch"
          :aria-checked="isDark"
          aria-label="Toggle night mode"
          @click="isDark = !isDark"
        >
          <span class="theme-toggle-thumb" />
        </button>
      </div>

      <div class="setting-row">
        <div class="setting-copy">
          <p class="setting-title">Подтверждение удаления</p>
          <p class="setting-hint">Текущее: {{ deleteConfirmLabel }}</p>
        </div>
        <button
          type="button"
          class="theme-toggle"
          :class="{ on: confirmDeleteEnabled }"
          role="switch"
          :aria-checked="confirmDeleteEnabled"
          aria-label="Toggle delete confirmation"
          @click="confirmDeleteEnabled = !confirmDeleteEnabled"
        >
          <span class="theme-toggle-thumb" />
        </button>
      </div>
    </article>
  </section>
</template>
