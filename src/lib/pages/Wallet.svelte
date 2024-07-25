<script lang="ts">
  import '@splidejs/svelte-splide/css';

  import type { Account } from '$lib/types';
  import type { IconName } from '$lib/ui/icon';
  import type { ApiPromise, WebAuthnSigner } from '@pinot/api';
  import { bnToBn, hexToU8a, u8aConcat } from '@pinot/util';
  import { blake2AsU8a, encodeAddress } from '@polkadot/util-crypto';
  import Fab from '@smui/fab';
  import Textfield from '@smui/textfield';
  import { Splide, SplideSlide, SplideTrack } from '@splidejs/svelte-splide';
  import { Html5Qrcode } from 'html5-qrcode';
  import { onDestroy } from 'svelte';
  import { _ } from 'svelte-i18n';
  import QR from 'svelte-qr';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Button, { Label } from '$lib/ui/button';
  import Icon from '$lib/ui/icon';

  export let data: { to?: string; amount?: string } = {};

  let splide: Splide;
  let scanner: Html5Qrcode;
  let active = 0;

  export let api: ApiPromise;

  export let accounts: Account[];
  export let balances: string[];
  export let signers: WebAuthnSigner[];
  export let removeAccount: (index: number) => void;

  $: connected = !!api?.isConnected;
  $: showFab =
    (active !== accounts.length && ['', 'read'].includes(context)) ||
    (context === 'recv' && navigator?.share);

  // context: (empty) | read | send | recv | remv
  let context = data?.to ? 'send' : '';

  /**
   * Sets the current context of wallet page.
   *
   * @note This is different from `setContext` for svelte context.
   */
  function setContext(ctx: string) {
    if (splide) {
      splide.options = {
        drag: ctx === ''
      };
    }
    if (ctx !== 'read' && scanner?.getState() === 2) {
      scanner?.stop();
    }
    context = ctx;
  }

  let to = data?.to ?? '';
  let amount = data?.amount ?? '';

  const TEN_TRILLION = bnToBn('100000000000000');

  /**
   * onClick handler for confirm button in send page.
   */
  async function confirmTransfer() {
    let resolved = to;
    if (to.startsWith('0x')) {
      const address = await api.query.alias.accountIdOf({ EthereumAddress: to });
      if (!address || address.toHex() === '0x') {
        let u8a = blake2AsU8a(u8aConcat(Uint8Array.from([0x65, 0x76, 0x6d, 0x3a]), hexToU8a(to)));
        resolved = encodeAddress(u8a);
      } else {
        resolved = encodeAddress(address);
      }
    }
    await api.tx.balances
      .transferKeepAlive(
        resolved,
        bnToBn((parseFloat(amount) * 10000).toFixed(0))
          .mul(TEN_TRILLION)
          .toString()
      )
      .signAndSend(signers[active].address, { signer: signers[active] });
    to = '';
    amount = '';
    setContext('');
  }

  /**
   * onClick handler for cancel button in send page.
   */
  function cancelTransfer() {
    to = '';
    amount = '';
    setContext('');
  }

  onDestroy(() => {
    if (scanner && scanner.getState() === 2) {
      scanner.stop();
    }
  });

  const fab: {
    [key: string]: {
      icon: IconName;
      on: () => void;
    };
  } = {
    default: {
      icon: 'qr_code_scanner',
      on: () => {
        if (!scanner) {
          scanner = new Html5Qrcode('reader');
        }

        const onSuccess = (decodedText: string) => {
          if (decodedText.startsWith('ethereum:')) {
            to = decodedText.substring(9);
            setContext('send');
          } else {
            try {
              const url = new URL(decodedText);
              if (url.origin === $page.url.origin) {
                if (url.pathname === $page.url.pathname) {
                  to = url.searchParams.get('to') ?? '';
                  amount = url.searchParams.get('amount') ?? '';
                  setContext('send');
                } else {
                  goto(`${url.pathname}${url.search}`);
                }
              } /* else {
                window.location.href = decodedText;
              } */
            } catch (e) {
              console.error(e);
            }
          }
          scanner.stop();
        };
        const config = {
          fps: 10,
          qrbox: { width: 150, height: 150 },
          formatsToSupport: [0]
        };

        setContext('read');
        scanner.start({ facingMode: 'environment' }, config, onSuccess, undefined /* onFailure */);
      }
    },
    read: {
      icon: 'stop',
      on: () => {
        setContext('');
      }
    },
    recv: {
      icon: 'share',
      on: () => {
        navigator?.share?.({
          url: `${$page.url.origin}${$page.url.pathname}?path=/wallet&to=${accounts[active].publicKey}`
        });
      }
    }
  };

  /**
   * Removes a card from stored accounts list.
   */
  function removeCard() {
    removeAccount?.(active);
    setContext('');
    splide.go(active === 0 ? 0 : active - 1);
  }
