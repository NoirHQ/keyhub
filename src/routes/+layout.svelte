<script>
  import { afterNavigate } from '$app/navigation';
  import { path } from '$lib/stores';
  import { ThemeProvider } from '$lib/ui/theme';

  const query = 'path';
  const fallback = '/wallet';

  afterNavigate((nav) => {
    $path = nav.to?.url.searchParams.get(query) || fallback;
  });
</script>

<ThemeProvider icons="material">
  <slot />
  {#if import.meta.env.PROD}
    <div class="chip footer">Technical Preview</div>
  {:else}
    <div class="chip footer-dev">DEVELOPMENT</div>
  {/if}
</ThemeProvider>

<style>
  .chip {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    border: 1px solid var(--mdc-theme-outline, #aaa);
    color: var(--mdc-theme-on-surface, #aaa);
    height: 32px;
    padding: 0 16px;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.25rem;
    letter-spacing: 0.006rem;
  }

  .footer {
    position: absolute;
    right: 16px;
    bottom: 16px;
  }

  .footer-dev {
    position: absolute;
    right: 16px;
    bottom: 16px;
    color: var(--mdc-theme-error, #bf3536);
    border: 2px solid var(--mdc-theme-error, #bf3536);
  }
</style>
