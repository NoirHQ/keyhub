<script lang="ts">
  import { get } from '@github/webauthn-json';
  import { Label } from '@smui/button';
  import Checkbox from '@smui/checkbox';
  import FormField from '@smui/form-field';
  import Textfield from '@smui/textfield';
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';
  import { goto } from '$app/navigation';
  import { Alert, CardLayout } from '$lib/components';
  import Button from '$lib/ui/button';
  import { ThemeColor } from '$lib/ui/theme';

  export let data;

  let alert: Alert;
  let info: Alert;

  onMount(() => {
    if (data.context === 'signup') {
      info.setMessage($_('page.login.signup_success'));
      info.open();
    }
  });

  async function authenticate(e) {
    if (data.auth === 'error') {
      alert.setMessage($_('errors.invalid_access'));
      alert.open();
      return;
    }

    try {
      if (!data.username || data.username.length === 0) {
        alert.setMessage($_('errors.email_required'));
        alert.open();
        return;
      }

      if (
        !data.username.match(
          /^(\w+(-\w+)*)+(\.\w+(-\w+)*)*@(\w+(-\w+)*)+(\.\w+(-\w+)*)*\.\w{2,12}$/
        )
      ) {
        alert.setMessage($_('errors.invalid_email_format'));
        alert.open();
        return;
      }

      let res = await fetch(`/api/v1/webauthn/authentication/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: data.username
        }),
        mode: 'cors'
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message, { cause: error.code });
      }
      const { publicKey } = await res.json();
      const assertion = await get({ publicKey });

      res = await fetch('/api/v1/webauthn/authentication/finish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assertion),
        mode: 'cors'
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message, { cause: error.code });
      }

      if (data.rememberme && data.username.length > 0) {
        localStorage.setItem('username', data.username);
      } else {
        localStorage.removeItem('username');
      }

      if (data.auth === 'oauth2') {
        e.target.submit();
      } else {
        localStorage.setItem('needload', 'true');
        goto('/');
      }
    } catch (err) {
      if (err.cause === 'NOT_EXIST_USER_ERROR') {
        alert.setMessage($_('errors.email_not_found'));
      } else {
        alert.setMessage($_('errors.login_failed'));
      }
      alert.open();
    }
  }

  function getHost(url) {
    try {
      return new URL(url).host;
    } catch (e) {
      return url;
    }
  }
</script>

<ThemeColor />

<CardLayout>
  <div slot="header" style="padding: 11px 16px;">
    {$_('page.login.preheader')}
  </div>

  <div class="card-body-inner">
    <span class="h1" style="padding-top: 8px;">{$_('page.login.header')}</span>
    <span style="padding-top: 12px;">
      {#if data.oauth2}{$_('page.login.subheader', {
          values: { target: getHost(data.oauth2.homepageUrl) }
        })}{/if}
    </span>
    <form
      on:submit|preventDefault={authenticate}
      action={data.links.login}
      class="form"
      style="padding-top: 24px;"
      method="POST"
    >
      <Textfield
        bind:value={data.username}
        label={$_('common.email')}
        type="email"
        variant="outlined"
      />
      <FormField style="padding-top: 6px;">
        <Checkbox bind:checked={data.rememberme} />
        <span slot="label">{$_('page.login.rememberme')}</span>
      </FormField>
      <div class="guide-box">{$_('page.login.description')}</div>
      <div class="button-box">
        <Button href={data.links.signup} style="margin-left: -12px"
          ><Label>{$_('page.login.signup')}</Label></Button
        >
        <Button type="submit" variant="filled">
          <Label>{$_('common.next')}</Label>
        </Button>
      </div>
    </form>
  </div>
</CardLayout>

<Alert bind:this={alert} variant="error" />
<Alert bind:this={info} variant="success" />

<style>
  .card-body-inner {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding: 40px;
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

  .guide-box {
    margin-top: 38px;
    color: var(--mdc-theme-on-surface-variant, #5f6368);
    font-size: 0.875rem;
    text-align: left;
    line-height: 1.5;
  }

  .button-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 35px;
    font-size: 0.9375rem;
  }
</style>
