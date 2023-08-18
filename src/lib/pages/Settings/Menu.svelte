<script>
  import List, { Item, Meta, Text } from '@smui/list';
  import { _ } from 'svelte-i18n';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Button, { Label } from '$lib/ui/button';
  import Card from '$lib/ui/card';
  import Icon from '$lib/ui/icon';

  async function logout() {
    localStorage.removeItem('accounts');
    localStorage.removeItem('keys');

    await fetch('/api/v1/webauthn/authentication', {
      method: 'DELETE',
      mode: 'cors'
    });

    window.location.href = $page.url.origin;
  }
</script>

<div class="header">
  <span style="margin-left: 15px;">{$_(`page.main.menu.settings`)}</span>
</div>
<div class="content">
  <Card variant="filled" ripple={false} interactive={false}>
    <List>
      <Item on:SMUI:action={() => goto('/?path=/settings/appearance')}>
        <Text>{$_('page.main.settings.appearance')}</Text>
        <Meta>
          <Icon name="keyboard_arrow_right" variant="rounded" style="vertical-align: middle;" />
        </Meta>
      </Item>
    </List>
  </Card>
  <Button variant="outlined" style="margin-top: 24px;" on:click={logout}>
    <Label>{$_('page.main.settings.logout')}</Label>
  </Button>
</div>
