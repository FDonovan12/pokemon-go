import { Injectable, signal } from '@angular/core';
import { AnyToast } from 'app/shared/features/toast/toast.model';
import { ToastBuilder } from './toast.builder';

@Injectable({ providedIn: 'root' })
export class ToastService {
    private readonly _toasts = signal<AnyToast[]>([]);
    readonly toasts = this._toasts.asReadonly();

    prepare(title: string, message: string): ToastBuilder {
        return ToastBuilder._internal(title, message, this);
    }

    prepareConfirm(title: string, message: string): ToastBuilder {
        return ToastBuilder._internal(title, message, this);
    }

    dispatch(toast: AnyToast): void {
        this._toasts.update((current) => [...current, toast]);
        console.log(this._toasts());
        if (toast.duration > 0) {
            setTimeout(() => this.dismiss(toast.id), toast.duration);
        }
    }

    dismiss(id: string): void {
        this._toasts.update((current) => current.filter((t) => t.id !== id));
    }
}
