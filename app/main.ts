import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import App from '@/App.vue';
import { STORAGE_KEYS } from '@/constants/storage';
import { router } from '@/router';
import { readStorage } from '@/utils/storage';
import '@/assets/css/tokens.css';
import '@/assets/css/main.css';
import '@fontsource/inclusive-sans/400.css';
import '@fontsource/inclusive-sans/600.css';
import 'primeicons/primeicons.css';

const app = createApp(App);
const savedTheme = readStorage<'light' | 'dark'>(STORAGE_KEYS.theme, 'light');

document.documentElement.dataset.theme = savedTheme;

app.use(PrimeVue, {
  ripple: false,
  theme: {
    preset: Aura,
  },
});
app.use(router);
app.mount('#app');
