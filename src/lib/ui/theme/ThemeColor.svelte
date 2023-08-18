<script lang="ts">
  import type { Theme } from './types';
  import { onDestroy } from 'svelte';
  import { getContext } from 'svelte';

  const theme = getContext('theme');

  // TODO Fix hard-coded theme colors
  let themeColor = '#1a1c1e';
  const unsubscribe = theme.subscribe((value: Theme) => {
    themeColor = value?.mode === 'light' ? '#fcfcff' : '#1a1c1e';
  });
  onDestroy(unsubscribe);
</script>

<svelte:head>
  <meta name="theme-color" content={themeColor} />
</svelte:head>

<slot />
