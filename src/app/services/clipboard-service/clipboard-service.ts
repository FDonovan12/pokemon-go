import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ClipboardService {
    copyToClipboard(string: string) {
        navigator.clipboard
            .writeText(string)
            .then(() => {
                console.log('Text copied to clipboard:', string);
            })
            .catch((err) => {
                console.error('Error copying text: ', err);
            });
    }
}
