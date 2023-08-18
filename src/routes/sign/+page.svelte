<script lang="ts">
  import { ApiPromise, WsProvider, WebAuthnSigner } from '@pinot/api';
  import Dialog, { Content, InitialFocus, Actions } from '@smui/dialog';
  import { _ } from 'svelte-i18n';
  import { Alert, CardLayout } from '$lib/components';
  import Button, { Label } from '$lib/ui/button';

  export let data;

  let alert: Alert;
  let dialog: {
    inner?: Dialog;
    message: string;
  } = {
    message: ''
  };

  async function singAndSend() {
    if (data) {
      const provider = new WsProvider(data.endpoint);
      const api = await ApiPromise.create({ provider });
      let txExecute;
      if (data.params) {
        const params = data.params.split(',');
        txExecute = api.tx[data.palletRpc][data.callable](...params);
      } else {
        txExecute = api.tx[data.palletRpc][data.callable]();
      }
      const res = await fetch(`/api/v1/webauthn/credentials/key/${data.account}`, {
        method: 'GET'
      });
      if (!res.ok) {
        const error = await res.json();
        alert.setMessage($_('errors.lookup_credential_failed'));
        alert.open();
        throw new Error(error.message, { cause: error.code });
      }
      const credentialId = await res.text();
      const signer = new WebAuthnSigner(api.registry, credentialId, data.account);

      const txResult = await txExecute.signAndSend(signer.address, {
        signer
      });
      dialog.message = $_('page.sign.message', { values: { hash: txResult.toHuman() } });
      dialog.inner?.setOpen(true);
    }
  }
</script>

<CardLayout width={-1} height={-1}>
  <div slot="header" style="padding: 11px 16px;">
    {$_('page.sign.preheader')}
  </div>

  <div class="card-body-inner">
    <span class="h1">{$_('page.sign.header')}</span>
    <span style="padding-top: 12px;">{$_('page.sign.subheader')}</span>
    <div class="table-container">
      <table class="table-frame">
        <tbody class="table-body">
          <tr>
            <th class="table-header" style="border-top-left-radius: 24px;"
              >{$_('page.sign.chain')}</th
            >
            <td class="table-data">
              <pre class="table-contents">
                {data.endpoint}
              </pre>
            </td>
          </tr>
          <tr>
            <th class="table-header">{$_('page.sign.account')}</th>
            <td class="table-data">
              <pre class="table-contents">
                {data.account}
              </pre>
            </td>
          </tr>
          <tr>
            <th class="table-header">{$_('page.sign.rpc')}</th>
            <td class="table-data">
              <pre class="table-contents">
                {data.palletRpc}
              </pre>
            </td>
          </tr>
          <tr>
            <th class="table-header">{$_('page.sign.call')}</th>
            <td class="table-data">
              <pre class="table-contents">
                {data.callable}
              </pre>
            </td>
          </tr>
          <tr>
            <th class="table-header" style="border-bottom-left-radius: 24px;"
              >{$_('page.sign.params')}</th
            >
            <td class="table-data">
              <pre class="table-contents">
                {data.params ? JSON.stringify(data.params.split(','), null, 2) : ''}
              </pre>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="button-box">
      <Button variant="filled" on:click={singAndSend}>
        <Label>{$_('common.next')}</Label>
      </Button>
    </div>
  </div>
</CardLayout>

<Dialog bind:this={dialog.inner}>
  <Content style="line-height: 2;">
    {dialog.message}
  </Content>
  <Actions>
    <Button
      on:click={() => {
        dialog.inner.setOpen(false);
        window.close();
      }}
      use={[InitialFocus]}
    >
      <Label>{$_('common.confirm')}</Label>
    </Button>
  </Actions>
</Dialog>
<Alert bind:this={alert} variant="error" />

<style>
  .card-body-inner {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding: 40px;
  }

  .h1 {
    font-size: 1.5rem;
    padding-top: 8px;
  }

  .table-container {
    margin-top: 24px;
    border: 1px solid var(--mdc-theme-surface-variant);
    border-radius: 24px;
  }

  .table-frame {
    width: 100%;
    border-collapse: collapse;
    border-radius: 24px;
    border-style: hidden;
  }

  .table-header {
    text-align: left;
    padding: 0.78571429em;
    border: 1px solid var(--mdc-theme-surface-variant, #d2d2d7);
    background-color: var(--mdc-theme-surface-container-low, #f3f3f8);
    color: var(--mdc-theme-on-surface-variant);
    font-size: 0.875em;
    font-weight: 500;
  }

  .table-data {
    text-align: left;
    padding: 0.78571429rem;
    border: 1px solid var(--mdc-theme-surface-variant, #d2d2d7);
    word-break: break-all;
  }

  .table-contents {
    white-space: pre-line;
    word-break: break-all;
  }

  .button-box {
    display: flex;
    justify-content: end;
    align-items: center;
    padding-top: 35px;
    font-size: 0.9375rem;
  }

  @media screen and (max-width: 599px) {
    .card-body-inner {
      padding: 40px 20px;
    }
  }
</style>
