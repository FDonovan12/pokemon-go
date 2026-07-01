import { Injectable, inject, resource } from '@angular/core';
import { PokemonSlug } from '@entities/pokemon';
import { LocalStorageService } from '@services/local-storage-service/local-storage-service';
import { SupabaseService } from '@services/supabase-service/supabase.service';
import { PvpRank } from '../../pages/pvp-rank/pvp-rank-store/pvp-rank-store';

export const LOCAL_STORAGE_PVP_RANK = 'pokemon-pvp_rank';

@Injectable({ providedIn: 'root' })
export class PvpRankRepository {
    private readonly localStorageService = inject(LocalStorageService);
    private readonly supabaseService = inject(SupabaseService);

    readonly pvpRankResource = resource({
        params: () => (this.supabaseService.isLoggedIn() ? true : undefined),
        loader: async () => {
            const remote = await this.loadFromSupabase();
            this.saveToLocal(remote);
            return remote;
        },
        defaultValue: this.loadFromLocal(),
    });

    async savePVPRank(ranks: Map<PokemonSlug, PvpRank>): Promise<void> {
        this.saveToLocal(ranks);

        if (this.supabaseService.isLoggedIn()) {
            await this.saveToSupabase(ranks);
        }
    }

    private loadFromLocal(): Map<PokemonSlug, PvpRank> {
        const object = this.localStorageService.get(LOCAL_STORAGE_PVP_RANK, {});
        return new Map(Object.entries(object) as [PokemonSlug, PvpRank][]);
    }

    private async loadFromSupabase(): Promise<Map<PokemonSlug, PvpRank>> {
        const { data } = await this.supabaseService.client.from('user_data').select('pvp_ranks').single();
        if (!data) return new Map();
        return new Map(Object.entries(data.pvp_ranks) as [PokemonSlug, PvpRank][]);
    }

    private saveToLocal(ranks: Map<PokemonSlug, PvpRank>): void {
        this.localStorageService.set(LOCAL_STORAGE_PVP_RANK, ranks.toObject());
    }

    private async saveToSupabase(ranks: Map<PokemonSlug, PvpRank>): Promise<void> {
        const userId = this.supabaseService.getUserId();
        console.log(userId);
        await this.supabaseService.client
            .from('user_data')
            .upsert({ user_id: userId, pvp_ranks: ranks.toObject() }, { onConflict: 'user_id' });
    }
}
