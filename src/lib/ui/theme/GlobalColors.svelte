<script lang="ts">
  import type { ColorScheme } from './types';
  import type { CorePaletteColors } from '@material/material-color-utilities';
  import {
    argbFromHex,
    hexFromArgb,
    CorePalette,
    Scheme
  } from '@material/material-color-utilities';
  import { camelToKebab } from '$lib/utils';

  export let colors: CorePaletteColors = {
    // primary: argbFromHex('#63539f'), // Purple
    // primary: argbFromHex('#2856ca'), // Blue
    // primary: argbFromHex('#456928') // Green
    primary: argbFromHex('#0b57d0'),
    secondary: argbFromHex('#00639b'),
    tertiary: argbFromHex('#41664f'),
    neutral: argbFromHex('#5f6368'),
    error: argbFromHex('#b3261e')
  };

  export let overrides: { light?: ColorScheme; dark?: ColorScheme } = {
    light: {
      surface: argbFromHex('#f4f6fb'),
      onSurface: argbFromHex('#1f1f1f'),
      surfaceContainerLowest: argbFromHex('#ffffff'),
      surfaceVariant: argbFromHex('#e1e3e1'),
      onSurfaceVariant: argbFromHex('#444746'),
      primaryContainer: argbFromHex('#d3e3fd'),
      onPrimaryContainer: argbFromHex('#041e49'),
      secondaryContainer: argbFromHex('#c2e7ff'),
      onSecondaryContainer: argbFromHex('#001d35')
    },
    dark: {
      surface: argbFromHex('#2d2f31'),
      onSurface: argbFromHex('#e3e3e3'),
      surfaceContainerLowest: argbFromHex('#1f1f1f'),
      surfaceVariant: argbFromHex('#444746'),
      onSurfaceVariant: argbFromHex('#c4c7c5'),
      primaryContainer: argbFromHex('#0842a0'),
      onPrimaryContainer: argbFromHex('#d3e3fd'),
      secondaryContainer: argbFromHex('#004a77'),
      onSecondaryContainer: argbFromHex('#c2e7ff')
    }
  };

  $: core = CorePalette.fromColors(colors);
  $: schemes = {
    light: {
      ...Scheme.lightFromCorePalette(core).toJSON(),
      surfaceDim: core.n1.tone(87),
      surface: core.n1.tone(98),
      surfaceBright: core.n1.tone(98),
      surfaceContainerLowest: core.n1.tone(100),
      surfaceContainerLow: core.n1.tone(96),
      surfaceContainer: core.n1.tone(94),
      surfaceContainerHigh: core.n1.tone(92),
      surfaceContainerHighest: core.n1.tone(90),
      ...overrides?.light
    },
    dark: {
      ...Scheme.darkFromCorePalette(core).toJSON(),
      surfaceDim: core.n1.tone(6),
      surface: core.n1.tone(6),
      surfaceBright: core.n1.tone(24),
      surfaceContainerLowest: core.n1.tone(4),
      surfaceContainerLow: core.n1.tone(10),
      surfaceContainer: core.n1.tone(12),
      surfaceContainerHigh: core.n1.tone(17),
      surfaceContainerHighest: core.n1.tone(22),
      ...overrides?.dark
    }
  };

  let styles: string;

  $: {
    styles = `
<style>
  body, body[data-theme="light"] {
    `;
    for (const [k, v] of Object.entries(schemes.light)) {
      styles += `--mdc-theme-${camelToKebab(k)}: ${hexFromArgb(v)}; `;
    }
    styles += `
  }

  body[data-theme="dark"] {
    `;
    for (const [k, v] of Object.entries(schemes.dark)) {
      styles += `--mdc-theme-${camelToKebab(k)}: ${hexFromArgb(v)}; `;
    }
    styles += `
  }
</style>
    `;
  }
</script>

<svelte:head>
  {#if styles}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html `${styles}`}
  {/if}
</svelte:head>

<slot />
