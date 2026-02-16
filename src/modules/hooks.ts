/* eslint-disable react-hooks/exhaustive-deps,react-compiler/react-compiler */
import { DependencyList, EffectCallback, useEffect, useRef } from 'react';

function useEffectOnce(effect: EffectCallback) {
  useEffect(effect, []);
}

export function useMount(effect: EffectCallback) {
  useEffectOnce(effect);
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
  }, deps);

  if (isFirst.current) {
    isFirst.current = false;
  }
}
