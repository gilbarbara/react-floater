import { DependencyList, EffectCallback, useEffect, useRef } from 'react';

function useEffectOnce(effect: EffectCallback) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, []);
}

export function useMount(effect: EffectCallback) {
  useEffectOnce(effect);
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

  // update the ref each render so if it changes the newest callback will be invoked
  fnRef.current = fn;

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
