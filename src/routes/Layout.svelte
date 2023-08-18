<script lang="ts">
  import Drawer, { Content, Header } from '@smui/drawer';
  import List, { Item, Graphic, Text } from '@smui/list';
  import { _ } from 'svelte-i18n';
  import { goto } from '$app/navigation';
  import { path } from '$lib/stores';
  import Icon from '$lib/ui/icon';
  import NavigationBar, { Item as NavigationBarItem } from '$lib/ui/navigation-bar';
  import NavigationRail, { Item as NavigationRailItem } from '$lib/ui/navigation-rail';
  import { ThemeColor } from '$lib/ui/theme';

  let innerWidth: number;
  $: screenSize = innerWidth < 600 ? 'mobile' : innerWidth < 1240 ? 'tablet' : 'desktop';

  const menuItems = [
    {
      id: 'wallet',
      icon: 'wallet',
      path: '/wallet'
    },
    {
      id: 'id',
      icon: 'badge',
      path: '/id'
    },
    {
      id: 'apps',
      icon: 'apps',
      path: '/apps'
    },
    {
      id: 'settings',
      icon: 'settings',
      path: '/settings'
    }
  ] as const;
</script>

<svelte:window bind:innerWidth />

<ThemeColor />

<div class="main">
  {#if $path !== '/entry'}
    {#if screenSize === 'desktop'}
      <Drawer>
        <Content>
          <Header style="margin-top: 28px; margin-bottom: 4px;">Keyhub</Header>
          <List>
            {#each menuItems as menu}
              <Item
                activated={$path.startsWith(menu.path)}
                on:SMUI:action={() => goto('/?path=' + menu.path)}
              >
                <Graphic>
                  <Icon name={menu.icon} variant="" />
                </Graphic>
                <Text>{$_(`page.main.menu.${menu.id}`)}</Text>
              </Item>
            {/each}
          </List>
        </Content>
      </Drawer>
    {:else if screenSize === 'tablet'}
      <NavigationRail>
        {#each menuItems as menu, i}
          <NavigationRailItem
            selected={$path.startsWith(menu.path)}
            on:click={() => goto('/?path=' + menu.path)}
            style={i === 0 ? 'margin-top: 20px;' : undefined}
          >
            <Icon name={menu.icon} variant="" slot="icon" />
            {$_(`page.main.menu.${menu.id}`)}
          </NavigationRailItem>
        {/each}
      </NavigationRail>
    {/if}
  {/if}
  <slot />
  {#if $path !== '/entry'}
    {#if screenSize === 'mobile'}
      <NavigationBar>
        {#each menuItems as menu}
          <NavigationBarItem
            selected={$path.startsWith(menu.path)}
            on:click={() => goto('/?path=' + menu.path)}
          >
            <Icon name={menu.icon} variant="" slot="icon" />
            {$_(`page.main.menu.${menu.id}`)}
          </NavigationBarItem>
        {/each}
      </NavigationBar>
    {/if}
  {/if}
</div>

<style lang="scss">
  .main {
    height: 100%;
    display: flex;
    background: var(--mdc-theme-background);
    color: var(--mdc-theme-on-background);
    flex-grow: 1;
  }

  :global(.mdc-deprecated-list-item .mdc-deprecated-list-item__graphic),
  :global(.mdc-nav-rail-item .mdc-nav-rail-item__icon),
  :global(.mdc-nav-bar-item .mdc-nav-bar-item__icon) {
    font: var(--fa-font-light, 20px 'Material Icons Outlined');
  }

  :global(.mdc-deprecated-list-item:hover .mdc-deprecated-list-item__graphic),
  :global(.mdc-deprecated-list-item:active .mdc-deprecated-list-item__graphic),
  :global(.mdc-nav-rail-item:active .mdc-nav-rail-item__icon),
  :global(.mdc-nav-rail-item:hover .mdc-nav-rail-item__icon),
  :global(.mdc-nav-bar-item:active .mdc-nav-bar-item__icon),
  :global(.mdc-nav-bar-item:hover .mdc-nav-bar-item__icon) {
    font: var(--fa-font-regular, 20px 'Material Icons Outlined');
  }

  :global(
      .mdc-deprecated-list-item.mdc-deprecated-list-item--activated
        .mdc-deprecated-list-item__graphic
    ),
  :global(.mdc-nav-rail-item.mdc-nav-rail-item--selected .mdc-nav-rail-item__icon),
  :global(.mdc-nav-bar-item.mdc-nav-bar-item--selected .mdc-nav-bar-item__icon) {
    font: var(--fa-font-solid, 20px 'Material Icons Round');
  }

  @media (max-width: 599px) {
    .main {
      flex-direction: column;
    }
  }

  @media (max-width: 1239px) {
  }
</style>
