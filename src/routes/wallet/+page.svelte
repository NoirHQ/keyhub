<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  onMount(() => {
    let search: string;

    if ($page.url.search.length > 0) {
      search = $page.url.search.replace('?', '&');
    } else {
      search = '';
    }

    goto(`/?path=/wallet${search}`);
  });
</script>
