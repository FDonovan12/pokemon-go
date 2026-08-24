import { httpResource, HttpResourceRef } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Brand, TypePokemon } from '@entities/pokemon';
import { ToastService } from '@shared/features/toast/toast.service';
import { createLookup } from '@shared/utils/create-lookup';

export type FastMovePokemon = Brand<string, 'FastMovePokemon'>;
export interface FastMove {
    id: string;
    movementId: FastMovePokemon;
    pokemonType: TypePokemon;
    power?: number;
    durationMs: number;
    energyDelta?: number;
    vfxName: string;
}

@Injectable({
    providedIn: 'root',
})
export class MoveRepository {
    private readonly _toastService: ToastService = inject(ToastService);

    private fastMoveResource: HttpResourceRef<Record<FastMovePokemon, FastMove> | undefined> = httpResource(
        () => 'https://raw.githubusercontent.com/FDonovan12/pokemon-go-api/output/raidMove/fast-move.json',
    );
    fastMove = createLookup(this.fastMoveResource.value);
}
