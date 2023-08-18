<script lang="ts">
  import type { Theme, ThemeMode } from './types';
  import type { Unsubscriber, Writable } from 'svelte/store';
  import { onDestroy, onMount, setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { browser } from '$app/environment';

  const theme: Writable<Theme> = writable();
  setContext('theme', theme);

  let unsubscribe: Unsubscriber;

  function loadTheme(): ThemeMode {
    const stored = localStorage.getItem('theme');
    return stored
      ? (stored as ThemeMode)
      : window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function onPrefersColorSchemeChange(e: MediaQueryListEvent): void {
    if (!localStorage.getItem('theme')) {
      theme.set({
        mode: e.matches ? 'dark' : 'light'
      });
    }
  }

  onMount(() => {
    unsubscribe = theme.subscribe((value: Theme) => {
      document.body.dataset.theme = value?.mode;
    });
    theme.set({ mode: loadTheme() });
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', onPrefersColorSchemeChange);
  });

  onDestroy(() => {
    unsubscribe?.();
    if (browser) {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .removeEventListener('change', onPrefersColorSchemeChange);
    }
  });
</script>

<slot />
