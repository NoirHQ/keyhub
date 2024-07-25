<script lang="ts">
  import type { Account, Key } from '$lib/types';
  import { ApiPromise, WebAuthnSigner, WsProvider } from '@pinot/api';
  import { bnToBn } from '@pinot/util';
  import { onMount, onDestroy } from 'svelte';
  import Layout from './Layout.svelte';
  import { goto } from '$app/navigation';
  import { Entry, Id, Settings, Wallet } from '$lib/pages';
  import { path } from '$lib/stores';
  import { timestamp } from '$lib/utils';

  export let data;

  let api: ApiPromise;

  let accounts: Account[] = [];
  let balances: string[] = [];
  let keys: Key[] = [];
  let signers: WebAuthnSigner[] = [];
  let unsubs = [];

  const TEN_TRILLION = bnToBn('100000000000000');

  onMount(async () => {
    const cachedKeys = localStorage.getItem('keys');
    if (cachedKeys) {
      keys = JSON.parse(cachedKeys);
    }

    const cachedAccounts = localStorage.getItem('accounts');
    if (cachedAccounts) {
      accounts = JSON.parse(cachedAccounts);
    } else if (!localStorage.getItem('needload') && !keys.length) {
      goto('/?path=/entry');
    }

    if (localStorage.getItem('needload')) {
      localStorage.removeItem('needload');

      let res = await fetch('/api/v1/users/me/keys', {
        method: 'GET'
      });
      if (res.ok) {
        keys = await res.json();
        const publicKey = keys.find((k: Key) => k.is_primary)?.public_key;
        cacheKeys(true);

        if (publicKey && accounts.find((acc) => acc.publicKey === publicKey) === undefined) {
          res = await fetch(`/api/v1/webauthn/credentials/key/${publicKey}`, {
            method: 'GET'
          });
          if (res.ok) {
            const credentialId = await res.text();
            accounts = [
              ...accounts,
              {
                publicKey,
                credentialId
              }
            ];
            cacheAccounts();
          }
        }
      }
    }

    if (!api) {
      const provider = new WsProvider(data.endpoint);
      api = await ApiPromise.create({ provider });
    }

    for (let i = 0; i < accounts.length; i++) {
      const acc = accounts[i];
      signers.push(new WebAuthnSigner(api.registry, acc.credentialId, acc.publicKey));
      // TODO we don't need to convert address to u8a after @pinot/api@0.2
      const addressRaw = api.registry.createType('AccountId', acc.publicKey).toU8a();
      balances.push('-');
      unsubs.push(
        await api.query.system.account(addressRaw, ({ data: { free } }) => {
          balances[i] = (
            parseInt(bnToBn(free.toHex()).div(TEN_TRILLION).toString()) / 10000
          ).toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
        })
      );
    }
  });

  onDestroy(() => {
    unsubs.forEach((unsub) => unsub());
  });

  function cacheAccounts() {
    if (accounts.length > 0) {
      localStorage.setItem('accounts', JSON.stringify(accounts));
    } else {
      localStorage.removeItem('accounts');
    }
  }

  function removeAccount(index: number) {
    accounts = [...accounts.slice(0, index), ...accounts.slice(index + 1)];
    balances = [...balances.slice(0, index), ...balances.slice(index + 1)];
    unsubs[index]();
    unsubs = [...unsubs.slice(0, index), ...unsubs.slice(index + 1)];
    signers = [...signers.slice(0, index), ...signers.slice(index + 1)];
    cacheAccounts();
  }

  function cacheKeys(sort = false) {
    if (sort) {
      keys.sort((a, b) => {
        if (a.is_primary) return -1;
        if (b.is_primary) return 1;
        return timestamp(a.created_at) - timestamp(b.created_at);
      });
    }
    localStorage.setItem('keys', JSON.stringify(keys));
  }
</script>

<svelte:head>
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.json" />
</svelte:head>

<Layout>
  {#if $path.startsWith('/wallet')}
    <Wallet {api} {accounts} {balances} {signers} {removeAccount} data={data?.wallet} />
  {:else if $path.startsWith('/id')}
    <Id {keys} />
  {:else}
    <div class="content-wrapper">
      <div class="content">
        {#if $path.startsWith('/entry')}
          <Entry />
        {:else if $path.startsWith('/settings')}
          <Settings />
        {/if}
      </div>
    </div>
  {/if}
</Layout>

<style>
  .content-wrapper {
    width: 100%;
    height: 100%;
    overflow: auto;
    z-index: 10;
    flex-grow: 1;
  }

  .content {
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }
</style>
