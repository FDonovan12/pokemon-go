import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { AnyToast } from 'app/shared/features/toast/toast.model';

@Component({
    selector: 'app-toast',
    imports: [CommonModule],
    templateUrl: './toast.component.html',
    styleUrl: './toast.component.css',
})
export class ToastComponent {
    toast = input.required<AnyToast>();
    dismiss = output<string>();

    isConfirmation = computed(() => this.toast().type === 'confirmation');

    onDismiss(): void {
        this.dismiss.emit(this.toast().id);
    }

    onConfirm(): void {
        if (this.isConfirmation()) {
            const confirmToast = this.toast() as any;
            confirmToast.onConfirm?.();
        }
        this.dismiss.emit(this.toast().id);
    }

    onCancel(): void {
        if (this.isConfirmation()) {
            const confirmToast = this.toast() as any;
            confirmToast.onCancel?.();
        }
        this.dismiss.emit(this.toast().id);
    }
}
