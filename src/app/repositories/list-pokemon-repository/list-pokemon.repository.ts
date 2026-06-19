import { inject, Injectable } from '@angular/core';
import { LabelEntry } from '@entities/label';
import { PokemonInterface, PokemonSlug } from '@entities/pokemon';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { LocalStorageService } from '@services/local-storage-service/local-storage-service';
import { InternalListPokemonRepository } from './internal-list-pokemon.repository';

const LOCAL_STORAGE_KEEP = { label: 'veut garder', slug: 'pokemon-want-keep' } as LabelEntry;
const LOCAL_STORAGE_KEEP_KEYS = 'pokemon-want-keep-keys';
@Injectable({
    providedIn: 'root',
})
export class ListPokemonRepository {
    private readonly _localStorageService: LocalStorageService = inject(LocalStorageService);
    private readonly _pokemonRepository: PokemonRepository = inject(PokemonRepository);
    private readonly _internalListPokemonRepository: InternalListPokemonRepository =
        inject(InternalListPokemonRepository);

    getListKeys(): LabelEntry[] {
        const stored = this._localStorageService.get(LOCAL_STORAGE_KEEP_KEYS, []);
        if (stored.length === 0) {
            return [LOCAL_STORAGE_KEEP];
        }
        return stored;
    }

    getSlugsForList(entry: LabelEntry | { slug: string }): PokemonSlug[] {
        const storageSlugs: PokemonSlug[] = this._localStorageService.get(entry.slug, []);
        return storageSlugs;
    }

    getPokemonsForList(entry: LabelEntry | { slug: string }): PokemonInterface[] {
        const internal = this._internalListPokemonRepository.getPokemonsForInternalList(entry);
        if (internal) return internal;

        const storageSlugs: PokemonSlug[] = this.getSlugsForList(entry);
        const storagePokemons = this._pokemonRepository.getPokemonsBySLugs(storageSlugs);
        return storagePokemons;
    }

    saveSlugsForList(entry: LabelEntry | { slug: string }, slugs: PokemonSlug[]): void {
        this._localStorageService.set(entry.slug, slugs);
    }

    saveListKeys(entries: LabelEntry[]): void {
        this._localStorageService.set(LOCAL_STORAGE_KEEP_KEYS, entries);
    }

    deleteList(entry: LabelEntry | { slug: string }): void {
        const keys = this.getListKeys();
        const updatedKeys = keys.filter((entry) => entry.slug !== entry.slug);
        this.saveListKeys(updatedKeys);
        this._localStorageService.remove(entry.slug);
    }
}
