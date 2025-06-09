import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PokemonInterface, typePokemon } from '@entities/pokemon';
import pokemonsData from 'app/bdd/bdd-pokemons-copy.json';
import { pokemonsListHomeMade } from '../../bdd/bdd-home-made';

const pokemonsList = pokemonsData as PokemonInterface[];

type PokemonHomeMade = (typeof pokemonsListHomeMade)[number];

type PokemonIndex = {
    byId: Record<PokemonInterface['id'], PokemonInterface>;
    byName: Record<PokemonInterface['slug'], PokemonInterface>;
};
@Injectable({
    providedIn: 'root',
})
export class PokemonAPIRepository {
    private readonly httpClient: HttpClient = inject(HttpClient);

    update(pokemon: PokemonInterface) {
        pokemon.type = pokemon.type.map(this.updateType);
        let newId = pokemon.id;
        if (pokemon.sprite) {
            const string = pokemon.sprite.split('/').last()?.split('.')[0];
            newId = +string!;
        }
        pokemon.id = +newId;
        pokemon.image = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${newId}.png`;
        pokemon.sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${newId}.png`;

        if (pokemon.alternatives) {
            for (let [key, object] of Object.entries(pokemon.alternatives)) {
                this.update(object);
            }
        }
        return pokemon;
    }

    updateAlternative(pokemon: PokemonInfo): any {
        if (!pokemon.alternatives) return pokemon;

        const record: Record<string, PokemonInfo> = {};

        for (const alt of pokemon.alternatives) {
            record[alt.slug] = alt;
        }

        return {
            ...pokemon,
            alternatives: record as Record<'Gmax' | 'Galar' | string, PokemonInfo>,
        } as any;
    }

    updateType(type: string): typePokemon {
        switch (type.toLowerCase()) {
            case 'normal':
                return 'Normal';
            case 'fire':
                return 'Feu';
            case 'water':
                return 'Eau';
            case 'electric':
                return 'Électrik';
            case 'grass':
                return 'Plante';
            case 'ice':
                return 'Glace';
            case 'fighting':
                return 'Combat';
            case 'poison':
                return 'Poison';
            case 'ground':
                return 'Sol';
            case 'flying':
                return 'Vol';
            case 'psychic':
                return 'Psy';
            case 'bug':
                return 'Insecte';
            case 'rock':
                return 'Roche';
            case 'ghost':
                return 'Spectre';
            case 'dragon':
                return 'Dragon';
            case 'dark':
                return 'Ténèbres';
            case 'steel':
                return 'Acier';
            case 'fairy':
                return 'Fée';
            default:
                return type as typePokemon;
        }
    }

    public getData() {
        this.httpClient.get('https://pokebuildapi.fr/api/v1/pokemon').subscribe((data: any) => {
            console.log(data);
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
            console.log(test);
            const pokemonMap = test.reduce(
                (acc: any, pokemon: any) => {
                    acc[pokemon.slug] = pokemon;
                    return acc;
                },
                {} as Record<string, (typeof test)[number]>,
            );
            console.log(pokemonMap);
        });
    }

    async fetchAllPokemon(limit = 1030): Promise<PokemonInfo[]> {
        const base = 'https://pokeapi.co/api/v2';
        const listRes = await fetch(`${base}/pokemon?limit=${limit}`);
        const listData = await listRes.json();

        const results: PokemonInfo[] = [];

        for (let i = 0; i < listData.results.length; i++) {
            console.log(i);
            const entry = listData.results[i];
            // extraire l'id
            const match = entry.url.match(/\/pokemon\/(\d+)\//);
            if (!match) continue;
            const id = +match[1];

            try {
                const [pokeRes, speciesRes] = await Promise.all([
                    fetch(`${base}/pokemon/${id}`),
                    fetch(`${base}/pokemon-species/${id}`),
                ]);

                if (!pokeRes.ok || !speciesRes.ok) throw new Error();

                const poke = await pokeRes.json();
                const species = await speciesRes.json();

                // nom français
                const frName = species.names.find((n: any) => n.language.name === 'fr')?.name || species.name;

                const slug = frName.slugify().capitalize();

                const types = poke.types.map((t: any) => t.type.name);

                const info: PokemonInfo = {
                    id,
                    name: frName,
                    slug,
                    image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
                    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
                    type: types,
                    isLegendary: species.is_legendary,
                    isMythical: species.is_mythical,
                };

                // traitera les méga-évolutions
                const megaVariety = species.varieties.find((v: any) => v.pokemon.name.includes('mega'));
                if (megaVariety) {
                    const megaPoke = await (await fetch(megaVariety.pokemon.url)).json();
                    info.mega = {
                        id: megaPoke.id,
                        type: megaPoke.types.map((t: any) => t.type.name),
                    };
                }

                // traiter les formes alternatives (variétés autres que default/mega)
                const altVars = species.varieties.filter((v: any) => !v.is_default && !v.pokemon.name.includes('mega'));

                if (altVars.length) {
                    info.alternatives = [];
                    for (const v of altVars) {
                        const altPoke = await (await fetch(v.pokemon.url)).json();
                        // extraire forme (ex: "galar")
                        const formMatch = v.pokemon.name.replace(species.name + '-', '');
                        const formSlug = formMatch.slugify().capitalize();

                        info.alternatives.push({
                            id,
                            name: frName,
                            slug: formSlug,
                            image: info.image,
                            sprite: altPoke.sprites.front_default,
                            type: altPoke.types.map((t: any) => t.type.name),
                            isLegendary: info.isLegendary,
                            isMythical: info.isMythical,
                        });
                    }
                }
                const newInfo = this.updateAlternative(info);

                results.push(newInfo);
            } catch {
                // ignorer les erreurs (id manquant)
                continue;
            }
        }
        const newResult = results.sort((a, b) => a.id - b.id);
        console.log(newResult);
        return newResult;
    }
}
type PokemonInfo = {
    id: number;
    name: string;
    slug: string;
    image: string;
    sprite: string;
    type: string[];
    isLegendary: boolean;
    isMythical: boolean;
    mega?: { id: number; type: string[] };
    alternatives?: PokemonInfo[];
};
