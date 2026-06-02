import { Injectable } from '@angular/core';
import * as LZ from 'lz-string';

export interface ShareData {
    slugs: string[];
}

@Injectable({
    providedIn: 'root',
})
export class ShareListService {
    /**
     * Compresse un tableau de slugs en une chaîne compacte
     */
    compressShareData(slugs: string[]): string {
        const data: ShareData = { slugs };
        const json = JSON.stringify(data);
        return LZ.compressToBase64(json);
    }

    /**
     * Décompresse une chaîne en tableau de slugs
     */
    decompressShareData(compressed: string): ShareData | null {
        try {
            const json = LZ.decompressFromBase64(compressed);
            if (!json) return null;
            return JSON.parse(json) as ShareData;
        } catch {
            return null;
        }
    }

    /**
     * Génère l'URL de partage
     */
    generateShareUrl(slugs: string[]): string {
        const compressed = this.compressShareData(slugs);
        const baseUrl = window.location.origin;
        return `${baseUrl}/#/keep/share/${compressed}`;
    }
}
