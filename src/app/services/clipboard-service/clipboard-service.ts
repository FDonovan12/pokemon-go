import { inject, Injectable } from '@angular/core';
import { ToastService } from 'app/shared/features/toast/toast.service';

@Injectable({
    providedIn: 'root',
})
export class ClipboardService {
    toastService = inject(ToastService);

    copyToClipboard(string: string) {
        navigator.clipboard
            .writeText(string)
            .then(() => {
                console.log('Text copied to clipboard:', string);
                this.toastService.prepare('Texte Copié', string).showInfo();
            })
            .catch((err) => {
                console.error('Error copying text: ', err);
            });
    }
}
