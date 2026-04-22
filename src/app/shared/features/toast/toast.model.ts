export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'confirmation';

export class Toast {
    protected constructor(
        readonly id: string,
        readonly type: ToastType,
        readonly title: string,
        readonly message: string,
        readonly icon: string,
        readonly duration: number,
        readonly canClose: boolean,
    ) {}

    static _internal(
        id: string,
        type: ToastType,
        title: string,
        message: string,
        icon: string,
        duration: number,
        canClose: boolean,
    ): Toast {
        return new Toast(id, type, title, message, icon, duration, canClose);
    }
}

export class ConfirmationToast extends Toast {
    readonly onConfirm: () => void;
    readonly onCancel: () => void;

    private constructor(
        id: string,
        title: string,
        message: string,
        icon: string,
        duration: number,
        canClose: boolean,
        onConfirm: () => void,
        onCancel: () => void,
    ) {
        super(id, 'confirmation', title, message, icon, duration, canClose);
        this.onConfirm = onConfirm;
        this.onCancel = onCancel;
    }

    static _internalConfirmation(
        id: string,
        title: string,
        message: string,
        icon: string,
        duration: number,
        canClose: boolean,
        onConfirm: () => void,
        onCancel: () => void,
    ): ConfirmationToast {
        return new ConfirmationToast(id, title, message, icon, duration, canClose, onConfirm, onCancel);
    }
}

export type AnyToast = Toast | ConfirmationToast;
