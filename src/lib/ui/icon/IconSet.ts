export type IconName =
  | 'add'
  | 'apps'
  | 'badge'
  | 'close'
  | 'keyboard_arrow_down'
  | 'keyboard_arrow_left'
  | 'keyboard_arrow_right'
  | 'language'
  | 'person'
  | 'price_change'
  | 'qr_code'
  | 'qr_code_scanner'
  | 'settings'
  | 'share'
  | 'stop'
  | 'wallet';

type IconSet = {
  [key in IconName]: string;
};

export type IconSetName = 'material' | 'fontawesome';

export const FontAwesome: IconSet = {
  add: 'fa-plus',
  apps: 'fa-grid-2',
  badge: 'fa-id-card',
  close: 'fa-xmark',
  keyboard_arrow_down: 'fa-angle-down',
  keyboard_arrow_left: 'fa-angle-left',
  keyboard_arrow_right: 'fa-angle-right',
  language: 'fa-globe',
  person: 'fa-user',
  price_change: 'fa-sack-dollar',
  qr_code: 'fa-qrcode',
  qr_code_scanner: 'fa-camera-viewfinder',
  settings: 'fa-gear',
  share: 'fa-share-nodes',
  stop: 'fa-stop',
  wallet: 'fa-wallet'
} as const;
