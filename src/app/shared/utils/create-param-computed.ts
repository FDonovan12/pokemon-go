// param-computed.util.ts
import { computed, Signal } from '@angular/core';

export interface ParamLookup<P, R> {
    (param: P): R;
    getMany: (params: P[]) => R[];
    getCachedAll: () => R[]; // ⚠️ uniquement ce qui a déjà été calculé au moins une fois
}

export function createParamComputed<P, R>(
    computeFn: (param: P) => R,
    keyFn: (param: P) => string | number = (p) => p as any,
): ParamLookup<P, R> {
    const cache = new Map<string | number, Signal<R>>();

    const getOne = (param: P): R => {
        const key = keyFn(param);
        let entry = cache.get(key);
        if (!entry) {
            entry = computed(() => computeFn(param));
            cache.set(key, entry);
        }
        return entry();
    };

    const lookup = getOne as ParamLookup<P, R>;
    lookup.getMany = (params) => params.map(getOne);
    lookup.getCachedAll = () => [...cache.values()].map((entry) => entry());

    return lookup;
}
