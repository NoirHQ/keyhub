<script lang="ts">
  import type { Theme } from '$lib/ui/theme';
  import type { Writable } from 'svelte/store';
  import { create } from '@github/webauthn-json';
  import { Label } from '@smui/button';
  import Checkbox from '@smui/checkbox';
  import Dialog, { Content, Actions, InitialFocus } from '@smui/dialog';
  import FormField from '@smui/form-field';
  import Textfield from '@smui/textfield';
  import { getContext, onMount } from 'svelte';
  import { _ } from 'svelte-i18n';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Logo from '$lib/assets/keyhub-logo.svg';
  import { Alert, CardLayout } from '$lib/components';
  import Button from '$lib/ui/button';
  import Icon from '$lib/ui/icon';
  import { ThemeColor } from '$lib/ui/theme';

  export let data;

  const theme: Writable<Theme> = getContext('theme');
  $: logoFilter =
    $theme?.mode === 'light'
      ? ''
      : 'filter: invert(100%) sepia(37%) saturate(378%) hue-rotate(180deg) brightness(95%) contrast(88%);';

  let isRecommended = true;
  let redirectUri = '/login';
  let optionToggle = false;

  function toggleOption() {
    optionToggle = !optionToggle;
  }

  onMount(() => {
    if (
      !(
        navigator.userAgent.includes('Android') ||
        navigator.userAgent.includes('iPhone') ||
        navigator.userAgent.includes('iPad')
      )
    ) {
      isRecommended = false;
    } else if (
      !(navigator.userAgent.includes('Chrome') || navigator.userAgent.includes('Safari'))
    ) {
      isRecommended = false;
    }

    if (data.continue) {
      redirectUri = decodeURIComponent(data.continue);
    }
  });

  let alert: Alert;
  let info: Alert;

  interface ButtonInfo {
    label: string;
    action: () => void;
  }

  const dialog: {
    inner?: Dialog;
    closeAction: string | undefined;
    message: string | undefined;
    showButtons: boolean;
    buttons: ButtonInfo[];
    confirmButton: ButtonInfo;
  } = {
    closeAction: 'close',
    message: '',
    showButtons: true,
    buttons: [],
    confirmButton: {
      label: $_('common.confirm'),
      action: () => dialog.inner?.setOpen(false)
    }
  };

  async function confirm() {
    dialog.closeAction = 'close';
    dialog.showButtons = true;

    if (!data.username || data.username.length === 0) {
      alert.setMessage($_('errors.email_required'));
      alert.open();
    } else if (
      !data.username.match(/^(\w+(-\w+)*)+(\.\w+(-\w+)*)*@(\w+(-\w+)*)+(\.\w+(-\w+)*)*\.\w{2,12}$/)
    ) {
      alert.setMessage($_('errors.invalid_email_format'));
      alert.open();
    } else {
      if ($page.url.hostname.endsWith('localhost')) {
        data.verified = true;
        return;
      }

      dialog.message = $_('page.signup.confirm_username', { values: { username: data.username } });
      dialog.buttons = [
        {
          label: $_('common.cancel'),
          action: () => dialog.inner?.setOpen(false)
        }
      ];
      dialog.confirmButton = {
        label: $_('common.confirm'),
        action: sendConfirm
      };
      dialog.inner?.setOpen(true);
    }
  }

  async function sendConfirm() {
    const res = await fetch(`/api/v1/authentication/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: data.username
      })
    });
    if (!res.ok) {
      alert.setMessage($_('errors.signup_request_failed'));
      if (res.status === 500) {
        const err = await res.json();
        if (err.code === 'EXIST_USER_ERROR') {
          alert.setMessage($_('errors.email_already_exists'));
        } else if (err.code === 'INVALID_REQUEST_ERROR') {
          alert.setMessage($_('errors.invalid_email_format'));
        }
      }
      alert.open();
      return;
    }

    dialog.closeAction = '';
    dialog.message = $_('page.signup.confirm_email_verification');
    dialog.confirmButton = {
      label: $_('page.signup.confirm_success'),
      action: async () => {
        const res = await fetch(`/api/v1/authentication/check/email/${data.username}`, {
          method: 'GET'
        });
        if (!res.ok || (await res.text()) !== 'true') {
          alert.setMessage($_('page.signup.confirm_failed'));
          alert.open();
          return;
        } else {
          data.verified = true;
          if (redirectUri.includes('?')) {
            redirectUri += `&username=${data.username}&context=signup`;
          } else {
            redirectUri += `?username=${data.username}&context=signup`;
          }
          dialog.inner?.setOpen(false);
        }
      }
    };
    dialog.buttons = [
      {
        label: $_('common.cancel'),
        action: () => dialog.inner?.setOpen(false)
        /*
    }, {
      label: '인증메일 재전송',
      action: () => dialog.close(),
    */
      }
    ];
    dialog.inner?.setOpen(true);
  }

  async function register() {
    try {
      let res = await fetch(`/api/v1/webauthn/registration/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: data.username,
          requireResidentKey: !data.useSecurityKey
        }),
        mode: 'cors'
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message, { cause: error.code });
      }
      const { publicKey } = await res.json();
      const attestation = await create({ publicKey });

      res = await fetch('/api/v1/webauthn/registration/finish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(attestation),
        mode: 'cors'
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message, { cause: error.code });
      }

      goto(redirectUri);
    } catch (err) {
      if (err.cause === 'EXIST_USER_ERROR') {
        alert.setMessage($_('errors.email_already_exists'));
      } else {
        alert.setMessage($_('page.signup.signup_failed'));
      }
      alert.open();
    }
  }

  function useSecurityKey() {
    info.setMessage($_('page.signup.use_security_key_description'));
    info.open();
  }
