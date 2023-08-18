<script lang="ts">
  import { classMap } from '@smui/common/internal';
  import IconButton from '@smui/icon-button';
  import Snackbar, { Label, Actions } from '@smui/snackbar';
  import Icon from '$lib/ui/icon';

  let snackbar: Snackbar;

  export let variant: '' | 'success' | 'error' = '';

  let className = '';
  export { className as class };

  export let message = '';
  export let timeoutMs = 4000;

  export function open() {
    snackbar.open();
  }

  export function setMessage(text: string) {
    message = text;
  }
</script>

<Snackbar
  class={classMap({
    [className]: true,
    'alert--success': variant === 'success',
    'alert--error': variant === 'error'
  })}
  bind:this={snackbar}
  labelText={message}
  {timeoutMs}
>
  <Label />
  <Actions>
    <IconButton title="Dismiss"><Icon name="close" variant="rounded" /></IconButton>
  </Actions>
</Snackbar>

<style lang="scss">
  :global(.alert--success) {
    :global(.mdc-snackbar__surface) {
      background-color: var(--mdc-theme-tertiary);
    }

    :global(.mdc-icon-button),
    :global(.mdc-snackbar__label) {
      color: var(--mdc-theme-on-tertiary);
    }
  }

  :global(.alert--error) {
    :global(.mdc-snackbar__surface) {
      background-color: var(--mdc-theme-error);
    }

    :global(.mdc-icon-button),
    :global(.mdc-snackbar__label) {
      color: var(--mdc-theme-on-error);
    }
  }
</style>
