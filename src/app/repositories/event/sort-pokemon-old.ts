import { Injectable } from '@angular/core';
import { PokemonInterface } from '@entities/pokemon';

@Injectable({
    providedIn: 'root',
})
export class SortPokemonServiceOld {
    private pokemons!: PokemonInterface[];
    private nameMap!: Map<string, PokemonInterface>;

    private setAttribut(pokemons: PokemonInterface[]) {
        this.pokemons = pokemons;
        this.nameMap = new Map(pokemons.map((p) => [p.name, p]));
    }

    public getOrderedList(pokemons: PokemonInterface[]): PokemonInterface[] {
        this.setAttribut(pokemons);

        const result: PokemonInterface[] = [];
        const visited = new Set<string>();

        for (const pokemon of pokemons) {
            if (!visited.has(pokemon.name)) {
                const group = this.collectGroup(pokemon.name, visited);
                const graph = this.buildGraph(group);
                const chain = this.extractLongestChain(graph);
                for (const name of chain) {
                    const p = this.nameMap.get(name);
                    if (p) result.push(p);
                }
            }
        }

        return result;
    }
    private collectGroup(start: string, visited: Set<string>): PokemonInterface[] {
        const group: PokemonInterface[] = [];
        const queue: string[] = [start];
        visited.add(start);

        while (queue.length > 0) {
            const current = queue.shift()!;
            const currentPoke = this.nameMap.get(current);
            if (currentPoke) {
                group.push(currentPoke);

                for (const other of this.pokemons) {
                    if (!visited.has(other.name) && this.haveCommonType(currentPoke, other)) {
                        queue.push(other.name);
                        visited.add(other.name);
                    }
                }
            }
        }

        return group;
    }
    private buildGraph(pokemons: PokemonInterface[]): Map<string, string[]> {
        const graph = new Map<string, string[]>();

        for (const a of pokemons) {
            for (const b of pokemons) {
                if (a.name !== b.name && this.haveCommonType(a, b)) {
                    if (!graph.has(a.name)) graph.set(a.name, []);
                    graph.get(a.name)!.push(b.name);
                }
            }
        }

        return graph;
    }

    private haveCommonType(a: PokemonInterface, b: PokemonInterface): boolean {
        return a.type.some((type) => b.type.includes(type));
    }

    private extractLongestChain(graph: Map<string, string[]>): string[] {
        let best: string[] = [];

        for (const name of graph.keys()) {
            const path = this.dfsLongestPathWithWeight(name, graph, new Set());
            if (path.length > best.length) {
                best = path;
            }
        }

        return best;
    }

    private dfsLongestPathWithWeight(current: string, graph: Map<string, string[]>, visited: Set<string>): string[] {
        visited.add(current);
        let longest: string[] = [current];

        const neighbors = (graph.get(current) || []).filter((n) => !visited.has(n));

        // Priorise les voisins avec plus de types communs
        neighbors.sort((a, b) => {
            const aCommon = this.commonTypeCount(current, a);
            const bCommon = this.commonTypeCount(current, b);
            return bCommon - aCommon;
        });

        for (const neighbor of neighbors) {
            const path = this.dfsLongestPathWithWeight(neighbor, graph, visited);
            if (path.length + 1 > longest.length) {
                longest = [current, ...path];
            }
        }

        visited.delete(current); // backtrack
        return longest;
    }

    private commonTypeCount(aName: string, bName: string): number {
        const a = this.nameMap.get(aName);
        const b = this.nameMap.get(bName);
        if (!a || !b) return 0;
        return a.type.filter((type) => b.type.includes(type)).length;
    }
}
