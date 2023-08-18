<script lang="ts">
  import { classMap } from '@smui/common/internal';
  import Ripple from '@smui/ripple';

  export let selected = false;
  export let href: string | undefined = undefined;
  export let tag: 'a' | 'button' = href ? 'a' : 'button';
  export let ripple = true;

  let className = '';
  export { className as class };

  let element: HTMLElement;
</script>

<svelte:element
  this={tag}
  role="button"
  tabindex="0"
  bind:this={element}
  class={classMap({
    [className]: true,
    'mdc-nav-bar-item': true,
    'mdc-nav-bar-item--selected': selected
  })}
  {href}
  {...$$restProps}
  on:click
>
  <div class="mdc-nav-bar-item__icon">
    {#if !ripple}
      <div class="state-layer" />
    {/if}
    <div class="icon" use:Ripple={{ eventTarget: element, ripple, surface: true }}>
      <slot name="icon" style="width: 24px; height: 24px;" />
    </div>
  </div>
  <div class="mdc-nav-bar-item__label">
    <slot />
  </div>
</svelte:element>

<style lang="scss">
  :global(.mdc-nav-bar-item) {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 48px;
    align-self: stretch;
    padding-top: 12px;
    padding-bottom: 16px;
    row-gap: 4px;
    cursor: pointer;

    border: none;
    background-color: transparent;
    color: transparent;
    font-weight: 500;
  }

  .state-layer {
    position: absolute;
    box-sizing: content-box;
    inset: 0;
    border-radius: inherit;
    overflow: hidden;
    pointer-events: none;
  }

  :global(.mdc-nav-bar-item:hover) > .mdc-nav-bar-item__label {
    color: var(--mdc-theme-on-surface);
  }

  :global(.mdc-nav-bar-item:hover) .state-layer {
    background-color: var(--mdc-theme-on-surface-variant);
    opacity: 0.08;
  }

  :global(.mdc-nav-bar-item:hover.mdc-nav-bar-item--selected) .state-layer {
    background-color: var(--mdc-theme-on-surface);
    opacity: 0.08;
  }

  :global(.mdc-nav-bar-item:active) .state-layer,
  :global(.mdc-nav-bar-item:focus) .state-layer {
    background-color: var(--mdc-theme-on-surface-variant);
    opacity: 0.12;
  }

  :global(.mdc-nav-bar-item:active.mdc-nav-bar-item--selected) .state-layer,
  :global(.mdc-nav-bar-item:focus.mdc-nav-bar-item--selected) .state-layer {
    background-color: var(--mdc-theme-on-surface);
    opacity: 0.12;
  }

  .mdc-nav-bar-item__icon {
    position: relative;
    display: flex;
    width: 64px;
    height: 32px;
    border-radius: 16px;
  }

  .icon {
    width: 100%;
    height: 100%;
    border-radius: inherit;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  :global(.mdc-nav-bar-item--selected) .icon {
    background-color: var(--mdc-theme-secondary-container);
    color: var(--mdc-theme-on-secondary-container);
  }

  :global(.mdc-nav-bar-item:not(.mdc-nav-bar-item--selected)) .icon {
    color: var(--mdc-theme-on-surface-variant);
  }

  .mdc-nav-bar-item__label {
    font-family: 'Pretendard Variable', sans-serif;
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1rem;
    letter-spacing: 0.031rem;
    color: var(--mdc-theme-on-surface-variant);
  }

  :global(.mdc-nav-rail-item--selected) .mdc-nav-bar-item__label {
    color: var(--mdc-theme-on-surface);
  }
</style>
