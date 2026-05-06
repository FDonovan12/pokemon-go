import { inject, Injectable } from '@angular/core';
import { PokemonInterface, PokemonSlug } from '@entities/pokemon';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { LocalStorageService } from '@services/local-storage-service/local-storage-service';

const LOCAL_STORAGE_KEEP = 'pokemon-want-keep';
const LOCAL_STORAGE_KEEP_KEYS = 'pokemon-want-keep-keys';
@Injectable({
    providedIn: 'root',
})
export class ListPokemonRepository {
    private readonly _localStorageService: LocalStorageService = inject(LocalStorageService);
    private readonly _pokemonRepository: PokemonRepository = inject(PokemonRepository);

    getListKeys(): string[] {
        return this._localStorageService.get(LOCAL_STORAGE_KEEP_KEYS, [LOCAL_STORAGE_KEEP]);
    }

    getSlugsForList(keyStorage: string): PokemonSlug[] {
        const storageSlugs: PokemonSlug[] = this._localStorageService.get(keyStorage, []);
        return storageSlugs;
    }

    getPokemonsForList(keyStorage: string): PokemonInterface[] {
        const storageSlugs: PokemonSlug[] = this.getSlugsForList(keyStorage);
        const storagePokemons = storageSlugs.map((slug) => this._pokemonRepository.getPokemonBySLug(slug));
        return storagePokemons;
    }

    saveSlugsForList(key: string, slugs: PokemonSlug[]): void {
        this._localStorageService.set(key, slugs);
    }
    saveListKeys(keys: string[]): void {
        this._localStorageService.set(LOCAL_STORAGE_KEEP_KEYS, keys);
    }

    deleteList(): void {}
}
