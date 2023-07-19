import { useFetcher, useNavigate } from '@remix-run/react';
import { atom, useAtom } from 'jotai';
import { ROUTES } from '~/routes';
import { createModal } from './wrapper';
import { Combobox } from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export type SwitcherModalState = {
  open: boolean;
  title: string;
  query: string;
  workspaces: Array<{ id: string; name: string }>;
};

export const switcherModalAtom = atom<SwitcherModalState>({
  open: false,
  title: '',
  query: '',
  workspaces: []
});

function SwitcherModal() {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const [state, setState] = useAtom(switcherModalAtom);
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const cmds = [
    {
      id: ROUTES.createWorkspace,
      name: 'Create Workspace'
    },
    ...state.workspaces.map((w) => ({
      id: ROUTES.workspace(w.id).dashboard,
      name: w.name
    }))
  ].filter((c) => !state.query || c.name.toLowerCase().includes(state.query.toLowerCase()));

  const onChange = (cmd: (typeof cmds)[number]) => {
    setState((s) => ({
      ...s,
      open: false
    }));
    navigate(cmd.id);
  };

  return (
    <>
      <fetcher.Form className="-m-4 space-y-2">
        <Combobox onChange={onChange}>
          <div className="flex flex-row items-center justify-center rounded-xl border border-stone-400 bg-stone-50 text-stone-600 ring-2 focus-within:border-sky-500 focus-within:bg-white focus-within:text-stone-900 focus-within:ring-sky-500 dark:bg-stone-700 dark:text-stone-400 dark:placeholder:text-stone-400 dark:focus-within:text-stone-200 sm:text-sm">
            <div className="p-2">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </div>
            <Combobox.Input
              className="w-full border-none bg-transparent pl-0 focus:border-none focus:ring-0"
              displayValue={(choice: (typeof cmds)[number]) => choice?.name}
              onChange={(event) => setState((s) => ({ ...s, query: event.target.value }))}
              placeholder="Switch to workspace"
            />

            <kbd className="p-2 font-sans font-semibold text-stone-600 dark:text-stone-400">
              {isMac ? (
                <abbr title="Command" className="no-underline">
                  ⌘
                </abbr>
              ) : (
                <abbr title="Control" className="no-underline">
                  Ctrl
                </abbr>
              )}
              K
            </kbd>
          </div>

          <Combobox.Options className="space-y-2" static>
            {cmds.map((cmd) => (
              <Combobox.Option
                key={cmd.id}
                className={({ active }) =>
                  ` select-none rounded-xl py-2 pl-4 pr-4 ${
                    active ? 'bg-sky-600 text-white ' : 'text-stone-900 dark:text-stone-200'
                  }`
                }
                value={cmd}
              >
                {({ selected, active }) => <div>{cmd.name}</div>}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </Combobox>
      </fetcher.Form>
    </>
  );
}

export default createModal(SwitcherModal, switcherModalAtom);
