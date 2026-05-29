import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PokemonInterface } from '@entities/pokemon';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { ClipboardService } from '@services/clipboard-service/clipboard-service';
import { EventPokemon } from '../../entities/event';
import { EventRepository } from '../../repositories/event/event.repository';
import { ListPokemonPageStore } from '../list-pokemon-page/list-store/list-pokemon-page.store';
import { FiltersRepository, FilterItem } from '@repositories/filters-repository/filters.repository';
import { ToastService } from 'app/shared/features/toast/toast.service';

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
    private readonly bddEvent = inject(EventRepository);
    private readonly filtersRepository = inject(FiltersRepository);
    protected readonly keepStore = inject(ListPokemonPageStore);
    protected readonly clipboardService = inject(ClipboardService);
    private readonly toastService = inject(ToastService);

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

    filters = this.filtersRepository.getFilters();

    // Popup state
    showAddFilterPopup = signal(false);
    newFilterLabel = signal('');
    newFilterQuery = signal('');

    ngOnInit(): void {
        // this.getData();
    }

    openAddFilterPopup(): void {
        this.newFilterLabel.set('');
        this.newFilterQuery.set('');
        this.showAddFilterPopup.set(true);
    }

    closeAddFilterPopup(): void {
        this.showAddFilterPopup.set(false);
    }

    addNewFilter(): void {
        const label = this.newFilterLabel().trim();
        const query = this.newFilterQuery().trim();

        if (label && query) {
            this.filtersRepository.addFilter({ label, query } as FilterItem);
            this.toastService.prepare('✓ Succès', `Filtre "${label}" ajouté`).showSuccess();
            this.closeAddFilterPopup();
        }
    }

    removeFilter(index: number): void {
        const filter = this.filters()[index];
        this.toastService
            .prepare('Confirmation', `Êtes-vous sûr de vouloir supprimer le filtre "${filter.label}" ?`)
            .showConfirmation(
                () => {
                    this.filtersRepository.removeFilter(index);
                    this.toastService.prepare('✓ Supprimé', 'Filtre supprimé avec succès').showSuccess();
                },
                () => {
                    // Annulation, ne rien faire
                }
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
