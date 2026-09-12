import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { Component, computed, inject, input } from '@angular/core';
import { Base, PokemonSlug } from '@entities/pokemon';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { ImagePokemon } from '@shared/components/image-pokemon/image-pokemon';
import { PokemonSelectComponent } from '@shared/features/pokemon-search/pokemon-select/pokemon-select.component';
import { createExpandableSet } from '@shared/utils/utils';
import { hasNoPrerequisites, StatFinderCalcService } from '../stat-finder.calc';
import { CardEntry, CardPrerequisites } from '../stat-finder.types';
import { StatFinderPageStore } from '../stats-finder-store/stat-finder-page.store';
import { PrerequisitesFormComponent } from './prerequisites-form.component/prerequisites-form.component';

@Component({
    selector: 'app-stat-finder-card',
    standalone: true,
    imports: [PokemonSelectComponent, PrerequisitesFormComponent, ImagePokemon, CdkDragHandle],
    templateUrl: './stat-finder-card.component.html',
    styleUrl: './stat-finder-card.component.css',
})
export class StatFinderCardComponent {
    card = input.required<CardEntry>();

    private _pageStore = inject(StatFinderPageStore);
    private _pokemonRepository = inject(PokemonRepository);
    private _statFinderCalcService = inject(StatFinderCalcService);

    protected expandable = createExpandableSet<PokemonSlug>();
    protected isCollapsed = computed(() => this.card().isCollapsed);

    protected searchModeText = computed(() =>
        this.card().searchMode === 'global' ? '🌍 Tous les Pokémon' : '🎯 Sélection manuelle',
    );

    toggleCollapse() {
        this._pageStore.updateCard(this.card().id, { isCollapsed: !this.card().isCollapsed });
    }
    resultsByPokemon = computed(() => {
        const { pokemonSlugs, prerequisites, searchMode } = this.card();

        const pokemons =
            searchMode === 'global'
                ? this._pokemonRepository.differentForm.getAll()
                : this._pokemonRepository.differentForm.getMany(pokemonSlugs);

        if (hasNoPrerequisites(prerequisites)) {
            return pokemons.map((pokemon) => ({
                pokemon,
                slug: pokemon.slug,
                name: pokemon?.name ?? pokemon.slug,
                matches: [],
            }));
        }
        const results = pokemons.map((pokemon) => {
            const matches = (pokemon ? this._statFinderCalcService.findStatMatches(pokemon.stats, prerequisites) : [])
                .sortAsc('cp')
                .sortDesc('level');
            return { pokemon, slug: pokemon.slug, name: pokemon?.name ?? pokemon.slug, matches };
        });

        return searchMode === 'global' ? results.filter((r) => r.matches.length > 0) : results;
    });

    addPokemon(pokemon: Base) {
        this._pageStore.updateCard(this.card().id, {
            pokemonSlugs: [...this.card().pokemonSlugs, pokemon.slug],
        });
    }

    removePokemon(slug: string) {
        this._pageStore.updateCard(this.card().id, {
            pokemonSlugs: this.card().pokemonSlugs.filter((s) => s !== slug),
        });
    }

    onNameChange(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this._pageStore.updateCard(this.card().id, { name: value });
    }

    updatePrerequisites(partial: Partial<CardPrerequisites>) {
        this._pageStore.updateCard(this.card().id, {
            prerequisites: { ...this.card().prerequisites, ...partial },
        });
    }

    toggleSearchMode() {
        this._pageStore.updateCard(this.card().id, {
            searchMode: this.card().searchMode === 'global' ? 'manual' : 'global',
        });
    }

    removeCard() {
        this._pageStore.removeCard(this.card().id);
    }
}
