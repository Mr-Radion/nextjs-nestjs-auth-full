import { createContext } from 'react';
import { AuthStore } from '../../join/model';

// export const stateTypes = { authStore: new AuthStore() };

// export type State = typeof stateTypes;

// export type State = typeof stateTypes;

// export const Context = createContext<State>({
//   authStore: stateTypes.authStore,
// });

// console.log(stateTypes.authStore);

interface State {
  store: AuthStore;
}

export const store = new AuthStore();

export const Context = createContext<State>({
  store,
});

// export const store = 'dwda';
