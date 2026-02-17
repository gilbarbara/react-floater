export type PartialDeep<T> = {
  [K in keyof T]?: T[K] extends object ? Partial<T[K]> : T[K];
};

export type RequireExactlyOne<T, Keys extends keyof T = keyof T> = {
  [K in Keys]: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, never>>;
}[Keys] &
  Omit<T, Keys>;

export type SetRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type ValueOf<T> = T[keyof T];
