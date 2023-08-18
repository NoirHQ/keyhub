<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { goto } from '$app/navigation';
  import KeyhubLogo from '$lib/assets/keyhub-logo.svg';
  import Card, { Content } from '$lib/ui/card';
  import Icon from '$lib/ui/icon';
</script>

<div class="entry-container">
  <div class="entry-description">
    <img class="logo" src={KeyhubLogo} alt="Keyhub" />
    <span style="margin-top: 8px; text-align: center;">{$_('page.main.entry.header')}</span>
  </div>
  <Card variant="filled" class="login-action card" on:click={() => goto('/login')}>
    <Content>
      <div class="card-action">
        <div class="card-action__label">
          <span>{$_('common.login')}</span>
          <span>Load the keys you own</span>
        </div>
        <div class="card-action__icon">
          <Icon name="keyboard_arrow_right" variant="rounded" />
        </div>
      </div>
    </Content>
  </Card>
  <Card variant="filled" class="card" style="margin-top: 8px;" on:click={() => goto('/signup')}>
    <Content>
      <div class="card-action">
        <div class="card-action__label">
          <span>{$_('common.signup')}</span>
          <span>Create new Keyhub account</span>
        </div>
        <div class="card-action__icon">
          <Icon name="keyboard_arrow_right" variant="rounded" />
        </div>
      </div>
    </Content>
  </Card>
</div>

<style lang="scss">
  .entry-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    flex-grow: 1;
    padding: 128px 15px;
    width: calc(100% - 30px);
    max-width: 600px;
    align-self: center;
  }

  .entry-description {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .logo {
    width: 150px;
    margin-bottom: 1.25rem;
  }

  :global(body[data-theme='dark'] .logo) {
    filter: brightness(0) invert(1);
  }

  :global(.mdc-card.login-action) {
    margin-top: 64px;
    background-color: var(--mdc-theme-primary);
    color: var(--mdc-theme-on-primary);
  }

  .entry-container :global(.card:hover) {
    cursor: pointer;
  }

  .card-action {
    display: flex;
    align-items: center;
  }

  .card-action__label {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    row-gap: 8px;
  }

  .card-action__label span:nth-child(1) {
    font-weight: 600;
  }

  .card-action__label span:nth-child(2) {
    font-size: 0.75rem;
  }

  @media (max-width: 599px) {
    .entry-container {
      width: unset;
      max-width: unset;
      align-self: unset;
      padding: 64px 30px;
    }
  }
</style>
