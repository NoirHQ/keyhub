<script lang="ts">
  import { setContext } from 'svelte';

  export let set: 'material' | 'fontawesome' = 'material';

  setContext('icons', { set });
</script>

<svelte:head>
  {#if set === 'material'}
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined|Material+Icons+Round"
    />
  {:else}
    <script src="https://kit.fontawesome.com/ebab806513.js" crossorigin="anonymous"></script>
  {/if}
</svelte:head>

<slot />
