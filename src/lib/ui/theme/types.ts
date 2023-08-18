import type { CorePaletteColors } from '@material/material-color-utilities';

export interface ColorScheme {
  primary?: number;
  onPrimary?: number;
  primaryContainer?: number;
  onPrimaryContainer?: number;
  secondary?: number;
  onSecondary?: number;
  secondaryContainer?: number;
  onSecondaryContainer?: number;
  tertiary?: number;
  onTertiary?: number;
  tertiaryContainer?: number;
  onTertiaryContainer?: number;
  error?: number;
  onError?: number;
  errorContainer?: number;
  onErrorContainer?: number;
  background?: number;
  onBackground?: number;
  surface?: number;
  onSurface?: number;
  surfaceVariant?: number;
  onSurfaceVariant?: number;
  outline?: number;
  outlineVariant?: number;
  shadow?: number;
  scrim?: number;
  inverseSurface?: number;
  inverseOnSurface?: number;
  inversePrimary?: number;
  surfaceDim?: number;
  surfaceBright?: number;
  surfaceContainerLowest?: number;
  surfaceContainerLow?: number;
  surfaceContainer?: number;
  surfaceContainerHigh?: number;
  surfaceContainerHighest?: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Theme {
  mode: ThemeMode;
  colors?: CorePaletteColors;
}

export type { CorePaletteColors };
