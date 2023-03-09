import FormError from './form-error';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import React, { Fragment, useState } from 'react';
import type { ControllerRenderProps } from 'react-hook-form';

type Props<T extends Choice> = {
  choices: Array<T>;
  className?: string;
  placeholder?: string;
  label?: string;
  errors?: Record<string, { message?: string } | undefined>;
  variant?: 'sm' | 'base';
} & Partial<ControllerRenderProps>;

interface Choice {
  id: string;
  name: string;
  category: string;
}

function InputCategoryCombo<T extends Choice>(
  { choices, className, label, value, onChange, name, errors, variant, ...props }: Props<T>,
  ref?: React.ForwardedRef<HTMLInputElement>
) {
  const [query, setQuery] = useState('');

  const filtered =
    query === ''
      ? choices
      : choices.filter(
          (choice) =>
            choice.name
              .toLowerCase()
              .replace(/\s+/g, '')
              .includes(query.toLowerCase().replace(/\s+/g, '')) ||
            choice.category
              .toLowerCase()
              .replace(/\s+/g, '')
              .includes(query.toLowerCase().replace(/\s+/g, ''))
        );

  const transformedChoices = [...new Set(filtered.map((c) => c.category))].map((c) => ({
    name: c,
    choices: filtered.filter((p) => p.category === c)
  }));

  return (
    <Combobox defaultValue={value} onChange={onChange} refName={name}>
      <div className={`relative ${className ?? ''}`}>
        <div className={`space-y-2 ${className ?? ''}`}>
          {(!!label ?? true) && (
            <label className="block text-sm font-medium text-stone-700">{label}</label>
          )}

          <div className="relative w-full cursor-default overflow-hidden rounded-md border border-stone-400 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500">
            <Combobox.Input
              ref={ref}
              data-variant={variant}
              className="w-full border-none bg-stone-50 py-2 pl-3 pr-10 text-sm leading-5 text-stone-600 focus:bg-white focus:text-stone-900 focus:ring-0 data-[variant=sm]:p-1 dark:bg-stone-700 dark:text-stone-400 dark:placeholder:text-stone-400 dark:focus:text-stone-200 "
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
          <Combobox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white text-base text-stone-700 shadow-lg ring-1 ring-stone-400 ring-opacity-5 focus:outline-none dark:bg-stone-700 dark:text-stone-400 sm:text-sm">
            {filtered.length === 0 && query !== '' ? (
              <div className="relative cursor-default select-none py-1 px-2">Nothing found.</div>
            ) : (
              transformedChoices.map((cat) => (
                <div key={cat.name}>
                  <div className="cursor-default bg-stone-200 px-2 py-1 dark:bg-stone-800">
                    {cat.name}
                  </div>
                  {cat.choices.map((choice) => (
                    <div key={choice.id}>
                      <Combobox.Option
                        key={choice.id}
                        className={({ active }) =>
                          `relative cursor-default select-none py-1 pl-6 pr-2 ${
                            active ? 'bg-sky-600 text-white ' : 'text-stone-900 dark:text-stone-200'
                          }`
                        }
                        value={choice}
                      >
                        {({ selected, active }) => (
                          <>
                            <span
                              className={`block truncate ${
                                selected ? 'font-medium' : 'font-normal'
                              }`}
                            >
                              {choice?.name}
                            </span>
                            {selected ? (
                              <span
                                className={`absolute inset-y-0 left-0 flex items-center pl-1 ${
                                  active ? 'text-white' : 'text-sky-600 dark:text-stone-200'
                                }`}
                              >
                                <CheckIcon className="h-4 w-4" aria-hidden="true" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Combobox.Option>
                    </div>
                  ))}
                </div>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
}

export default React.forwardRef(InputCategoryCombo);
