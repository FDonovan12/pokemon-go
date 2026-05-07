import { Component, computed, inject } from '@angular/core';
import { ToastService } from '../toast.service';
import { ToastComponent } from './toast.component';

@Component({
    selector: 'app-toast-container',
    imports: [ToastComponent],
    templateUrl: './toast-container.component.html',
    styleUrl: './toast-container.component.css',
})
export class ToastContainerComponent {
    protected readonly toastService: ToastService = inject(ToastService);

    toasts = computed(() => this.toastService.toasts());
}
