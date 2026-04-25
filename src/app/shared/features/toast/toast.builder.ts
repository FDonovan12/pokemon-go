import { ConfirmationToast, Toast, ToastType } from 'app/shared/features/toast/toast.model';
import { ToastService } from '../toast/toast.service';

export class ToastBuilder {
    private static readonly TOAST_RULES: Record<ToastType, { duration: number; canClose: boolean; icon: string }> = {
        success: { duration: 3000, canClose: false, icon: '✅' },
        error: { duration: 0, canClose: true, icon: '❌' },
        warning: { duration: 5000, canClose: true, icon: '⚠️' },
        info: { duration: 4000, canClose: false, icon: 'ℹ️' },
        confirmation: { duration: 0, canClose: false, icon: '❓' },
    };

    private constructor(
        private readonly title: string,
        private readonly message: string,
        private readonly service: ToastService,
        private readonly customIcon: string | null = null,
    ) {}

    static _internal(title: string, message: string, service: ToastService): ToastBuilder {
        return new ToastBuilder(title, message, service);
    }

    withIcon(icon: string): ToastBuilder {
        return new ToastBuilder(this.title, this.message, this.service, icon);
    }

    withMessage(message: string): ToastBuilder {
        return new ToastBuilder(this.title, message, this.service, this.customIcon);
    }

    withTitle(title: string): ToastBuilder {
        return new ToastBuilder(title, this.message, this.service, this.customIcon);
    }

    showSuccess(): void {
        this.service.dispatch(this.build('success'));
    }

    showError(): void {
        this.service.dispatch(this.build('error'));
    }

    showWarning(): void {
        this.service.dispatch(this.build('warning'));
    }

    showInfo(): void {
        this.service.dispatch(this.build('info'));
    }

    showConfirmation(onConfirm: () => void, onCancel: () => void): void {
        const rules = ToastBuilder.TOAST_RULES.confirmation;
        const icon = this.customIcon || rules.icon;

        const toast = ConfirmationToast._internalConfirmation(
            crypto.randomUUID(),
            this.title,
            this.message,
            icon,
            rules.duration,
            rules.canClose,
            onConfirm,
            onCancel,
        );

        this.service.dispatch(toast);
    }

    private build(type: Exclude<ToastType, 'confirmation'>): Toast {
        const rules = ToastBuilder.TOAST_RULES[type];
        const icon = this.customIcon || rules.icon;

        return Toast._internal(
            crypto.randomUUID(),
            type,
            this.title,
            this.message,
            icon,
            rules.duration,
            rules.canClose,
        );
    }
}
