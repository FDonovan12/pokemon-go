import { computed, inject, Injectable, Signal } from '@angular/core';
import { Base, PokemonSlug } from '@entities/pokemon';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import * as LZ from 'lz-string';

export interface ShareDataIds {
    slugs: PokemonSlug[];
}

@Injectable({
    providedIn: 'root',
})
export class ShareListService {
    private readonly _pokemonRepository: PokemonRepository = inject(PokemonRepository);

    SLUG_DICTIONARY: Signal<PokemonSlug[]> = computed(() =>
        this._pokemonRepository.differentForm.getAll().map((pokemon) => pokemon.slug),
    );
    SLUG_INDEX: Signal<Map<PokemonSlug, number>> = computed(
        () => new Map(this.SLUG_DICTIONARY().map((slug, index) => [slug, index])),
    );

    generateShareUrl(pokemons: Base[]): string {
        const indexes = this.slugsToIndexes(pokemons.map((p) => p.slug));
        const compressed = this.compressShareData(indexes);
        const baseUrl = window.location.origin;
        return `${baseUrl}/pokemon-go/keep/share/${compressed}`;
    }

    private slugsToIndexes(slugs: PokemonSlug[]): number[] {
        return slugs.map((slug) => {
            const index = this.SLUG_INDEX().get(slug);
            if (index === undefined) {
                throw new Error(`Slug inconnu dans le dictionnaire: "${slug}"`);
            }
            return index;
        });
    }

    private indexesToSlugs(indexes: number[]): PokemonSlug[] {
        return indexes.map((index) => {
            const slug = this.SLUG_DICTIONARY()[index];
            if (slug === undefined) {
                throw new Error(`Index hors dictionnaire: ${index}`);
            }
            return slug;
        });
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
            const indexes = this.decodeIds(deconpressed);
            const slugs = this.indexesToSlugs(indexes);
            return { slugs };
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
