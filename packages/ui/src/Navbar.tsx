import { FC } from "react";

export type NavbarItem = {
  title: string;
  path: string;
};

export const Navbar: FC<{ menuItems: NavbarItem[] }> = ({ menuItems }) => {
  return (
    <header className="max-w-screen-xl mx-auto px-5">
      <div className="flex flex-col lg:flex-row justify-between items-center my-5">
        <div className="flex w-full lg:w-auto items-center justify-between">
          <a href="/" className="text-2xl">
            <span className="font-bold text-slate-800">Empire</span>
            <span className="text-slate-500">builder</span>
          </a>
        </div>
        <nav className="hidden w-full lg:w-auto mt-2 lg:flex lg:mt-0">
          <ul className="flex flex-col lg:flex-row lg:gap-3">
            {menuItems.map((l) => (
              <li>
                <a
                  href={l.path}
                  className="flex lg:px-3 py-2 text-gray-600 hover:text-gray-900"
                >
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
