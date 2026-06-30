import { Injectable } from '@angular/core';
import * as LZ from 'lz-string';

export interface ShareDataIds {
    ids: number[];
}

@Injectable({
    providedIn: 'root',
})
export class ShareListService {
    generateShareUrl(ids: number[]): string {
        const compressed = this.compressShareData(ids);
        const baseUrl = window.location.origin;
        return `${baseUrl}/pokemon-go/keep/share/${compressed}`;
    }

    private compressShareData(ids: number[]): string {
        const encoded = this.encodeIds(ids);
        const compress = LZ.compressToEncodedURIComponent(encoded);
        return compress;
    }

    decompressShareData(compressed: string): ShareDataIds | null {
        try {
            const deconpressed = LZ.decompressFromEncodedURIComponent(compressed);
            if (!deconpressed) return null;
            const decoded = this.decodeIds(deconpressed);
            return { ids: decoded };
        } catch {
            return null;
        }
    }

    private encodeIds(ids: number[]): string {
        const sorted = [...ids].sort((a, b) => a - b);
        const ranges: string[] = [];
        let start = sorted[0];
        let end = sorted[0];

        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] === end + 1) {
                end = sorted[i];
            } else {
                ranges.push(start === end ? `${start}` : `${start}-${end}`);
                start = end = sorted[i];
            }
        }
        ranges.push(start === end ? `${start}` : `${start}-${end}`);

        return ranges.join(',');
    }

    private decodeIds(encoded: string): number[] {
        return encoded.split(',').flatMap((part) => {
            const [start, end] = part.split('-').map(Number);
            if (end === undefined) return [start];
            return Array.from({ length: end - start + 1 }, (_, i) => start + i);
        });
    }
}
