import type { MetaFunction, LoaderFunction } from '@remix-run/node';
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import { ClerkApp, ClerkCatchBoundary } from '@clerk/remix';
import { rootAuthLoader } from '@clerk/remix/ssr.server';
import styles from '~/tailwind.css';
import { useTheme } from '~hooks';
import { Modals } from '~components';

export const loader: LoaderFunction = (args) => {
  return rootAuthLoader(args);
};

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Empire Builder',
  viewport: 'width=device-width,initial-scale=1'
});

export const CatchBoundary = ClerkCatchBoundary();

export function links() {
  return [
    { rel: 'stylesheet', href: styles },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css?family=Yaldevi'
    }
  ];
}

function App() {
  const { theme } = useTheme();
  return (
    <html lang="en" className={`h-full ${theme === 'dark' ? 'dark' : ''}`}>
      <head>
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            if (localStorage.theme === '"dark"' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark')
            }
          `
          }}
        ></script>
      </head>
      <body className="h-full">
        <Outlet />
        <Modals />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        {/* <Analytics /> */}
      </body>
    </html>
  );
}

export default ClerkApp(App);
