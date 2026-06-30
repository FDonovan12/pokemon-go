import { inject, Injectable } from '@angular/core';
import { LabelEntry } from '@entities/label';
import { PokemonInterface, PokemonSlug } from '@entities/pokemon';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { LocalStorageService } from '@services/local-storage-service/local-storage-service';
import { SupabaseService } from '@services/supabase-service/supabase.service';
import { InternalListPokemonRepository } from './internal-list-pokemon.repository';

const LOCAL_STORAGE_KEEP = { label: 'veut garder', slug: 'pokemon-want-keep' } as LabelEntry;
export const LOCAL_STORAGE_KEEP_KEYS = 'pokemon-want-keep-keys';
@Injectable({ providedIn: 'root' })
export class ListPokemonRepository {
    private readonly _localStorageService = inject(LocalStorageService);
    private readonly _pokemonRepository = inject(PokemonRepository);
    private readonly _internalListPokemonRepository = inject(InternalListPokemonRepository);
    private readonly _supabaseService = inject(SupabaseService);

    async getListKeys(): Promise<LabelEntry[]> {
        if (this._supabaseService.isLoggedIn()) {
            const { data } = await this._supabaseService.client.from('user_data').select('list_keys').single();
            const keys = (data?.list_keys as LabelEntry[]) ?? [];
            return keys.length === 0 ? [LOCAL_STORAGE_KEEP] : keys;
        }
        const stored = this._localStorageService.get(LOCAL_STORAGE_KEEP_KEYS, []);
        return stored.length === 0 ? [LOCAL_STORAGE_KEEP] : stored;
    }

    async getSlugsForList(entry: LabelEntry | { slug: string }): Promise<PokemonSlug[]> {
        if (this._supabaseService.isLoggedIn()) {
            const { data } = await this._supabaseService.client
                .from('list_pokemons')
                .select('slug_pokemon')
                .eq('user_id', this._supabaseService.getUserId())
                .eq('list_slug', entry.slug);
            return (data ?? []).map((row) => row.slug_pokemon as PokemonSlug);
        }
        return this._localStorageService.get(entry.slug, []);
    }

    async getPokemonsForList(entry: LabelEntry | { slug: string }): Promise<PokemonInterface[]> {
        const internal = this._internalListPokemonRepository.getPokemonsForInternalList(entry);
        if (internal) return internal;

        const slugs = await this.getSlugsForList(entry);
        return this._pokemonRepository.getPokemonsBySLugs(slugs);
    }
    async listExists(entry: { slug: string }): Promise<boolean> {
        if (this._internalListPokemonRepository.getPokemonsForInternalList(entry)) {
            return true;
        }
        const keys = await this.getListKeys(); // ou la méthode équivalente côté Supabase/localStorage
        return keys.filter((key) => key.slug === entry.slug).length > 0;
    }

    async addSlugToList(entry: LabelEntry | { slug: string }, slug: PokemonSlug): Promise<void> {
        if (this._supabaseService.isLoggedIn()) {
            const userId = this._supabaseService.getUserId();

            // Ajout unitaire (le trio unique configuré en BDD empêche les doublons)
            await this._supabaseService.client.from('list_pokemons').upsert({
                user_id: userId,
                list_slug: entry.slug,
                slug_pokemon: slug,
            });
        } else {
            // Fallback LocalStorage : on ajoute seulement si le slug n'y est pas déjà
            const currentSlugs = this._localStorageService.get<PokemonSlug[]>(entry.slug, []);
            if (!currentSlugs.includes(slug)) {
                this._localStorageService.set(entry.slug, [...currentSlugs, slug]);
            }
        }
    }

    async removeSlugFromList(entry: LabelEntry | { slug: string }, slug: PokemonSlug): Promise<void> {
        if (this._supabaseService.isLoggedIn()) {
            const userId = this._supabaseService.getUserId();

            // Suppression ciblée du Pokémon via le trio de critères
            await this._supabaseService.client
                .from('list_pokemons')
                .delete()
                .eq('user_id', userId)
                .eq('list_slug', entry.slug)
                .eq('slug_pokemon', slug);
        } else {
            // Fallback LocalStorage : on filtre pour retirer le slug
            const currentSlugs = this._localStorageService.get<PokemonSlug[]>(entry.slug, []);
            const updatedSlugs = currentSlugs.filter((s) => s !== slug);
            this._localStorageService.set(entry.slug, updatedSlugs);
        }
    }

    async saveListKeys(entries: LabelEntry[]): Promise<void> {
        if (this._supabaseService.isLoggedIn()) {
            const userId = this._supabaseService.getUserId();
            await this._supabaseService.client
                .from('user_data')
                .upsert({ user_id: userId, list_keys: entries }, { onConflict: 'user_id' });
        } else {
            this._localStorageService.set(LOCAL_STORAGE_KEEP_KEYS, entries);
        }
    }

    async deleteList(entry: LabelEntry | { slug: string }): Promise<void> {
        if (this._supabaseService.isLoggedIn()) {
            const userId = this._supabaseService.getUserId();
            await this._supabaseService.client
                .from('list_pokemons')
                .delete()
                .eq('user_id', userId)
                .eq('list_slug', entry.slug);
            const keys = await this.getListKeys();
            const updatedKeys = keys.filter((k) => k.slug !== entry.slug);
            await this.saveListKeys(updatedKeys);
        } else {
            const keys = await this.getListKeys();
            const updatedKeys = keys.filter((k) => k.slug !== entry.slug);
            await this.saveListKeys(updatedKeys);
            this._localStorageService.remove(entry.slug);
        }
    }
}
