import { FC } from 'react';

export type NavbarItem = {
  title: string;
  path: string;
};

export const Navbar: FC<{ menuItems: NavbarItem[] }> = ({ menuItems }) => {
  return (
    <header className="mx-auto max-w-screen-xl px-5">
      <div className="my-5 flex flex-col items-center justify-between lg:flex-row">
        <div className="flex w-full items-center justify-between lg:w-auto">
          <a href="/" className="text-2xl">
            <span className="font-bold text-slate-800">Empire</span>
            <span className="text-slate-500">builder</span>
          </a>
        </div>
        <nav className="mt-2 hidden w-full lg:mt-0 lg:flex lg:w-auto">
          <ul className="flex flex-col lg:flex-row lg:gap-3">
            {menuItems.map((l) => (
              <li>
                <a href={l.path} className="flex py-2 text-gray-600 hover:text-gray-900 lg:px-3">
                  {l.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};
