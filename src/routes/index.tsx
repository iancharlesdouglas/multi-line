import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { MultiLine } from '~/components/mult-line/mult-line';
import { Qd3 } from '~/components/qd3/qd3';

export default component$(() => {
  return (
    <>
    <Qd3 />
      {/* <MultiLine /> */}
    </>
  );
});

export const head: DocumentHead = {
  title: 'Welcome to Qwik',
  meta: [
    {
      name: 'description',
      content: 'Qwik site description',
    },
  ],
};
