import { Injectable } from '@angular/core';
import * as LZ from 'lz-string';

export interface ShareDataIds {
    ids: number[];
}

@Injectable({
    providedIn: 'root',
})
export class ShareListService {
    /**
     * Compresse un tableau de slugs en une chaîne compacte
     */
    compressShareData(slugs: number[]): string {
        const contentToComprss = slugs.join(',');
        console.log('contentToComprss : ', contentToComprss.length);
        const compress = LZ.compressToBase64(contentToComprss);
        console.log('compress : ', compress.length);
        return compress;
    }

    decompressShareData(compressed: string): ShareDataIds | null {
        try {
            const json = LZ.decompressFromBase64(compressed);
            if (!json) return null;
            return { ids: json.split(',').map((string) => +string) };
        } catch {
            return null;
        }
    }

    /**
     * Génère l'URL de partage
     */
    generateShareUrl(slugs: number[]): string {
        const compressed = this.compressShareData(slugs);
        const baseUrl = window.location.origin;
        return `${baseUrl}/#/keep/share/${compressed}`;
    }
}