</script>

<div class="content-viewport">
  {#if showFab}
    <Fab
      class={`fab ${context === 'read' ? 'fab-error' : ''}`}
      on:click={fab[context]?.on ?? fab.default.on}
    >
      <Icon smui="common" name={fab[context]?.icon ?? fab.default.icon} variant="rounded" />
    </Fab>
  {/if}
</div>
<div class="content-wrapper">
  <div class="content">
    <div class="wallet-container">
      <div class="header">
        <div class="header__title">{$_('page.main.menu.wallet')}</div>
        <div class="network-selector" style="margin-left: auto;">
          <div class="network-selector__icon" class:connected>
            <Icon name="language" variant="rounded" />
          </div>
        </div>
      </div>
      {#if context !== 'read'}
        <Splide
          bind:this={splide}
          aria-label="cards"
          hasTrack={false}
          on:active={(e) => (active = e.detail.splide.index)}
        >
          <div class="splide__arrows" />
          <SplideTrack>
            {#each accounts as _acc, i}
              <SplideSlide>
                <button
                  class="card"
                  on:click={() =>
                    setContext(context === 'recv' || context === 'remv' ? '' : 'recv')}
                  on:contextmenu={() => setContext(context === 'remv' ? '' : 'remv')}
                >
                  <div class="card__header">
                    <span style="font-weight: 700;">Noir</span><span>&nbsp;Pay</span>
                    <div class="card__header__icon" class:unselected={context !== 'recv'}>
                      <Icon name="qr_code" variant="rounded" />
                    </div>
                  </div>
                  <div class="card__content">
                    <div class="amount">{balances[i] ?? '-'}</div>
                    <div class="unit">CDT</div>
                  </div>
                </button>
              </SplideSlide>
            {/each}
            <SplideSlide>
              <a
                class="card none"
                href={`/login?continue=${encodeURIComponent('/wallet')}`}
                on:click={() => localStorage.setItem('needload', 'true')}
              >
                <Icon name="add" variant="rounded" />
              </a>
            </SplideSlide>
          </SplideTrack>
          <div class="splide__pagination" style={context !== '' ? 'visibility: hidden;' : ''} />
        </Splide>
      {/if}
      {#if context === 'send'}
        <div class="send-container">
          <Textfield bind:value={to} label="To">
            <Icon smui="textfield" name="person" variant="rounded" slot="leadingIcon" />
          </Textfield>
          <Textfield
            bind:value={amount}
            label="Amount"
            style="margin-top: 12px;"
            suffix="CDT"
            input$inputmode="decimal"
            type="text"
            input$pattern="([0-9]*|[0-9]+\.[0-9]*)"
          >
            <Icon smui="textfield" name="price_change" variant="rounded" slot="leadingIcon" />
          </Textfield>
          <div class="send-container__actions">
            <Button on:click={cancelTransfer}>
              <Label>Cancel</Label>
            </Button>
            <Button variant="filled" on:click={confirmTransfer}>
              <Label>Confirm</Label>
            </Button>
          </div>
        </div>
      {:else if context === 'recv'}
        <div class="qr-container">
          <div class="qr-container__header">Receive money</div>
          <div class="qr-container__description">
            You can receive money by sharing this QR code.
          </div>
          <div class="qr">
            <QR
              text={`${$page.url.origin}${$page.url.pathname}?to=${accounts[active].publicKey}`}
            />
          </div>
        </div>
        <!--<div class="history">
          <div class="history__header">Latest Transactions</div>
        </div>-->
      {/if}
      {#if context === 'read'}
        <div class="reader-header">Scan QR Code</div>
      {/if}
      <div class="reader-container">
        <div id="reader" />
      </div>
      {#if context === 'read'}
        <Button on:click={() => setContext('send')}>input recipient</Button>
      {/if}
      {#if context === 'remv'}
        <div class="button-container">
          <Button variant="filled" class="button-error" on:click={() => removeCard()}>
            <Label>Remove This Card</Label>
          </Button>
        </div>
      {/if}
    </div>
  </div>
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

  .wallet-container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    flex-grow: 1;
    width: calc(100% - 30px);
    max-width: 600px;
    align-self: center;
  }

  .header {
    display: flex;
    align-items: center;
    margin: 24px 0;
  }

  .header__title {
    @include typography.headline-medium;

    margin-left: 15px;
    color: var(--mdc-theme-on-background);
    cursor: default;
  }

  .network-selector {
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 15px;
    border-radius: 50%;
    background: var(--mdc-theme-surface);
    color: var(--mdc-theme-on-surface);
    width: 54px;
    height: 54px;
    cursor: default;
  }

  .network-selector__icon {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    width: 46px;
    height: 46px;
  }

  .connected {
    border: 1px solid var(--mdc-theme-tertiary);
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
    background: var(--mdc-theme-primary);
    color: var(--mdc-theme-on-primary);
    box-sizing: border-box;
    padding: 32px;
    margin-left: 15px;
  }

  .card__header {
    display: flex;
    font-size: 1.25rem;
  }

  .card__header__icon {
    margin-left: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background: var(--mdc-theme-primary-container);
    color: var(--mdc-theme-on-primary-container);
    width: 30px;
    height: 30px;
  }

  .card__header__icon.unselected {
    opacity: 0.35;
  }

  .card__content {
    margin-top: auto;
    display: flex;
    justify-content: end;
  }

  .amount {
    font-size: 1.5rem;
    font-weight: 500;
  }

  .unit {
    align-self: end;
    margin-left: 0.5rem;
  }

  .card.none {
    justify-content: center;
    align-items: center;
    background: transparent;
    border: 1px solid var(--mdc-theme-outline);
    color: var(--mdc-theme-outline);
    font-size: 1.5rem;
  }

  .card.none:hover {
    border: 1px solid var(--mdc-theme-on-surface-variant);
    color: var(--mdc-theme-on-surface-variant);
  }

  .send-container {
    display: flex;
    flex-direction: column;
    padding: 23px;
    color: var(--mdc-theme-on-background);
    flex-grow: 1;
  }

  .send-container__actions {
    margin-top: auto;
    width: 100%;
    display: flex;
    column-gap: 12px;
  }

  :global(.send-container__actions > *) {
    flex-grow: 1;
  }

  .qr-container {
    display: flex;
    flex-direction: column;
    padding: 0 15px;
  }

  .qr-container__header {
    font-size: 1.5rem;
    font-weight: 500;
    margin: 24px 0 12px;
  }

  .qr-container__description {
    margin-bottom: 16px;
  }

  .qr {
    padding: 16px;
    border: 1px solid var(--mdc-theme-surface-variant);
    border-radius: 12px;
    background: white;
    width: 150px;
    height: 150px;
    align-self: center;
  }

  /*
  .history {
    display: flex;
    flex-direction: column;
  }

  .history__header {
    font-size: 1.5rem;
    font-weight: 500;
    margin: 24px 15px 12px;
  }
  */

  .reader-header {
    font-size: 1.5rem;
    font-weight: 500;
    margin: 24px 15px 12px;
  }

  .reader-container {
    border-radius: 12px;
    overflow: hidden;
    margin: 0 15px 24px;
  }

  .button-container {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 12px;
  }

  :global(.button-error) {
    --mdc-text-button-hover-state-layer-color: var(--mdc-theme-on-error) !important;
    background: var(--mdc-theme-error) !important;
  }

  :global(.button-error > .mdc-button__label) {
    color: var(--mdc-theme-on-error) !important;
  }

  :global(.fab-error) {
    background-color: var(--mdc-theme-error-container) !important;
  }

  :global(.fab-error > .mdc-fab__ripple::before, .fab-error > .mdc-fab__ripple::after) {
    background-color: var(--mdc-theme-on-error-container) !important;
  }

  :global(.fab-error > .mdc-fab__icon) {
    color: var(--mdc-theme-on-error-container) !important;
  }

  @media (max-width: 599px) {
    .content-wrapper {
      max-width: unset;
    }

    .content-viewport {
      height: calc(100% - 80px);
    }

    .splide__arrows {
      display: none;
    }

    .card {
      width: calc(100vw - 60px);
      padding: 24px;
    }
  }
</style>
