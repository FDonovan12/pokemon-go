import { httpResource, HttpResourceRef } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Brand, TypePokemon } from '@entities/pokemon';
import { createLookup } from '@shared/utils/create-lookup';

export type FastMovePokemon = Brand<string, 'FastMovePokemon'>;
export type CinematicMovePokemon = Brand<string, 'CinematicMovePokemon'>;
export interface FastMove {
    id: string;
    movementId: FastMovePokemon;
    pokemonType: TypePokemon;
    power: number;
    durationMs: number;
    energyDelta: number;
    vfxName: string;
    names: { fr: string };
}
export interface CinematicMove {
    id: string;
    movementId: CinematicMovePokemon;
    pokemonType: TypePokemon;
    power: number;
    durationMs: number;
    energyDelta: number;
    vfxName: string;
    names: { fr: string };
}

@Injectable({
    providedIn: 'root',
})
export class MoveRepository {
    private fastMoveResource: HttpResourceRef<Record<FastMovePokemon, FastMove> | undefined> = httpResource(
        () => 'https://raw.githubusercontent.com/FDonovan12/pokemon-go-api/output/raidMove/fast-move.json',
    );
    fastMove = createLookup(this.fastMoveResource.value);

    private cinematicMoveResource: HttpResourceRef<Record<CinematicMovePokemon, CinematicMove> | undefined> =
        httpResource(
            () => 'https://raw.githubusercontent.com/FDonovan12/pokemon-go-api/output/raidMove/charged-move.json',
        );
    cinematicMove = createLookup(this.cinematicMoveResource.value);
}
