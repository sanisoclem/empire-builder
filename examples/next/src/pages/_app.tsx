import type { AppProps } from 'next/app';
import '../styles.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  // testing lint here
  return <Component {...pageProps} />;
}
