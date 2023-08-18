<script lang="ts">
  import Appearance from './Appearance.svelte';
  import Menu from './Menu.svelte';
  import { path } from '$lib/stores';
</script>

<div class="settings-container">
  {#if $path === '/settings/appearance'}
    <Appearance />
  {:else}
    <Menu />
  {/if}
</div>

<style lang="scss">
  @use '$lib/ui/m3/typography' as typography;

  .settings-container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    flex-grow: 1;
    width: calc(100% - 30px);
    max-width: 600px;
    align-self: center;
  }

  :global(.settings-container .header) {
    @include typography.headline-medium;

    display: flex;
    align-items: center;
    margin: 24px 0;

    :global(span) {
      line-height: 54px;
    }
  }

  :global(.settings-container .content) {
    display: flex;
    flex-direction: column;
  }
</style>
