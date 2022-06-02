import { DependencyList, EffectCallback, useCallback, useEffect, useRef, useState } from 'react';
import { AnyObject } from '@gilbarbara/types';

function useEffectOnce(effect: EffectCallback) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, []);
}

export function useMount(effect: EffectCallback) {
  useEffectOnce(effect);
}

export function useSetState<T extends AnyObject>(
  initialState: T = {} as T,
): [T, (patch: Partial<T> | ((previousState: T) => Partial<T>)) => void] {
  const [state, set] = useState<T>(initialState);

  const setState = useCallback(
    (patch: Partial<T> | ((previousState: T) => Partial<T>)) => {
      set(previousState => ({
        ...previousState,
        ...(patch instanceof Function ? patch(previousState) : patch),
      }));
    },
    [set],
  );

  return [state, setState];
}

export function useSingleton(callback: () => void): void {
  const hasBeenCalled = useRef(false);

  if (hasBeenCalled.current) {
    return;
  }

  callback();
  hasBeenCalled.current = true;
}

export function useUnmount(fn: () => any): void {
  const fnRef = useRef(fn);

  // update the ref each render so if it change the newest callback will be invoked
  fnRef.current = fn;

  // eslint-disable-next-line unicorn/consistent-function-scoping
  useEffectOnce(() => () => fnRef.current());
}

export function useUpdateEffect(effect: EffectCallback, deps?: DependencyList) {
  const isFirst = useRef(true);

  useEffect(() => {
    if (!isFirst.current) {
      effect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  if (isFirst.current) {
    isFirst.current = false;
  }
}
