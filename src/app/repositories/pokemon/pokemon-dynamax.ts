import { httpResource, HttpResourceRef } from '@angular/common/http';
import { computed, Injectable } from '@angular/core';
import { Dynamax, DynamaxApiEntry } from '@entities/pokemon';

@Injectable({
    providedIn: 'root',
})
export class PokemonDynamaxRepository {
    private dynamax: HttpResourceRef<DynamaxApiEntry[]> = httpResource(
        () => 'https://raw.githubusercontent.com/FDonovan12/pokemon-go-api/output/dynamax.json',
        { defaultValue: [] },
    );
    finalDynamax = computed(() => this.dynamax.value().map((entry) => this.toDynamaxInstance(entry)));

    private toDynamaxInstance(entry: DynamaxApiEntry): Dynamax {
        return new Dynamax(entry);
    }
}
