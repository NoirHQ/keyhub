<script lang="ts">
  import type { Key } from '$lib/types';
  import { create } from '@github/webauthn-json';
  import Button, { Label } from '@smui/button';
  import Checkbox from '@smui/checkbox';
  import Dialog, { Title, Content, Actions, InitialFocus } from '@smui/dialog';
  import Fab from '@smui/fab';
  import FormField from '@smui/form-field';
  import Textfield from '@smui/textfield';
  import { _ } from 'svelte-i18n';
  import { goto } from '$app/navigation';
  import { Alert } from '$lib/components';
  import Icon from '$lib/ui/icon';
  import { timestamp } from '$lib/utils';

  export let keys: Key[];
  let alias = '';
  let useSecurityKey = false;
  let optionToggle = false;

  let alert: Alert;
  let dialog: Dialog;

  function toggleOption() {
    optionToggle = !optionToggle;
  }

  async function addPasskey() {
    let res = await fetch(`/api/v1/users/me/keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        alias,
        requireResidentKey: !useSecurityKey
      }),
      mode: 'cors'
    });
    if (!res.ok) {
      if (res.status === 401) {
        goto('/login');
      } else {
        const error = await res.json();
        alert.setMessage(error.message);
        return alert.open();
      }
    }

    const { publicKey } = await res.json();
    const attestation = await create({ publicKey });

    res = await fetch('/api/v1/users/me/keys', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(attestation),
      mode: 'cors'
    });
    if (!res.ok) {
      const error = await res.json();
      alert.setMessage(error.message);
      return alert.open();
    }

    res = await fetch('/api/v1/users/me/keys');
    if (!res.ok) {
      const error = await res.json();
      alert.setMessage(error.message);
      return alert.open();
    }
    keys = await res.json();
    keys.sort((a, b) => {
      if (a.is_primary) return -1;
      if (b.is_primary) return 1;
      return timestamp(a.created_at) - timestamp(b.created_at);
    });
  }

  function toLocaleString(date) {
    return date ? new Date(date).toLocaleString() : 'N/A';
  }
</script>

<div class="content-viewport">
  <Fab class="fab" on:click={() => dialog.setOpen(true)}>
    <Icon smui="common" name="add" variant="rounded" />
  </Fab>
</div>
<div class="content-wrapper">
  <div class="content">
    <div class="id-container">
      <div class="header">
        <span style="margin-left: 15px;">{$_(`page.main.menu.id`)}</span>
      </div>
      <div class="card-container">
        {#each keys as key}
          <div class="card">
            <div class="key-container">
              {key.public_key}
            </div>
            <div class="key-desc">
              <div class="key-content-name">
                {key.alias ?? $_('page.main.id.primary_key')}
              </div>
              <div class="key-content-sub-container">
                <div class="key-content-sub">
                  {$_('page.main.id.created_at')}
                  {toLocaleString(key.created_at)}
                </div>
                <div class="key-content-sub">
                  {$_('page.main.id.last_used_at')}
                  {toLocaleString(key.last_used_at)}
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
  <Alert bind:this={alert} variant="error" />

  <!-- XXX inaccessible when putting this outside of content-wrapper, check it later -->
  <Dialog bind:this={dialog}>
    <Title>{$_('page.main.id.new_passkey')}</Title>
    <Content>
      <div>{$_('page.main.id.set_passkey_name')}</div>
      <Textfield label={$_('page.main.id.passkey_name')} bind:value={alias} style="width: 100%;" />
      <button class="option-toggle" on:click={toggleOption}>
        {$_('page.signup.advanced_options')}
        <Icon
          name="keyboard_arrow_right"
          variant="rounded"
          style="font-size: 13px; vertical-align: middle;"
        />
      </button>
      <FormField style={optionToggle ? '' : 'visibility: hidden;'}>
        <Checkbox bind:checked={useSecurityKey} />
        <span slot="label">{$_('page.signup.use_security_key')}</span>
      </FormField>
    </Content>
    <Actions>
      <Button>
        <Label>{$_('common.cancel')}</Label>
      </Button>
      <Button on:click={addPasskey} use={[InitialFocus]}>
        <Label>{$_('common.confirm')}</Label>
      </Button>
    </Actions>
  </Dialog>
</div>

<style lang="scss">
  @use '$lib/ui/m3/typography' as typography;

  .content-wrapper {
    height: 100%;
    overflow: auto;
    z-index: 10;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .content {
    width: 100%;
    max-width: 600px;
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }

  .content-viewport {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  :global(.fab) {
    position: absolute;
    right: 16px;
    bottom: 16px;
    z-index: 1050;
  }

  .id-container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    flex-grow: 1;
    width: calc(100% - 30px);
    max-width: 600px;
    align-self: center;
  }

  .id-container .header {
    @include typography.headline-medium;

    display: flex;
    align-items: center;
    margin: 24px 0;

    :global(span) {
      line-height: 54px;
    }
  }

  .card-container {
    display: flex;
    flex-direction: column;
    row-gap: 8px;
    padding: 0 15px;
  }

  .card {
    box-sizing: border-box;
    width: 540px;
    aspect-ratio: 1.618;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    border: none;
    border-radius: 12px;
    align-self: center;
    background: var(--mdc-theme-secondary-container);
    color: var(--mdc-theme-on-secondary-container);
    box-sizing: border-box;
  }

  .key-desc {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    padding: 32px;
  }

  .key-container {
    @include typography.body-medium;
    display: flex;
    align-items: center;
    margin-top: 24px;
    height: 40px;
    align-self: stretch;
    font-family: 'Roboto Mono', monospace;
    background-color: var(--mdc-theme-surface-container-highest);
    color: var(--mdc-theme-on-surface);
    opacity: 0.7;
    word-break: break-all;
    padding: 0 16px;
  }

  .key-content-name {
    font-weight: 500;
  }

  .key-content-sub-container {
    margin-top: 8px;
    display: flex;
    column-gap: 8px;
  }

  .key-content-sub {
    font-size: 0.75rem;
    color: var(--mdc-theme-on-surface-variant, #999);
  }

  .option-toggle {
    border: none;
    background-color: var(--mdc-theme-surface-container-high);
    color: var(--mdc-theme-on-surface);
  }

  @media (max-width: 599px) {
    .content-viewport {
      height: calc(100% - 80px);
    }

    .card {
      width: calc(100vw - 60px);
    }

    .key-container {
      @include typography.body-small;
      padding: 0 8px;
    }

    .key-desc {
      padding: 16px;
    }
  }
</style>
