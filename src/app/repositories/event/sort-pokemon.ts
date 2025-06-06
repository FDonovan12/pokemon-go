import { Injectable } from '@angular/core';
import { PokemonInterface } from '@entities/pokemon';

@Injectable({
    providedIn: 'root',
})
export class SortPokemonService {
    private pokemons!: PokemonInterface[];
    private nameMap!: Map<string, PokemonInterface>;

    private setAttribut(pokemons: PokemonInterface[]) {
        this.pokemons = pokemons;
        this.nameMap = new Map(pokemons.map((p) => [p.name, p]));
    }

    public getOrderedList(pokemons: PokemonInterface[]): PokemonInterface[] {
        this.setAttribut(pokemons);
        const result: PokemonInterface[] = [];
        const remaining = new Set(this.pokemons.map((p) => p.name));

        while (remaining.size > 0) {
            const subList = this.pokemons.filter((p) => remaining.has(p.name));
            const graph = this.buildGraph(subList);
            const chain = this.extractLongestChain(graph);

            for (const name of chain) {
                const pokemon = this.nameMap.get(name);
                if (pokemon) {
                    result.push(pokemon);
                    remaining.delete(name);
                }
            }

            // Si aucun lien trouvé (pokémon isolés)
            if (chain.length === 0) {
                for (const name of remaining) {
                    const pokemon = this.nameMap.get(name);
                    if (pokemon) {
                        result.push(pokemon);
                    }
                }
                break;
            }
        }

        return result;
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
            const path = this.dfsLongestPath(name, graph, new Set());
            if (path.length > best.length) {
                best = path;
            }
        }

        return best;
    }

    private dfsLongestPath(current: string, graph: Map<string, string[]>, visited: Set<string>): string[] {
        visited.add(current);
        let longest: string[] = [current];

        for (const neighbor of graph.get(current) || []) {
            if (!visited.has(neighbor)) {
                const path = this.dfsLongestPath(neighbor, graph, visited);
                if (path.length + 1 > longest.length) {
                    longest = [current, ...path];
                }
            }
        }

        visited.delete(current); // backtrack
        return longest;
    }
}
