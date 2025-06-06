import { inject, Injectable } from '@angular/core';
import { EventPokemon, PokemonWithRarity } from '@entities/event';
import { PokemonInterface } from '@entities/pokemon';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { BddEvent } from './bdd-event';
import { SortPokemonService } from './sort-pokemon-3';

@Injectable({
    providedIn: 'root',
})
export class EventRepository {
    private readonly getAllService: PokemonRepository = inject(PokemonRepository);
    private readonly bddEvent: BddEvent = inject(BddEvent);
    private readonly sortPokemonService: SortPokemonService = inject(SortPokemonService);

    getAllEventsPokemon(): EventPokemon[] {
        const pokemons = this.getAllService.pokemonIndex.byName;
        const result: EventPokemon[] = this.bddEvent.getEventsPokemon();

        result.sort((a, b) => b.startAt.getTime() - a.startAt.getTime());
        return result;
    }

    getEventBySlug(slug: string): EventPokemon | undefined {
        const eventTemp = this.getAllEventsPokemon().find((event) => event.slug === slug);
        if (eventTemp) {
            console.log(this.getAllService.megaList);
            eventTemp.savageGroups = eventTemp.savageGroups.map((savagePokemon) => {
                savagePokemon.megas = this.getAllService.megaList.filter((mega) =>
                    this.countTypeBoost(
                        mega,
                        savagePokemon.pokemons.map((withRarity) => withRarity.pokemon),
                    ),
                );
                return savagePokemon;
            });
            eventTemp.savageGroups.forEach((group) => {
                const megas = group.megas;
                const megasGroup = megas.map((mega) => ({
                    mega: mega,
                    pokemonBoost: group.pokemonsFlat.filter((pokemon) => this.haveTypeInCommon(mega, pokemon)),
                }));
                group.megasGroup = megasGroup;
                console.log(megasGroup);
            });
            eventTemp.savageGroups.forEach((savage) => {
                const newList = this.sortPokemonService.getOrderedList(savage.pokemonsFlat, savage.megas);
                const withRarity = newList.map(
                    (pokemon) => new PokemonWithRarity(pokemon, !!savage.rarePokemons.find((p) => (p.id = pokemon.id))),
                );
                savage.pokemons = withRarity;
            });
        }
        return eventTemp;
    }

    haveTypeInCommon(pokemon1: PokemonInterface, pokemon2: PokemonInterface): boolean {
        return pokemon1.type.some((type) => type === pokemon2.type[0] || type === pokemon2.type[1]);
    }

    countTypeBoost(mega: PokemonInterface, savages: PokemonInterface[], minCount: number = 2): boolean {
        if (mega.type.length < minCount) return false;
        let totalListCount = 0;
        const listPokemonBuffPerType: any = Object.fromEntries(mega.type.map((type) => [type, []]));
        const countBoostPerType: any = mega.type.reduce((obj: any, key) => {
            obj[key] = 0;
            return obj;
        }, {});
        savages.forEach((savage) => {
            let boost = false;
            mega.type.forEach((type) => {
                if (savage.type.includes(type)) {
                    countBoostPerType[type]++;
                    listPokemonBuffPerType[type].push(savage);
                    boost = true;
                }
            });
            if (boost) totalListCount++;
        });
        let maxLength = Math.max(...Object.values(listPokemonBuffPerType).map((list: any) => list.length));

        return maxLength < totalListCount;
    }

    private buildAdjacencyMap(pokemons: PokemonInterface[]): Map<string, Set<string>> {
        const map = new Map<string, Set<string>>();

        for (const a of pokemons) {
            for (const b of pokemons) {
                if (a.name !== b.name && this.haveTypeInCommon(a, b)) {
                    if (!map.has(a.name)) map.set(a.name, new Set());
                    map.get(a.name)!.add(b.name);
                }
            }
        }

        return map;
    }

    private sortPokemonByConnections(pokemons: PokemonInterface[]): PokemonInterface[] {
        const adjacency = this.buildAdjacencyMap(pokemons);

        const visited = new Set<string>();
        const result: PokemonInterface[] = [];

        // Start with the Pokémon with the most neighbors
        const startingPokemon = [...adjacency.entries()].sort((a, b) => b[1].size - a[1].size)[0]?.[0];

        if (!startingPokemon) return pokemons; // fallback

        const nameMap = new Map(pokemons.map((p) => [p.name, p]));
        let current: string | undefined = startingPokemon;

        while (current) {
            visited.add(current);
            result.push(nameMap.get(current)!);

            const neighbors = adjacency.get(current);
            let next: string | undefined;

            if (neighbors) {
                next = [...neighbors].find((n) => !visited.has(n));
            }

            current = next;
        }

        // Add remaining Pokémon (isolated) at the end
        for (const p of pokemons) {
            if (!visited.has(p.name)) {
                result.push(p);
            }
        }

        return result;
    }

    private typeScore(a: PokemonInterface, b: PokemonInterface): number {
        return a.type.filter((t) => b.type.includes(t)).length;
    }

    private buildWeightedGraph(pokemons: PokemonInterface[]): Map<string, [string, number][]> {
        const graph = new Map<string, [string, number][]>();

        for (const a of pokemons) {
            for (const b of pokemons) {
                if (a.name !== b.name) {
                    const score = this.typeScore(a, b);
                    if (score > 0) {
                        if (!graph.has(a.name)) graph.set(a.name, []);
                        graph.get(a.name)!.push([b.name, score]);
                    }
                }
            }
        }

        return graph;
    }

    private findBestChain(pokemons: PokemonInterface[]): PokemonInterface[] {
        const graph = this.buildWeightedGraph(pokemons);
        const nameMap = new Map(pokemons.map((p) => [p.name, p]));

        let bestChain: string[] = [];
        let bestScore = -1;

        function dfs(current: string, path: string[], visited: Set<string>, score: number) {
            path.push(current);
            visited.add(current);

            if (score > bestScore) {
                bestScore = score;
                bestChain = [...path];
            }

            const neighbors = graph.get(current) || [];
            for (const [next, weight] of neighbors) {
                if (!visited.has(next)) {
                    dfs(next, path, visited, score + weight);
                }
            }

            path.pop();
            visited.delete(current);
        }

        for (const p of pokemons) {
            dfs(p.name, [], new Set(), 0);
        }

        // Add isolated Pokémon at the end
        const used = new Set(bestChain);
        const result = bestChain.map((name) => nameMap.get(name)!);
        for (const p of pokemons) {
            if (!used.has(p.name)) {
                result.push(p);
            }
        }

        return result;
    }
}
