<div class={`mdc-nav-bar`} {...$$props}>
  <slot />
</div>

<style>
  .mdc-nav-bar {
    height: 80px;
    background-color: var(--mdc-theme-surface);
    display: flex;
    justify-content: space-evenly;
    align-items: stretch;
    width: 100%;
    z-index: 1100;
  }
</style>
