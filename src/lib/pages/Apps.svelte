<script lang="ts">
  import { _ } from 'svelte-i18n';
  import Cpunks from '$lib/assets/third_party/cpunks.png';
  import MPOverflow from '$lib/assets/third_party/mpoverflow.png';

  let apps = [
    {
      name: 'MPOverflow',
      url: 'https://mpoverflow.com',
      dev: 'https://dev.mpoverflow.com',
      image: MPOverflow,
      description: $_('page.logged_in.apps.mpoverflow')
    },
    {
      name: 'Cypherpunks',
      url: 'https://cpunks.xyz',
      dev: 'https://dev.cpunks.xyz',
      image: Cpunks,
      description: $_('page.logged_in.apps.cpunks')
    }
  ];
</script>

<div class="apps-container">
  <div class="header">
    <span style="margin-left: 15px;">{$_(`page.main.menu.apps`)}</span>
  </div>
  <div class="content">
    {#each apps as app, i}
      <a
        class="content-item"
        href={import.meta.env.DEV ? app.dev : app.url}
        style={`grid-column: ${(i % 4) + 1}; grid-row: ${Math.floor(i / 4) + 1};`}
        target="_blank"
      >
        <div class="content-item__icon">
          <img src={app.image} alt={app.name} />
        </div>
        <span>{app.name}</span>
      </a>
    {/each}
  </div>
</div>

<style lang="scss">
  @use '$lib/ui/m3/typography' as typography;

  .apps-container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    flex-grow: 1;
    width: calc(100% - 30px);
    max-width: 600px;
    align-self: center;
  }

  .apps-container .header {
    @include typography.headline-medium;

    display: flex;
    align-items: center;
    margin: 24px 0;

    :global(span) {
      line-height: 54px;
    }
  }

  .apps-container .content {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }

  .content-item {
    @include typography.body-medium;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 24px 0px;
    row-gap: 16px;
    color: var(--mdc-theme-on-background);
  }

  .content-item__icon {
    display: flex;
    justify-content: center;
  }

  .content-item__icon img {
    width: 50px;
  }

  body[data-theme='light'] .content-item__icon img {
    filter: invert(1);
  }

  @media (max-width: 599px) {
    .content-item {
      @include typography.body-small;
    }
  }
</style>
