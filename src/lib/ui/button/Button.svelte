<script lang="ts">
  import type { ActionArray } from '@smui/common/internal';
  import Button from '@smui/button';
  import { classMap, forwardEventsBuilder } from '@smui/common/internal';
  import { get_current_component } from 'svelte/internal';

  const forwardEvents = forwardEventsBuilder(get_current_component());

  export let use: ActionArray = [];
  export let variant: 'elevated' | 'filled' | 'tonal' | 'outlined' | 'text' = 'text';

  let className = '';
  export { className as class };
</script>

<Button
  use={[forwardEvents, ...use]}
  class={classMap({
    [className]: true,
    'mdc-button--elevated': variant === 'elevated',
    'mdc-button--filled': variant === 'filled',
    'mdc-button--tonal': variant === 'tonal'
  })}
  variant={variant === 'outlined' ? 'outlined' : 'text'}
  on:click
  {...$$restProps}
>
  <div class="elevation" />
  <slot />
</Button>

<style lang="scss">
  @use '../m3/elevation' as elevation;

  :global(.mdc-button) {
    --mdc-text-button-hover-state-layer-color: var(--mdc-theme-primary);
    --mdc-text-button-hover-state-layer-opacity: 0.08;
    --mdc-text-button-focus-state-layer-opacity: 0.12;
    --mdc-text-button-pressed-state-layer-opacity: 0.12;
    --mdc-text-button-container-height: 40px;
    --mdc-text-button-container-shape: 9999px;
    --mdc-text-button-label-text-tracking: 0.006rem;
    --mdc-text-button-label-text-weight: 500;

    padding: 0 12px;
    position: relative;
    transition-duration: 280ms;

    color: var(--mdc-theme-primary);
  }

  :global(.mdc-button__label) {
    color: var(--mdc-theme-primary);
    text-transform: none;
  }

  :global(.mdc-button.mdc-button--elevated) {
    --mdc-text-button-hover-state-layer-color: var(--mdc-theme-primary);

    background-color: var(--mdc-theme-surface-container-low);
    padding: 0 24px;
  }

  :global(.mdc-button--elevated > .mdc-button__label) {
    color: var(--mdc-theme-primary);
  }

  :global(.mdc-button.mdc-button--filled) {
    --mdc-text-button-hover-state-layer-color: var(--mdc-theme-on-primary);

    background-color: var(--mdc-theme-primary);
    padding: 0 24px;
  }

  :global(.mdc-button--filled > .mdc-button__label) {
    color: var(--mdc-theme-on-primary);
  }

  :global(.mdc-button.mdc-button--tonal) {
    --mdc-text-button-hover-state-layer-color: var(--mdc-theme-on-secondary-container);

    background-color: var(--mdc-theme-secondary-container);
    padding: 0 24px;
  }

  :global(.mdc-button--tonal > .mdc-button__label) {
    color: var(--mdc-theme-on-secondary-container);
  }

  :global(.mdc-button.mdc-button--outlined) {
    --mdc-outlined-button-hover-state-layer-color: var(--mdc-theme-primary);
    --mdc-outlined-button-hover-state-layer-opacity: 0.08;
    --mdc-outlined-button-focus-state-layer-opacity: 0.12;
    --mdc-outlined-button-pressed-state-layer-opacity: 0.12;
    --mdc-outlined-button-container-height: 40px;
    --mdc-outlined-button-container-shape: 9999px;
    --mdc-outlined-button-label-text-tracking: 0.006rem;
    --mdc-outlined-button-label-text-weight: 500;

    padding: 0 24px;
    border: 1px solid var(--mdc-theme-outline);
  }

  :global(.mdc-button--outlined > .mdc-button__label) {
    color: var(--mdc-theme-primary);
  }

  .elevation {
    @include elevation.element();
  }

  :global(.mdc-button--elevated:hover) .elevation {
    @include elevation.elevation(2);
  }

  :global(.mdc-button--elevated:active) .elevation {
    @include elevation.elevation(1);
  }

  :global(.mdc-button--elevated:disabled) .elevation {
    @include elevation.elevation(0);
  }

  :global(.mdc-button--filled:hover) .elevation,
  :global(.mdc-button--tonal:hover) .elevation {
    @include elevation.elevation(1);
  }

  :global(.mdc-button--filled:active) .elevation,
  :global(.mdc-button--tonal:active) .elevation {
    @include elevation.elevation(0);
  }
</style>
