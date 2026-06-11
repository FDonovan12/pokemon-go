import { inject, Injectable } from '@angular/core';
import { ToastService } from '@shared/features/toast/toast.service';

@Injectable({
    providedIn: 'root',
})
export class LocalStorageService {
    private readonly _toastService: ToastService = inject(ToastService);
    private storage = localStorage;

    set<T>(key: string, value: T): void {
        try {
            const serialized = JSON.stringify(value);
            this.storage.setItem(key, serialized);
        } catch (e) {
            console.error(`Error saving "${key}" to localStorage`, e);
        }
    }

    get<T>(key: string, defaultValue: T): T {
        const item = this.storage.getItem(key);
        if (!item) {
            return defaultValue;
        }
        try {
            return JSON.parse(item);
        } catch (e) {
            console.error(`Error parsing localStorage item "${key}"`, e);
            return defaultValue;
        }
    }

    remove(key: string): void {
        this.storage.removeItem(key);
    }

    clear(): void {
        this.storage.clear();
    }

    exists(key: string): boolean {
        return this.storage.getItem(key) !== null;
    }
}
