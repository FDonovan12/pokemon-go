import { inject, Injectable } from '@angular/core';
import { ToastService } from '@shared/features/toast/toast.service';

@Injectable({
    providedIn: 'root',
})
export class ClipboardService {
    private readonly toastService: ToastService = inject(ToastService);

    copyToClipboard(string: string, options?: { message?: string; limit?: number }) {
        navigator.clipboard
            .writeText(string)
            .then(() => {
                const messageToPrint = options?.message ?? string;
                console.log('Text copied to clipboard:', messageToPrint);
                this.toastService.prepare('Texte Copié', messageToPrint).showInfo();
            })
            .catch((err) => {
                console.error('Error copying text: ', err);
            });
    }
}
