import { inject, Injectable, signal, Signal } from '@angular/core';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { FilterService } from '@services/filter-service/filter-service';
import { LocalStorageService } from '@services/local-storage-service/local-storage-service';
import { FilterItem } from './filter.model';

const FILTERS_STORAGE_KEY = 'user_filters';

@Injectable({
    providedIn: 'root',
})
export class FiltersRepository {
    private readonly filterService = inject(FilterService);
    private readonly localStorageService = inject(LocalStorageService);
    private readonly pokemonRepository = inject(PokemonRepository);

    private readonly onlySavagePokemons = ' & !raid & !éclos & !étude & !dynamax & !gigamax & ';

    private readonly defaultFilters: FilterItem[] = [
        {
            label: 'IV PVP 1 ',
            query: this.filterService.buildFilter({ and: ['2-pv', '2-défense', '-1attaque'] }),
        },
        {
            label: 'IV PVP 2 ',
            query: this.filterService.buildFilter({ and: ['3-pv', '3-défense', '-2attaque'] }),
        },
        {
            label: 'Filtre level 1',
            query:
                this.onlySavagePokemons +
                ' & 2-attaque, -1défense & 2-attaque, -1pv & -1défense, -1pv & 0*, 1*, 2* & !# & âge0 & pc-100 & ',
        },
        {
            label: 'Filtre level 2',
            query: this.onlySavagePokemons + ' & 2-attaque, -1défense, -1pv & 0*, 1*, 2* & !# & âge0 & pc-100 & ',
        },
        {
            label: 'Filtre level 3',
            query: this.onlySavagePokemons + ' & 2-attaque, -2défense, -2pv & 0*, 1*, 2* & !# & âge0 & pc-100 & ',
        },
        {
            label: 'Filtre level 4',
            query: this.onlySavagePokemons + ' & 0*, 1*, 2* & !# & âge0 & pc-100 & ',
        },
        {
            label: 'Starter',
            query: this.filterService.buildAllPokemonFamily(this.pokemonRepository.starterPokemon),
        },
    ];

    private userFiltersSignal = signal<FilterItem[]>([]);

    constructor() {
        this.loadFilters();
    }

    getFilters(): Signal<FilterItem[]> {
        return this.userFiltersSignal.asReadonly();
    }

    addFilter(filter: FilterItem): void {
        const currentFilters = this.userFiltersSignal();
        this.userFiltersSignal.set([...currentFilters, filter]);
        this.saveFilters();
    }

    removeFilter(index: number): void {
        const currentFilters = this.userFiltersSignal();
        const updatedFilters = currentFilters.filter((_, i) => i !== index);
        this.userFiltersSignal.set(updatedFilters);
        this.saveFilters();
    }

    removeFilterByLabel(label: string): void {
        const currentFilters = this.userFiltersSignal();
        const updatedFilters = currentFilters.filter((filter) => filter.label !== label);
        this.userFiltersSignal.set(updatedFilters);
        this.saveFilters();
    }

    private loadFilters(): void {
        const savedFilters = this.localStorageService.get<FilterItem[]>(FILTERS_STORAGE_KEY, this.defaultFilters);
        this.userFiltersSignal.set(savedFilters);
    }

    private saveFilters(): void {
        this.localStorageService.set(FILTERS_STORAGE_KEY, this.userFiltersSignal());
    }

    resetUserFilters(): void {
        this.userFiltersSignal.set([]);
        this.localStorageService.remove(FILTERS_STORAGE_KEY);
    }
}
