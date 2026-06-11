import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal, Signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PokemonInterface } from '@entities/pokemon';
import { FilterItem, FilterItemResolved, FiltersFacade } from '@repositories/filters-repository';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { ClipboardService } from '@services/clipboard-service/clipboard-service';
import { EventPokemon } from '../../entities/event';
import { EventRepository } from '../../repositories/event/event.repository';
import { ListPokemonPageStore } from '../list-pokemon-page/list-store/list-pokemon-page.store';
import { AddFilterComponent } from './add-filter/add-filter.component';
import { ToastService } from '@shared/features/toast/toast.service';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [RouterLink, DatePipe, AddFilterComponent, FormsModule],
    templateUrl: './home.component.html',

    styleUrl: './home.component.css',
})
export class HomeComponent {
    private readonly httpClient = inject(HttpClient);
    private readonly getAllService = inject(PokemonRepository);
    private readonly bddEvent = inject(EventRepository);
    private readonly filtersFacade = inject(FiltersFacade);
    protected readonly keepStore = inject(ListPokemonPageStore);
    protected readonly clipboardService = inject(ClipboardService);
    private readonly toastService = inject(ToastService);

    today = new Date();

    @ViewChild(AddFilterComponent) addFilterComponent!: AddFilterComponent;
    filterToEdit = signal<FilterItem | undefined>(undefined);

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

    filters = this.filtersFacade.getFiltersResolved();

    ngOnInit(): void {
        // this.getData();
    }

    editFilter(filter: FilterItemResolved) {
        const original = this.filtersFacade.getFilterById(filter.id);
        this.filterToEdit.set(original);
        this.addFilterComponent.openAddFilterPopup();
    }

    removeFilter(filter: FilterItemResolved): void {
        this.toastService
            .prepare('Confirmation', `Êtes-vous sûr de vouloir supprimer le filtre "${filter.label}" ?`)
            .showConfirmation(
                () => {
                    this.filtersFacade.removeFilter(filter);
                    this.toastService.prepare('✓ Supprimé', 'Filtre supprimé avec succès').showSuccess();
                },
                () => {
                    // Annulation, ne rien faire
                },
            );
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
