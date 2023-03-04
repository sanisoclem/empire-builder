import FormError from './form-error';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import React, { Fragment, useState } from 'react';
import type { ControllerRenderProps } from 'react-hook-form';

type Props = {
  choices: Choice[];
  className?: string;
  placeholder?: string;
  label?: string;
  errors?: Record<string, { message?: string } | undefined>;
} & Partial<ControllerRenderProps>;

interface Choice {
  id: string;
  name: string;
}

export default React.forwardRef<HTMLInputElement, Props>(function InputCombo(
  { choices, className, label, value, onChange, name, errors, ...props }: Props,
  ref?
) {
  const [query, setQuery] = useState('');

  const filtered =
    query === ''
      ? choices
      : choices.filter((choice) =>
          choice.name
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.toLowerCase().replace(/\s+/g, ''))
        );

  return (
    <Combobox defaultValue={value} onChange={onChange} refName={name}>
      <div className={`relative ${className ?? ''}`}>
        <div className={`space-y-2 ${className ?? ''}`}>
          <label
            className={`${
              !!label ?? true ? 'block text-sm font-medium text-stone-700' : 'sr-only'
            }`}
          >
            {label}
          </label>

          <div className="relative w-full cursor-default overflow-hidden rounded-none border border-stone-300 bg-white focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
            <Combobox.Input
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-stone-900 focus:ring-0"
              displayValue={(choice: Choice) => choice?.name}
              onChange={(event) => setQuery(event.target.value)}
              {...props}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-stone-400" aria-hidden="true" />
            </Combobox.Button>
          </div>
          {errors && name && errors[name]?.message && (
            <FormError>{errors[name]?.message}</FormError>
          )}
        </div>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery('')}
        >
          <Combobox.Options className="absolute mt-1 max-h-60 z-20 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filtered.length === 0 && query !== '' ? (
              <div className="relative cursor-default select-none py-2 px-4 text-stone-700">
                Nothing found.
              </div>
            ) : (
              filtered.map((choice) => (
                <Combobox.Option
                  key={choice.id}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-indigo-600 text-white' : 'text-stone-900'
                    }`
                  }
                  value={choice}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                      >
                        {choice?.name}
                      </span>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? 'text-white' : 'text-indigo-600'
                          }`}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
});
