import { Context, useContext } from 'react';

export function createContextHook<T>(context: Context<T | null>): () => T {
  return () => {
    const state = useContext(context);
    if (!state) {
      throw Error(`The contextHook without provider`);
    }
    return state;
  };
}
