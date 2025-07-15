import { Injectable } from '@angular/core';
import { PokemonWithRarity } from '@entities/event';
import { PokemonInterface } from '@entities/pokemon';

@Injectable({
    providedIn: 'root',
})
export class SortPokemonService {
    private idMap = new Map<number, PokemonWithRarity>();

    public getOrderedList(pokemons: PokemonWithRarity[], megaPokemons: PokemonInterface[]): PokemonWithRarity[] {
        this.idMap = new Map(pokemons.map((p) => [p.id, p]));

        const graph = this.buildWeightedGraph(pokemons, megaPokemons);
        const visited = new Set<number>();
        const orderedResult: PokemonWithRarity[] = [];

        for (const pokemon of pokemons) {
            if (visited.has(pokemon.id)) continue;

            const component = this.getConnectedComponent(pokemon.id, graph, visited);
            const mst = this.buildMaxSpanningTree(component, graph);
            const dfsOrder = this.linearizeTree(component[0], mst);
            orderedResult.push(...dfsOrder.map((id) => this.idMap.get(id)!));
        }

        return orderedResult;
    }

    private buildWeightedGraph(
        pokemons: PokemonInterface[],
        megaPokemons: PokemonInterface[],
    ): Map<number, { target: number; weight: number }[]> {
        const graph = new Map<number, { target: number; weight: number }[]>();

        for (const a of pokemons) {
            for (const b of pokemons) {
                if (a.id >= b.id) continue;

                const weight = this.commonTypeCount(a, b) * 100 + this.megaCommonBridgeCount(a, b, megaPokemons) * 0.1;
                if (weight <= 0) continue;

                if (!graph.has(a.id)) graph.set(a.id, []);
                if (!graph.has(b.id)) graph.set(b.id, []);
                graph.get(a.id)!.push({ target: b.id, weight });
                graph.get(b.id)!.push({ target: a.id, weight });
            }
        }

        return graph;
    }

    private commonTypeCount(a: PokemonInterface, b: PokemonInterface): number {
        return a.type.filter((t) => b.type.includes(t)).length;
    }

    private megaCommonBridgeCount(a: PokemonInterface, b: PokemonInterface, megas: PokemonInterface[]): number {
        return megas.filter((m) => m.type.some((t) => a.type.includes(t)) && m.type.some((t) => b.type.includes(t)))
            .length;
    }

    private getConnectedComponent(
        startId: number,
        graph: Map<number, { target: number; weight: number }[]>,
        visitedGlobal: Set<number>,
    ): number[] {
        const visited = new Set<number>();
        const stack = [startId];

        while (stack.length > 0) {
            const current = stack.pop()!;
            if (visited.has(current)) continue;
            visited.add(current);
            visitedGlobal.add(current);

            for (const neighbor of graph.get(current) || []) {
                if (!visited.has(neighbor.target)) {
                    stack.push(neighbor.target);
                }
            }
        }

        return [...visited];
    }

    private buildMaxSpanningTree(
        component: number[],
        graph: Map<number, { target: number; weight: number }[]>,
    ): Map<number, number[]> {
        const edges: { a: number; b: number; weight: number }[] = [];

        for (const a of component) {
            for (const edge of graph.get(a) || []) {
                if (component.includes(edge.target) && a < edge.target) {
                    edges.push({ a, b: edge.target, weight: edge.weight });
                }
            }
        }

        // Tri décroissant (poids max en premier)
        edges.sort((e1, e2) => e2.weight - e1.weight);

        const parent = new Map<number, number>();
        const find = (x: number): number => {
            if (!parent.has(x)) parent.set(x, x);
            if (parent.get(x)! !== x) parent.set(x, find(parent.get(x)!));
            return parent.get(x)!;
        };
        const union = (x: number, y: number) => parent.set(find(x), find(y));

        const mst = new Map<number, number[]>();

        for (const { a, b } of edges) {
            if (find(a) !== find(b)) {
                union(a, b);
                if (!mst.has(a)) mst.set(a, []);
                if (!mst.has(b)) mst.set(b, []);
                mst.get(a)!.push(b);
                mst.get(b)!.push(a);
            }
        }

        return mst;
    }

    private linearizeTree(start: number, tree: Map<number, number[]>): number[] {
        const visited = new Set<number>();
        const result: number[] = [];

        const dfs = (node: number) => {
            visited.add(node);
            result.push(node);
            for (const neighbor of tree.get(node) || []) {
                if (!visited.has(neighbor)) dfs(neighbor);
            }
        };

        dfs(start);
        return result;
    }
}
