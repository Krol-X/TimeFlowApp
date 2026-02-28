<script setup lang="ts">
import {
  PhArchiveBox,
  PhCalendarBlank,
  PhCalendarCheck,
  PhClockCountdown,
  PhGearSix,
} from '@phosphor-icons/vue';
import { computed } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';

const route = useRoute();

const navItems = [
  { to: '/scheduled', label: 'Туду', icon: PhCalendarCheck },
  { to: '/unscheduled', label: 'Разное', icon: PhClockCountdown },
  { to: '/archived', label: 'В архиве', icon: PhArchiveBox },
  { to: '/events', label: 'События', icon: PhCalendarBlank },
  { to: '/settings', label: 'Настройки', icon: PhGearSix },
];

const currentPath = computed(() => route.path);
</script>

<template>
  <div class="app-shell">
    <header class="desktop-nav">
      <nav class="nav-group">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :draggable="false"
          class="nav-link"
          :class="{ active: currentPath === item.to }"
        >
          <component :is="item.icon" :size="16" />
          {{ item.label }}
        </RouterLink>
      </nav>
    </header>

    <main class="content-area">
      <RouterView />
    </main>

    <footer class="mobile-tabbar">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :draggable="false"
        class="tab-item"
        :class="{ active: currentPath === item.to }"
      >
        <component :is="item.icon" :size="18" />
        {{ item.label }}
      </RouterLink>
    </footer>
  </div>
</template>
