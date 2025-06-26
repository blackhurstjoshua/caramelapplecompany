import type { PageLoad } from './$types';

export const load = (async () => {
  return {
    id: '1234',
    name: 'Server-Side Apple',
    description: 'A delicious fruit',
    price: 1.5,
    image: 'https://example.com/apple.jpg',
  };
}) satisfies PageLoad;
