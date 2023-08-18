<script lang="ts">
  import type { CorePaletteColors } from './types';
  import type { IconSetName } from '../icon';
  import GlobalColors from './GlobalColors.svelte';
  import ThemeContext from './ThemeContext.svelte';
  import { Icons } from '../icon';

  export let colors: CorePaletteColors | undefined = undefined;
  export let icons: IconSetName;
</script>

<ThemeContext>
  <GlobalColors {colors}>
    <Icons set={icons}>
      <slot />
    </Icons>
  </GlobalColors>
</ThemeContext>
