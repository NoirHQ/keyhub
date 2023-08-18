<script lang="ts">
  import type { Theme } from '$lib/ui/theme';
  import type { Writable } from 'svelte/store';
  import { getContext } from 'svelte';
  import { _ } from 'svelte-i18n';
  import { goto } from '$app/navigation';
  import Button, { Label } from '$lib/ui/button';
  import Card, { Content } from '$lib/ui/card';
  import Icon from '$lib/ui/icon';

  const theme: Writable<Theme> = getContext('theme');
  let selected = localStorage.getItem('theme') ?? 'system';

  let modes = [
    {
      value: 'light',
      action: () => {
        localStorage.setItem('theme', 'light');
        theme.set({ mode: 'light' });
        selected = 'light';
      }
    },
    {
      value: 'dark',
      action: () => {
        localStorage.setItem('theme', 'dark');
        theme.set({ mode: 'dark' });
        selected = 'dark';
      }
    },
    {
      value: 'system',
      action: () => {
        localStorage.removeItem('theme');
        theme.set({
          mode: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        });
        selected = 'system';
      }
    }
  ];
</script>

<div class="header">
  <Button on:click={() => goto('/?path=/settings')}>
    <Icon smui="common" name="keyboard_arrow_left" variant="rounded" />
    <Label>{$_('page.main.menu.settings')}</Label>
  </Button>
</div>
<div class="content">
  <span class="section-header">{$_('page.main.settings.appearance')}</span>
  <Card variant="filled" ripple={false} interactive={false}>
    <Content>
      <div class="theme-selector-container">
        {#each modes as mode}
          <button
            class="theme-selector"
            class:selected={selected === mode.value}
            on:click={mode.action}
          >
            {$_(`page.main.settings.${mode.value}`)}
          </button>
        {/each}
      </div>
    </Content>
  </Card>
</div>

<style lang="scss">
  @use '$lib/ui/m3/typography' as typography;

  .section-header {
    @include typography.title-small;
    margin: 0 0 8px 15px;
    color: var(--mdc-theme-on-surface-variant);
  }

  .theme-selector-container {
    display: flex;
    justify-content: center;
    column-gap: 28px;
  }

  .theme-selector {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: none;
    border-radius: 16px;
    width: 54px;
    height: 54px;
    background-color: var(--mdc-theme-surface-container-high);
    color: var(--mdc-theme-on-surface);
    word-break: keep-all;
  }

  .theme-selector.selected {
    border: 1px solid var(--mdc-theme-primary);
  }

  .selected {
    color: var(--mdc-theme-primary);
  }
</style>
