import type { AppProps } from 'next/app';
import '../styles.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  var tae = 'kekekeke';
  return <Component {...pageProps} />;
}
