import { Injectable } from '@angular/core';
import { PokemonInterface } from '@entities/pokemon';

@Injectable({
    providedIn: 'root',
})
export class SortPokemonService {
    private pokemons!: PokemonInterface[];
    private megaPokemons!: PokemonInterface[];
    private nameMap!: Map<string, PokemonInterface>;

    private setAttribut(pokemons: PokemonInterface[], megaPokemons: PokemonInterface[]) {
        this.pokemons = pokemons;
        this.megaPokemons = megaPokemons;
        this.nameMap = new Map(pokemons.map((p) => [p.name, p]));
    }

    public getOrderedList(pokemons: PokemonInterface[], megaPokemons: PokemonInterface[]): PokemonInterface[] {
        this.setAttribut(pokemons, megaPokemons);

        const result: PokemonInterface[] = [];
        const remaining = new Set(pokemons.map((p) => p.name));

        while (remaining.size > 0) {
            const subList = this.pokemons.filter((p) => remaining.has(p.name));
            const graph = this.buildWeightedGraph(subList);
            const bestChain = this.findMaxWeightPath(
                graph,
                subList.map((p) => p.name),
            );

            for (const name of bestChain) {
                const poke = this.nameMap.get(name);
                if (poke) result.push(poke);
                remaining.delete(name);
            }

            // Si aucun chemin trouvé
            if (bestChain.length === 0) {
                const name = [...remaining][0];
                const poke = this.nameMap.get(name);
                if (poke) result.push(poke);
                remaining.delete(name);
            }
        }

        return result;
    }

    private buildWeightedGraph(pokemons: PokemonInterface[]): Map<string, { target: string; weight: number }[]> {
        const graph = new Map<string, { target: string; weight: number }[]>();

        for (const a of pokemons) {
            for (const b of pokemons) {
                if (a.name === b.name) continue;

                const directTypeCount = this.commonTypeCount(a, b);
                const megaBridgeCount = this.megaCommonBridgeCount(a, b);

                const weight = directTypeCount * 100 + megaBridgeCount * 0.1;

                if (weight > 0) {
                    if (!graph.has(a.name)) graph.set(a.name, []);
                    graph.get(a.name)!.push({ target: b.name, weight });
                }
            }
        }

        return graph;
    }

    private commonTypeCount(a: PokemonInterface, b: PokemonInterface): number {
        return a.type.filter((type) => b.type.includes(type)).length;
    }

    /**
     * Compte les méga-Pokémon qui ont un type en commun à la fois avec A et avec B
     */
    private megaCommonBridgeCount(a: PokemonInterface, b: PokemonInterface): number {
        return this.megaPokemons.filter((mega) => {
            const hasWithA = a.type.some((t) => mega.type.includes(t));
            const hasWithB = b.type.some((t) => mega.type.includes(t));
            return hasWithA && hasWithB;
        }).length;
    }

    private findMaxWeightPath(graph: Map<string, { target: string; weight: number }[]>, nodes: string[]): string[] {
        let bestPath: string[] = [];
        let maxWeight = -1;

        for (const start of nodes) {
            const visited = new Set<string>();
            const { path, weight } = this.dfsMaxWeight(start, graph, visited, 0, []);
            if (weight > maxWeight) {
                bestPath = path;
                maxWeight = weight;
            }
        }

        return bestPath;
    }

    private dfsMaxWeight(
        current: string,
        graph: Map<string, { target: string; weight: number }[]>,
        visited: Set<string>,
        totalWeight: number,
        path: string[],
    ): { path: string[]; weight: number } {
        visited.add(current);
        const newPath = [...path, current];

        let best = { path: newPath, weight: totalWeight };

        for (const edge of graph.get(current) || []) {
            if (!visited.has(edge.target)) {
                const result = this.dfsMaxWeight(edge.target, graph, visited, totalWeight + edge.weight, newPath);
                if (result.weight > best.weight) {
                    best = result;
                }
            }
        }

        visited.delete(current); // backtrack
        return best;
    }
}
