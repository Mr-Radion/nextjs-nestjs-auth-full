import DevTools from 'mobx-react-devtools';
import { Context, store } from '../features/common/store';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Context.Provider
        value={{
          store,
        }}
      >
        <Component {...pageProps}>
          <DevTools />
        </Component>
      </Context.Provider>
    </>
  );
}
