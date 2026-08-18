import { Component, computed, inject, input } from '@angular/core';
import { PokemonData } from '@entities/pokemon';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { ImagePokemon } from '@shared/components/image-pokemon/image-pokemon';
import { PokemonSelectComponent } from '@shared/features/pokemon-search/pokemon-select/pokemon-select.component';
import { createExpandableSet } from '@shared/utils/utils';
import { findStatMatches, hasNoPrerequisites } from '../stat-finder.calc';
import { CardPrerequisites } from '../stat-finder.types';
import { StatFinderPageStore } from '../stats-finder-store/stat-finder-page.store';
import { PrerequisitesFormComponent } from './prerequisites-form.component/prerequisites-form.component';

@Component({
    selector: 'app-stat-finder-card',
    standalone: true,
    imports: [PokemonSelectComponent, PrerequisitesFormComponent, ImagePokemon],
    templateUrl: './stat-finder-card.component.html',
    styleUrl: './stat-finder-card.component.css',
})
export class StatFinderCardComponent {
    cardId = input.required<string>();

    private _pageStore = inject(StatFinderPageStore);
    private _pokemonRepository = inject(PokemonRepository);

    protected expandable = createExpandableSet<string>(); // clé = pokemon.slug

    entry = computed(() => this._pageStore.cards().find((c) => c.id === this.cardId())!);

    resultsByPokemon = computed(() => {
        const { pokemonSlugs, prerequisites } = this.entry();
        // const allPokemons = this._pokemonRepository.allDifferentFormPokemonsSetting.value();
        // if (allPokemons.length === 0) return;
        // const pokemons = pokemonSlugs.map((slug) => allPokemons.find((pokemon) => pokemon.slug === slug)!);
        const pokemons = this._pokemonRepository.getManyPokemonSettingBySlug(pokemonSlugs);
        if (hasNoPrerequisites(prerequisites)) {
            return pokemons.map((pokemon) => ({
                pokemon,
                slug: pokemon.slug,
                name: pokemon?.name ?? pokemon.slug,
                matches: [],
            }));
        }
        const cpms = this._pokemonRepository.cpMultiplier.value();
        if (!cpms) {
            return pokemons.map((pokemon) => ({
                pokemon,
                slug: pokemon.slug,
                name: pokemon?.name ?? pokemon.slug,
                matches: [],
            }));
        }
        return pokemons.map((pokemon) => {
            const matches = (pokemon ? findStatMatches(pokemon.stats, cpms, prerequisites) : [])
                .sortAsc('cp')
                .sortDesc('level');
            return { pokemon, slug: pokemon.slug, name: pokemon?.name ?? pokemon.slug, matches };
        });
    });

    addPokemon(pokemon: PokemonData) {
        this._pageStore.updateCard(this.cardId(), {
            pokemonSlugs: [...this.entry().pokemonSlugs, pokemon.slug],
        });
    }

    removePokemon(slug: string) {
        this._pageStore.updateCard(this.cardId(), {
            pokemonSlugs: this.entry().pokemonSlugs.filter((s) => s !== slug),
        });
    }

    updatePrerequisites(partial: Partial<CardPrerequisites>) {
        this._pageStore.updateCard(this.cardId(), {
            prerequisites: { ...this.entry().prerequisites, ...partial },
        });
    }

    removeCard() {
        this._pageStore.removeCard(this.cardId());
    }
}
