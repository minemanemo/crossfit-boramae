import type { AppProps } from 'next/app';
import '@common/styles/globals.css';

import GlobalNavigationBar from '@components/GlobalNavigationBar';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
      <GlobalNavigationBar />
      <Component {...pageProps} />
    </div>
  );
}
export default MyApp;
