import { Injectable } from '@angular/core';
import { PokemonInterface } from '@entities/pokemon';

@Injectable({
    providedIn: 'root',
})
export class SortPokemon2Service {
    private pokemons!: PokemonInterface[];
    private nameMap!: Map<string, PokemonInterface>;

    private setAttribut(pokemons: PokemonInterface[]) {
        this.pokemons = pokemons;
        this.nameMap = new Map(pokemons.map((p) => [p.name, p]));
    }

    public getOrderedList(pokemons: PokemonInterface[]): PokemonInterface[] {
        this.setAttribut(pokemons);

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

            // Si aucun chemin trouvé (pokémon isolé), ajoute arbitrairement le premier restant
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
                const weight = this.commonTypeCount(a, b);
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
