import { json } from '@sveltejs/kit';
import { user } from '$server/libs/stores.server';

export async function DELETE() {
  user.set('');
  return json('');
}