</script>

<ThemeColor />

<CardLayout divider={false}>
  <div slot="header" style="display: flex; justify-content: center;">
    <img src={Logo} alt="Keyhub" id="logo" style={logoFilter} />
  </div>

  <div class="card-body-inner">
    <span class="h1" style="padding-top: 8px;">{$_('page.signup.header')}</span>
    <span style="padding-top: 12px;">{$_('page.signup.subheader')}</span>
    <form
      on:submit|preventDefault={data.verified ? register : confirm}
      class="form"
      style="padding-top: 24px;"
    >
      <Textfield
        bind:value={data.username}
        label={$_('common.email')}
        type="email"
        variant="outlined"
        disabled={data.verified}
      />
      <button
        class="option-toggle"
        on:click={toggleOption}
        style={data.verified ? '' : 'visibility: hidden;'}
      >
        {$_('page.signup.advanced_options')}
        <Icon name="keyboard_arrow_down" variant="rounded" />
      </button>
      <div class="check-box" style={data.verified && optionToggle ? '' : 'visibility: hidden;'}>
        <FormField>
          <Checkbox bind:checked={data.useSecurityKey} />
          <span slot="label">{$_('page.signup.use_security_key')}</span>
        </FormField>
        <div class="check-box-suffix"><a href={'#'} on:click={useSecurityKey}>&#9432;</a></div>
      </div>
      <div class="guide-box">
        {#if !isRecommended}
          <span style="color: var(--mdc-theme-error, #f00);"
            >{$_('page.signup.description_not_mobile')}</span
          >
        {:else if !data.verified}
          {$_('page.signup.description_encrypted_email')}
        {:else}
          {$_('page.signup.description_confirm_next')}
        {/if}
      </div>
      <div class="button-box">
        <Button type="submit" class={data.verified ? 'filled' : 'tonal'}>
          <Label>{$_('common.next')}</Label>
        </Button>
      </div>
    </form>
  </div>
</CardLayout>

<Alert bind:this={alert} variant="error" />
<Alert bind:this={info} />

<Dialog
  bind:this={dialog.inner}
  escapeKeyAction={dialog.closeAction}
  scrimClickAction={dialog.closeAction}
>
  <Content style="line-height: 2;">
    {dialog.message}
  </Content>
  {#if dialog.showButtons}
    <Actions>
      {#each dialog.buttons as button}
        <Button on:click={button.action}>
          <Label>{button.label}</Label>
        </Button>
      {/each}
      <Button on:click$stopPropagation={dialog.confirmButton.action} use={[InitialFocus]}>
        <Label>{dialog.confirmButton.label}</Label>
      </Button>
    </Actions>
  {/if}
</Dialog>

<style>
  .card-body-inner {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding: 8px 40px 40px;
  }

  #logo {
    height: 24px;
    padding-top: 48px;
  }

  .h1 {
    font-size: 1.5rem;
  }

  .form {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .option-toggle {
    margin-top: 16px;
    align-self: start;
    border: none;
    background-color: var(--mdc-theme-background);
    color: var(--mdc-theme-on-background);
  }

  .check-box {
    display: flex;
    align-items: center;
  }

  .check-box-suffix {
    align-self: stretch;
  }

  .check-box-suffix a {
    height: 100%;
    display: flex;
    align-items: center;
    padding-left: 0.5rem;
    padding-right: 1rem;
    color: #5f6368;
    text-decoration: none !important;
  }

  .check-box-suffix:hover {
    text-decoration: none;
  }

  .guide-box {
    margin-top: 12px;
    color: #5f6368;
    font-size: 0.875rem;
    text-align: left;
    line-height: 1.5;
  }

  .button-box {
    display: flex;
    justify-content: end;
    align-items: center;
    padding-top: 35px;
    font-size: 0.9375rem;
  }
</style>
