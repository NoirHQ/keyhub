<script lang="ts">
  import type { IconName } from './IconSet';
  import { Icon } from '@smui/common';
  import { classMap } from '@smui/common/internal';
  import TextfieldIcon from '@smui/textfield/icon';
  import { getContext } from 'svelte';
  import { FontAwesome } from './IconSet';
  import Idiomatic from './Idiomatic.svelte';

  const icons: { set: string } | undefined = getContext('icons');

  export let name: IconName;
  export let style: string | undefined = undefined;
  export let variant: 'outlined' | 'rounded' | '' = 'outlined';

  export let smui: 'common' | 'textfield' | undefined = undefined;

  let className = '';
  export { className as class };
</script>

{#if icons?.set === 'material'}
  <svelte:component
    this={!smui ? Idiomatic : smui === 'common' ? Icon : TextfieldIcon}
    class={classMap({
      [className]: true,
      'material-icons-outlined': variant === 'outlined',
      'material-icons-round': variant === 'rounded'
    })}
    {style}
    {...$$restProps}
  >
    {name}
  </svelte:component>
{:else}
  <svelte:component
    this={!smui ? Idiomatic : smui === 'common' ? Icon : TextfieldIcon}
    class={classMap({
      [className]: true,
      [FontAwesome[name]]: true,
      'fa-regular': variant === 'outlined',
      'fa-solid': variant === 'rounded'
    })}
    {style}
    {...$$restProps}
  />
{/if}
