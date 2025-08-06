import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ClipboardService {
    copyFeedback$ = new Subject<string>();
    copyToClipboard(string: string) {
        navigator.clipboard
            .writeText(string)
            .then(() => {
                console.log('Text copied to clipboard:', string);
                this.copyFeedback$.next(`Texte '${string}' copié !`);
            })
            .catch((err) => {
                console.error('Error copying text: ', err);
            });
    }
}
