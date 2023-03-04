import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useEventCallback, useEventListener } from 'usehooks-ts';
import type { z } from 'zod';

declare global {
  interface WindowEventMap {
    'local-storage': CustomEvent;
  }
}

type SetValue<T> = Dispatch<SetStateAction<T>>;

export const useLocalStorageStrict = <T extends z.ZodTypeAny>(
  key: string,
  schema: T,
  initialValue: z.infer<T>,
  unsetValue = initialValue
): [z.infer<T>, SetValue<z.infer<T>>] => {
  const [storedValue, setStoredValue] = useState<z.infer<T>>(initialValue);

  const readValue = useCallback((): z.infer<T> => {
    const item = window.localStorage.getItem(key);
    return item !== null ? schema.parse(JSON.parse(item)) : unsetValue;
  }, [unsetValue, schema, key]);

  const setValue: SetValue<z.infer<T>> = useEventCallback((value) => {
    const newValue = value instanceof Function ? value(storedValue) : value;
    window.localStorage.setItem(key, JSON.stringify(newValue));
    setStoredValue(newValue);

    // to sync between component states since local storage change events
    // do not fire on the tab that updated it
    window.dispatchEvent(new CustomEvent('local-storage', { detail: key }));
  });

  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  const handleStorageChange = useCallback(
    (event: StorageEvent | CustomEvent) => {
      const eventKey = event instanceof StorageEvent ? event.key : event.detail;
      if (eventKey === null || eventKey !== key) {
        return;
      }
      setStoredValue(readValue());
    },
    [key, readValue]
  );

  useEventListener('storage', handleStorageChange);
  useEventListener('local-storage', handleStorageChange);

  return [storedValue, setValue];
};
