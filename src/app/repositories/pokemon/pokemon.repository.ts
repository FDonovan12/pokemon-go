import { Injectable } from '@angular/core';
import { PokemonInterface } from '@entities/pokemon';
import pokemonsData from 'app/bdd/bdd-pokemons.json';
import { pokemonFamilyName } from 'app/bdd/family-pokemon-name';
import { megaPokemon } from 'app/bdd/mega-pokemon';
import { pokemonsListHomeMade } from '../../bdd/bdd-home-made';
import { familyPokemon } from 'app/bdd/family-pokemon';

const pokemonsList = pokemonsData as PokemonInterface[];

type PokemonHomeMade = (typeof pokemonsListHomeMade)[number];

type PokemonIndex = {
    byId: Record<PokemonInterface['id'], PokemonInterface>;
    byName: Record<PokemonInterface['slug'], PokemonInterface>;
};
@Injectable({
    providedIn: 'root',
})
export class PokemonRepository {
    private buildPokemonIndex = (
        listFromAPI: PokemonInterface[],
        listHomemade: readonly PokemonHomeMade[] = [],
    ): PokemonIndex => {
        // console.log(this.enrichPokemonsGenerationAndFamily(listFromAPI));
        const list = [...listFromAPI, ...listHomemade] as PokemonInterface[];

        return {
            byId: Object.fromEntries(list.map((p) => [p.id, p])) as Record<PokemonInterface['id'], PokemonInterface>,
            byName: Object.fromEntries(list.map((p) => [p.slug, p])) as Record<
                PokemonInterface['slug'],
                PokemonInterface
            >,
        };
    };
    pokemonIndex = this.buildPokemonIndex(pokemonsList, pokemonsListHomeMade);

    pokemonFamilyName = pokemonFamilyName;
    pokemonFamily = familyPokemon;

    starterPokemon = [
        this.pokemonIndex.byName.Bulbizarre,
        this.pokemonIndex.byName.Salameche,
        this.pokemonIndex.byName.Carapuce,
        this.pokemonIndex.byName.Germignon,
        this.pokemonIndex.byName.Hericendre,
        this.pokemonIndex.byName.Kaiminus,
        this.pokemonIndex.byName.Arcko,
        this.pokemonIndex.byName.Poussifeu,
        this.pokemonIndex.byName.Tortipouss,
        this.pokemonIndex.byName.Ouisticram,
        this.pokemonIndex.byName.Tiplouf,
        this.pokemonIndex.byName.Gobou,
        this.pokemonIndex.byName.Vipelierre,
        this.pokemonIndex.byName.Gruikui,
        this.pokemonIndex.byName.Moustillon,
        this.pokemonIndex.byName.Marisson,
        this.pokemonIndex.byName.Feunnec,
        this.pokemonIndex.byName.Grenousse,
        this.pokemonIndex.byName.Brindibou,
        this.pokemonIndex.byName.Flamiaou,
        this.pokemonIndex.byName.Otaquin,
        this.pokemonIndex.byName.Ouistempo,
        this.pokemonIndex.byName.Flambino,
        this.pokemonIndex.byName.Larmeleon,
        this.pokemonIndex.byName.Chochodile,
        this.pokemonIndex.byName.Poussacha,
        this.pokemonIndex.byName.Coiffeton,
    ];

    megaList = this.buildMegaList();

    private buildMegaList(): PokemonInterface[] {
        const listBase = megaPokemon;
        return listBase as PokemonInterface[];
    }
    async enrichPokemonsGenerationAndFamily(pokemons: PokemonInterface[]): Promise<PokemonInterface[]> {
        const base = 'https://pokeapi.co/api/v2';

        for (const p of pokemons) {
            console.log('pokemon : ', p.id, p.slug);
            try {
                const speciesRes = await fetch(`${base}/pokemon-species/${p.id}`);
                if (!speciesRes.ok) continue;
                const species = await speciesRes.json();

                // Génération (extraction du numéro depuis l'URL)
                const genUrl: string = species.generation.url;
                const genMatch = genUrl.match(/generation\/(\d+)\//);
                p.generation = genMatch ? parseInt(genMatch[1], 10) : 0;

                // Récupère la chaîne d’évolution
                const evoChainUrl: string = species.evolution_chain.url;
                const evoRes = await fetch(evoChainUrl);
                if (!evoRes.ok) continue;
                const evoData = await evoRes.json();

                // Trouver l'espèce de base (anglais)
                const baseSpeciesName: string = evoData.chain.species.name;

                // Appel pour obtenir le nom français de l'espèce de base
                const baseSpeciesRes = await fetch(`${base}/pokemon-species/${baseSpeciesName}`);
                if (!baseSpeciesRes.ok) continue;
                const baseSpecies = await baseSpeciesRes.json();

                const frName = baseSpecies.names.find((n: any) => n.language.name === 'fr')?.name;
                if (!frName) continue;

                // Slugify + capitalize (selon ton projet)
                p.family = frName.slugify().capitalize();
            } catch {
                continue;
            }
        }
        console.log(pokemons);
        return pokemons;
    }
}
