<script lang="ts">
  import type { ActionArray } from '@smui/common/internal';
  import Card from '@smui/card';
  import { classMap, forwardEventsBuilder } from '@smui/common/internal';
  import Ripple from '@smui/ripple';
  import { get_current_component } from 'svelte/internal';

  const forwardEvents = forwardEventsBuilder(get_current_component());

  export let use: ActionArray = [];
  export let variant: 'elevated' | 'filled' | 'outlined' = 'filled';
  export let ripple = true;
  export let interactive = true;

  let className = '';
  export { className as class };

  let component: Card;
</script>

<Card
  bind:this={component}
  use={[forwardEvents, ...use]}
  class={classMap({
    [className]: true,
    'mdc-card--elevated': variant === 'elevated',
    'mdc-card--filled': variant === 'filled',
    'mdc-card--outlined': variant === 'outlined'
  })}
  variant={variant === 'outlined' ? 'outlined' : undefined}
  {...$$restProps}
>
  <div
    class="ripple"
    use:Ripple={{ eventTarget: component?.getElement(), ripple, surface: true }}
  />
  <div class="elevation" class:interactive />
  <div class="state-layer" />
  <slot />
</Card>

<style lang="scss">
  @use '../m3/elevation' as elevation;

  :global(.mdc-card) {
    box-shadow: unset;
    box-sizing: border-box;
    border-radius: 12px;
  }

  :global(.mdc-card.mdc-card--elevated) {
    background-color: var(--mdc-theme-surface-container-low);
  }

  :global(.mdc-card.mdc-card--filled) {
    background-color: var(--mdc-theme-surface-container-highest);
  }

  :global(.mdc-card.mdc-card--outlined) {
    background-color: var(--mdc-theme-surface);
    border: 1px solid var(--mdc-theme-outline);
  }

  .ripple {
    position: absolute;
    box-sizing: content-box;
    inset: 0;
    border-radius: inherit;
    overflow: hidden;
    pointer-events: none;
  }

  .elevation {
    @include elevation.element();
  }

  :global(.mdc-card--elevated:hover) .elevation.interactive {
    @include elevation.elevation(2);
  }

  :global(.mdc-card--elevated) .elevation,
  :global(.mdc-card--elevated:active) .elevation.interactive {
    @include elevation.elevation(1);
  }

  :global(.mdc-card--filled:hover) .elevation.interactive {
    @include elevation.elevation(1);
  }

  :global(.mdc-card--filled) .elevation,
  :global(.mdc-card--filled:active) .elevation.interactive {
    @include elevation.elevation(0);
  }

  :global(.mdc-card--outlined:hover) .elevation.interactive {
    @include elevation.elevation(1);
  }

  :global(.mdc-card--outlined) .elevation,
  :global(.mdc-card--outlined:active) .elevation.interactive {
    @include elevation.elevation(0);
  }

  .state-layer {
    position: absolute;
    box-sizing: content-box;
    inset: 0;
    border-radius: inherit;
    overflow: hidden;
    pointer-events: none;
  }

  :global(.mdc-card--filled:hover) .state-layer,
  :global(.mdc-card--outlined:hover) .state-layer {
    background-color: var(--mdc-theme-on-surface);
    opacity: 0.08;
  }

  :global(.mdc-card--filled:active) .state-layer,
  :global(.mdc-card--filled:focus) .state-layer,
  :global(.mdc-card--outlined:active) .state-layer,
  :global(.mdc-card--outlined:focus) .state-layer {
    background-color: var(--mdc-theme-on-surface);
    opacity: 0.12;
  }
</style>
