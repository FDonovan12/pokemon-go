import { Injectable } from '@angular/core';
import { PokemonInterface } from '@entities/pokemon';

@Injectable({
    providedIn: 'root',
})
export class SortPokemonService {
    private pokemons!: PokemonInterface[];
    private megaPokemons!: PokemonInterface[];
    private idMap!: Map<number, PokemonInterface>;

    private setAttribut(pokemons: PokemonInterface[], megaPokemons: PokemonInterface[]) {
        this.pokemons = pokemons;
        this.megaPokemons = megaPokemons;
        this.idMap = new Map(pokemons.map((p) => [p.id, p]));
    }

    public getOrderedList(pokemons: PokemonInterface[], megaPokemons: PokemonInterface[]): PokemonInterface[] {
        this.setAttribut(pokemons, megaPokemons);

        const result: PokemonInterface[] = [];
        const remaining = new Set(pokemons.map((p) => p.id));

        while (remaining.size > 0) {
            const subList = this.pokemons.filter((p) => remaining.has(p.id));
            const graph = this.buildWeightedGraph(subList);
            const bestChain = this.findMaxWeightPath(
                graph,
                subList.map((p) => p.id),
            );

            for (const id of bestChain) {
                const poke = this.idMap.get(id);
                if (poke) result.push(poke);
                remaining.delete(id);
            }

            // Si aucun chemin trouvé
            if (bestChain.length === 0) {
                const name = [...remaining][0];
                const poke = this.idMap.get(name);
                if (poke) result.push(poke);
                remaining.delete(name);
            }
        }

        return result;
    }

    private buildWeightedGraph(pokemons: PokemonInterface[]): Map<number, { target: number; weight: number }[]> {
        const graph = new Map<number, { target: number; weight: number }[]>();

        for (const a of pokemons) {
            for (const b of pokemons) {
                if (a.id === b.id) continue;

                const directTypeCount = this.commonTypeCount(a, b);
                const megaBridgeCount = this.megaCommonBridgeCount(a, b);

                const weight = directTypeCount * 100 + megaBridgeCount * 0.1;

                if (weight > 0) {
                    if (!graph.has(a.id)) graph.set(a.id, []);
                    graph.get(a.id)!.push({ target: b.id, weight });
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

    private findMaxWeightPath(graph: Map<number, { target: number; weight: number }[]>, nodes: number[]): number[] {
        let bestPath: number[] = [];
        let maxWeight = -1;

        for (const start of nodes) {
            const visited = new Set<number>();
            const { path, weight } = this.dfsMaxWeight(start, graph, visited, 0, []);
            if (weight > maxWeight) {
                bestPath = path;
                maxWeight = weight;
            }
        }

        return bestPath;
    }

    private dfsMaxWeight(
        current: number,
        graph: Map<number, { target: number; weight: number }[]>,
        visited: Set<number>,
        totalWeight: number,
        path: number[],
    ): { path: number[]; weight: number } {
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
