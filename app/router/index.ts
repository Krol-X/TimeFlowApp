import { createRouter, createWebHashHistory } from 'vue-router';
import ScheduledActionsScreen from '@/components/screens/ScheduledActionsScreen.vue';
import UnscheduledActionsScreen from '@/components/screens/UnscheduledActionsScreen.vue';
import ArchivedActionsScreen from '@/components/screens/ArchivedActionsScreen.vue';
import EventsFeedScreen from '@/components/screens/EventsFeedScreen.vue';
import SettingsScreen from '@/components/screens/SettingsScreen.vue';

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/scheduled' },
    { path: '/scheduled', name: 'scheduled', component: ScheduledActionsScreen },
    { path: '/unscheduled', name: 'unscheduled', component: UnscheduledActionsScreen },
    { path: '/archived', name: 'archived', component: ArchivedActionsScreen },
    { path: '/events', name: 'events', component: EventsFeedScreen },
    { path: '/settings', name: 'settings', component: SettingsScreen },
  ],
});
