import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ToastComponent } from './toast.component';
import { ToastService } from './toast.service';

@Component({
    selector: 'app-toast-container',
    imports: [CommonModule, ToastComponent],
    template: `
        <div class="toast-container">
            @for (toast of toasts(); track toast.id) {
                <app-toast
                    [toast]="toast"
                    (dismiss)="toastService.dismiss($event)"
                />
            }
        </div>
    `,
    styles: `
        .toast-container {
            position: fixed;
            top: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            left: 50%;
            transform: translateX(-50%);
            gap: 12px;
            width: min(85vw, 100ch);
            pointer-events: auto;
            & * {
                text-align: center;
            }
        }
    `,
})
export class ToastContainerComponent {
    protected readonly toastService: ToastService = inject(ToastService);

    toasts = computed(() => this.toastService.toasts());
}
