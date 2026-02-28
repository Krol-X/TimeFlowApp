const hasStorage = (): boolean => typeof window !== 'undefined' && !!window.localStorage;

export const readStorage = <T>(key: string, fallback: T): T => {
  if (!hasStorage()) {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const writeStorage = <T>(key: string, payload: T): void => {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(payload));
};
