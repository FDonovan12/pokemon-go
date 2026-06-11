import { AnyToast } from './toast.model';

export interface ToastDispatcher {
    dispatch(toast: AnyToast): void;
}
