import { Injectable, inject } from '@angular/core';
import { LabelEntry } from '@entities/label';
import { FILTERS_STORAGE_KEY } from '@repositories/filters-repository';
import { LOCAL_STORAGE_KEEP_KEYS } from '@repositories/list-pokemon-repository/list-pokemon.repository';
import { LOCAL_STORAGE_PVP_RANK } from '@repositories/pvp-rank-repository/pvp-rank.repository';
import { LocalStorageService } from '@services/local-storage-service/local-storage-service';
import { SupabaseService } from '@services/supabase-service/supabase.service';

const SYNC_ALREADY_MADE_KEY = 'sync-already-made';
@Injectable({ providedIn: 'root' })
export class DataSyncService {
    private readonly supabaseService = inject(SupabaseService);
    private readonly localStorageService = inject(LocalStorageService);

    constructor() {
        this.supabaseService.client.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN') {
                await this.syncIfFirstLogin(session);
            }
        });
    }

    private async syncIfFirstLogin(session: any): Promise<void> {
        const SyncWasMade = this.localStorageService.get(SYNC_ALREADY_MADE_KEY, false);
        if (SyncWasMade) return; // données déjà en BDD, pas un premier login

        const pvpRanks = this.localStorageService.get(LOCAL_STORAGE_PVP_RANK, {});
        const listKeys = this.localStorageService.get<LabelEntry[]>(LOCAL_STORAGE_KEEP_KEYS, []);
        const filters = this.localStorageService.get(FILTERS_STORAGE_KEY, []);

        const test = await this.supabaseService.client.from('user_data').upsert(
            {
                user_id: session.user.id,
                pvp_ranks: pvpRanks,
                list_keys: listKeys,
                filters: filters,
            },
            { ignoreDuplicates: true },
        );

        // migration list_pokemons
        for (const entry of listKeys) {
            const slugs = this.localStorageService.get(entry.slug, []);
            if (slugs.length) {
                await this.supabaseService.client.from('list_pokemons').upsert(
                    slugs.map((slug: string) => ({
                        user_id: session.user.id,
                        list_slug: entry.slug,
                        slug_pokemon: slug,
                    })),
                    { ignoreDuplicates: true },
                );
            }
        }

        // vide le local
        // this.localStorageService.remove(LOCAL_STORAGE_PVP_RANK);
        // this.localStorageService.remove(LOCAL_STORAGE_KEEP_KEYS);
        // this.localStorageService.remove(FILTERS_STORAGE_KEY);
        // listKeys.forEach((entry: LabelEntry) => this.localStorageService.remove(entry.slug));
        this.localStorageService.set(SYNC_ALREADY_MADE_KEY, true);
    }
}
