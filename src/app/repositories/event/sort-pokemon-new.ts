import { Injectable } from '@angular/core';
import { PokemonInterface } from '@entities/pokemon';

@Injectable({
    providedIn: 'root',
})
export class PokemonPathService {
    public findBestPath(pokemons: PokemonInterface[], megaPokemons: PokemonInterface[]): PokemonInterface[] {
        const graph = this.buildGraph(pokemons, megaPokemons);
        const visited = new Set<number>();
        const allPaths: PokemonInterface[][] = [];

        while (visited.size < pokemons.length) {
            const start = pokemons.find((p) => !visited.has(p.id));
            if (!start) break;

            let bestPath: PokemonInterface[] = [];
            let bestWeight = -Infinity;

            this.dfs(start, graph, new Set(), [], 0, (path, weight) => {
                // uniquement si tous les Pokémon du path sont encore libres
                if (path.every((p) => !visited.has(p.id)) && weight > bestWeight) {
                    bestWeight = weight;
                    bestPath = [...path];
                }
            });

            for (const p of bestPath) {
                visited.add(p.id);
            }
            allPaths.push(bestPath);
        }

        return allPaths.flat();
    }

    private buildGraph(
        pokemons: PokemonInterface[],
        megaPokemons: PokemonInterface[],
    ): Map<number, { neighbor: PokemonInterface; weight: number }[]> {
        const graph = new Map<number, { neighbor: PokemonInterface; weight: number }[]>();

        for (const a of pokemons) {
            for (const b of pokemons) {
                if (a.id >= b.id) continue;

                const typeOverlap = this.countCommonTypes(a, b);
                if (typeOverlap === 0) continue;

                const megaBonus = this.countMegaBonus(a, b, megaPokemons);
                const weight = typeOverlap * 100 + megaBonus;

                if (!graph.has(a.id)) graph.set(a.id, []);
                if (!graph.has(b.id)) graph.set(b.id, []);
                graph.get(a.id)!.push({ neighbor: b, weight });
                graph.get(b.id)!.push({ neighbor: a, weight });
            }
        }

        return graph;
    }

    private countCommonTypes(a: PokemonInterface, b: PokemonInterface): number {
        return a.type.filter((t) => b.type.includes(t)).length;
    }

    private countMegaBonus(a: PokemonInterface, b: PokemonInterface, megas: PokemonInterface[]): number {
        return megas.filter((m) => m.type.some((t) => a.type.includes(t)) && m.type.some((t) => b.type.includes(t)))
            .length;
    }

    private dfs(
        current: PokemonInterface,
        graph: Map<number, { neighbor: PokemonInterface; weight: number }[]>,
        visited: Set<number>,
        currentPath: PokemonInterface[],
        currentWeight: number,
        onPathFound: (path: PokemonInterface[], weight: number) => void,
    ): void {
        visited.add(current.id);
        currentPath.push(current);

        onPathFound(currentPath, currentWeight);

        for (const { neighbor, weight } of graph.get(current.id) || []) {
            if (!visited.has(neighbor.id)) {
                this.dfs(neighbor, graph, new Set(visited), [...currentPath], currentWeight + weight, onPathFound);
            }
        }
    }
}
