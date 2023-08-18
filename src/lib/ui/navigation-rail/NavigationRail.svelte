<div class={`mdc-nav-rail`} {...$$props}>
  <slot />
</div>

<style>
  .mdc-nav-rail {
    width: 80px;
    background-color: var(--mdc-theme-surface);
    display: flex;
    flex-direction: column;
    align-items: stretch;
    height: 100%;
    row-gap: 12px;
    z-index: 1100;
  }
</style>
