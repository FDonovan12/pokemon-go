import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PokemonInterface } from '@entities/pokemon';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { ClipboardService } from '@services/clipboard-service/clipboard-service';
import { FilterService } from '@services/filter-service/filter-service';
import { EventPokemon } from '../../entities/event';
import { EventRepository } from '../../repositories/event/event.repository';
import { KeepStore } from './../keep-pokemon-pages/keep-store/keep-store';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [RouterLink, DatePipe, FormsModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
})
export class HomeComponent {
    private readonly httpClient = inject(HttpClient);
    private readonly getAllService = inject(PokemonRepository);
    readonly bddEvent = inject(EventRepository);
    readonly filterService = inject(FilterService);
    readonly keepStore = inject(KeepStore);
    readonly clipboardService = inject(ClipboardService);

    today = new Date();

    getName(pokemon: PokemonInterface | string): string {
        if (!pokemon) return '';
        return typeof pokemon === 'string' ? pokemon : pokemon.name;
    }
    pokemonsList = this.getAllService.pokemonIndex;

    private readonly pokemons = this.getAllService.pokemonIndex.byName;

    pastDays: Signal<number> = signal(10);

    pastEvents: Signal<EventPokemon[]> = computed(() =>
        this.bddEvent
            .getAllEventsPokemon()
            .filter(
                (event) =>
                    new Date(Date.now() - this.pastDays() * 86400000) <= event.endAt && event.endAt <= new Date(),
            )
            .slice()
            .sort((a, b) => (a.startAt <= b.startAt ? -1 : 1)),
    );

    currentEvents: Signal<EventPokemon[]> = computed(() =>
        this.bddEvent
            .getAllEventsPokemon()
            .filter((event) => new Date() <= event.endAt && new Date() >= event.startAt)
            .slice()
            .sort((a, b) => (a.startAt <= b.startAt ? -1 : 1)),
    );

    futureEvents: Signal<EventPokemon[]> = computed(() =>
        this.bddEvent
            .getAllEventsPokemon()
            .filter((event) => new Date() <= event.startAt)
            .slice()
            .sort((a, b) => (a.startAt <= b.startAt ? -1 : 1)),
    );

    private readonly onlySavagePokemons = ' & !raid & !éclos & !étude & !dynamax & !gigamax & ';

    baseFilters = [
        { label: 'IV PVP 1 ', query: this.filterService.buildFilter({ and: ['2-pv', '2-défense', '-1attaque'] }) },
        { label: 'IV PVP 2 ', query: this.filterService.buildFilter({ and: ['3-pv', '3-défense', '-2attaque'] }) },
        // {
        //     label: 'IV PVP 3 ',
        //     query: this.filterService.buildFilter({
        //         or: [{ and: ['2-pv', '2-défense', '-1attaque'] }, { and: ['3-pv', '3-défense', '-2attaque'] }],
        //     }),
        // },
        // {
        //     label: 'IV PVP 3 ',
        //     query: this.filterService.buildFilterString({
        //         or: [{ and: ['2-pv', '2-défense', '-1attaque'] }, { and: ['3-pv', '3-défense', '-2attaque'] }],
        //     }),
        // },

        // {
        //     label: 'Filtre level and',
        //     query: this.filterService.test({ not: { and: ['bleu', 'rond'] } }).toString(),
        // },
        // {
        //     label: 'Filtre level or',
        //     query: this.filterService.test({ not: { or: ['bleu', 'rond'] } }).toString(),
        // },
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
        { label: 'Filtre level 4', query: this.onlySavagePokemons + ' & 0*, 1*, 2* & !# & âge0 & pc-100 & ' },
        {
            label: 'Starter',
            query: this.filterService.buildAllPokemon(this.getAllService.starterPokemon),
        },
        {
            label: 'Filtre transfert',
            query: ' & !dynamax & !gigamax & !légendaire & !favoris & !costume & !chromatique & ',
        },
    ];

    filters = [...this.baseFilters];

    ngOnInit(): void {
        // this.getData();
    }

    public getData() {
        this.httpClient.get('https://pokebuildapi.fr/api/v1/pokemon').subscribe((data: any) => {
            const test = data.map((pokemon: any) => {
                return {
                    id: pokemon.id,
                    name: pokemon.name,
                    image: pokemon.image,
                    sprite: pokemon.sprite,
                    slug: pokemon.slug,
                    type: pokemon.apiTypes.map((type: any) => type.name),
                };
            });
            const pokemonMap = test.reduce(
                (acc: any, pokemon: any) => {
                    acc[pokemon.slug] = pokemon;
                    return acc;
                },
                {} as Record<string, (typeof test)[number]>,
            );
        });
    }
}
