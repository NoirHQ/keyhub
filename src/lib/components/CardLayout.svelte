<script>
  export let divider = true;
  export let width = 450;
  export let height = 500;
  let innerWidth = 0;

  let style = '';
  $: style =
    innerWidth < 600
      ? ''
      : (width > 0 ? `width: ${width}px;` : '') + (height > 0 ? `height: ${height}px;` : '');
</script>

<svelte:window bind:innerWidth />

<div class="main">
  <div class="card" {style}>
    <div class="card-header" style={divider ? '' : 'border-bottom: none;'}>
      <slot name="header" />
    </div>
    <div class="card-body">
      <slot />
    </div>
  </div>
</div>

<style>
  .main {
    width: 100%;
    height: 100%;
    background: var(--mdc-theme-surface, #f3f3f8);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .card {
    display: flex;
    flex-direction: column;
    color: var(--mdc-theme-on-background, #5f6368);
  }

  .card-header {
    background: var(--mdc-theme-background, #fff);
    font-size: 0.875rem;
    border: 1px solid var(--mdc-theme-outline, #d2d2d7);
    border-radius: 12px 12px 0 0;
  }

  .card-body {
    background: var(--mdc-theme-background, #fff);
    border: 1px solid var(--mdc-theme-outline, #d2d2d7);
    border-top: none;
    border-radius: 0 0 12px 12px;
    flex-grow: 1;

    display: flex;
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }

  @media screen and (max-width: 599px) {
    .card {
      width: 100%;
      height: 100%;
    }

    .card-header {
      border: none;
      border-bottom: 1px solid var(--mdc-theme-outline, #d2d2d7);
      border-radius: 0;
    }

    .card-body {
      border: none;
      border-radius: 0;
    }
  }
</style>
