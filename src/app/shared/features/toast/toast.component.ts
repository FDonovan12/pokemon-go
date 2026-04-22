import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { AnyToast } from 'app/shared/features/toast/toast.model';

@Component({
    selector: 'app-toast',
    imports: [CommonModule],
    template: `
        <div [ngClass]="'toast ' + toast().type">
            <div class="toast__content">
                <span class="toast__icon">{{ toast().icon }}</span>
                <div class="toast__text">
                    <div class="toast__title">{{ toast().title }}</div>
                    <div class="toast__message">{{ toast().message }}</div>
                </div>
            </div>

            @if (isConfirmation()) {
                <div class="toast__actions">
                    <button
                        class="toast__button toast__button--confirm"
                        (click)="onConfirm()"
                    >
                        Confirm
                    </button>
                    <button
                        class="toast__button toast__button--cancel"
                        (click)="onCancel()"
                    >
                        Cancel
                    </button>
                </div>
            } @else if (toast().canClose) {
                <button
                    class="toast__close"
                    (click)="onDismiss()"
                >
                    ×
                </button>
            }
        </div>
    `,
    styles: `
        .toast {
            &.success {
                background-color: #d4edda;
                border: 1px solid #c3e6cb;
                color: #155724;
            }

            &.error {
                background-color: #f8d7da;
                border: 1px solid #f5c6cb;
                color: #721c24;
            }

            &.warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
            }

            &.info {
                background-color: #d1ecf1;
                border: 1px solid #bee5eb;
                color: #0c5460;
            }

            &.confirmation {
                background-color: #e7f3ff;
                border: 1px solid #b3d9ff;
                color: #004085;
            }
        }

        .toast {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            font-size: 0.95rem;
            line-height: 1.4;
        }

        .toast__content {
            display: flex;
            align-items: center;
            place-content: center;
            gap: 12px;
            flex: 1;
        }

        .toast__icon {
            font-size: 1.2rem;
            flex-shrink: 0;
            line-height: 1.4;
            margin-top: 2px;
        }

        .toast__text {
        }

        .toast__title {
            font-weight: 600;
            margin-bottom: 4px;
        }

        .toast__message {
            font-size: 0.9rem;
            opacity: 0.9;
        }

        .toast__actions {
            display: flex;
            gap: 8px;
            flex-shrink: 0;
        }

        .toast__button {
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            font-size: 0.85rem;
            font-weight: 500;
            cursor: pointer;
            transition: opacity 0.2s ease;

            &:hover {
                opacity: 0.8;
            }

            &--confirm {
                background-color: #28a745;
                color: white;
            }

            &--cancel {
                background-color: #6c757d;
                color: white;
            }
        }

        .toast__close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.7;
            transition: opacity 0.2s ease;
            flex-shrink: 0;

            &:hover {
                opacity: 1;
            }
        }
    `,
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
