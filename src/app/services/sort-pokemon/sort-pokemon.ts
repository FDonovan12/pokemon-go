import { Injectable } from '@angular/core';
import { PokemonWithRarity } from '@entities/event';
import { PokemonInterface } from '@entities/pokemon';

type Edge = {
    node: number;
    target: number;
    weight: number;
};
class DisjointSet {
    private parent: Map<number, number>;

    constructor(nodes: number[]) {
        this.parent = new Map(nodes.map((n) => [n, n]));
    }

    find(n: number): number {
        if (this.parent.get(n)! !== n) {
            this.parent.set(n, this.find(this.parent.get(n)!));
        }
        return this.parent.get(n)!;
    }

    union(a: number, b: number): boolean {
        const rootA = this.find(a);
        const rootB = this.find(b);
        if (rootA === rootB) return false;
        this.parent.set(rootA, rootB);
        return true;
    }
}

@Injectable({
    providedIn: 'root',
})
export class SortPokemonService {
    private idMap = new Map<number, PokemonWithRarity>();

    private getWeightPathValue(pokemons: PokemonWithRarity[], megaPokemons: PokemonInterface[]) {
        let total = 0;

        for (let i = 0; i < pokemons.length - 1; i++) {
            const p1 = pokemons[i];
            const p2 = pokemons[i + 1];

            const weight = this.getWeightEdge(p1, p2, megaPokemons);
            total += weight;
        }

        return total;
    }

    private getWeightEdge(
        pokemon1: PokemonInterface,
        pokemon2: PokemonInterface,
        megaPokemons: PokemonInterface[],
    ): number {
        return (
            this.commonTypeCount(pokemon1, pokemon2) * 100 +
            this.megaCommonBridgeCount(pokemon1, pokemon2, megaPokemons) * 0.1
        );
    }

    public getFinalOrderedList(pokemons: PokemonWithRarity[], megaPokemons: PokemonInterface[]) {
        const startTime = performance.now();
        pokemons.shuffle();
        let bestPath = this.getOrderedList(pokemons, megaPokemons);
        let bestValue = this.getWeightPathValue(bestPath, megaPokemons);

        let sinceLastUpdate = 0;
        const timeLimitIsNotReached = () => performance.now() - startTime < 200;
        let iteration = 0;
        const lastUpdateLimitIsNotExceeded = () => sinceLastUpdate < 500;

        while (timeLimitIsNotReached() && lastUpdateLimitIsNotExceeded()) {
            const candidate = this.getOrderedList(pokemons.shuffle(), megaPokemons);
            const candidateValue = this.getWeightPathValue(candidate, megaPokemons);

            if (candidateValue > bestValue) {
                bestPath = candidate;
                bestValue = candidateValue;
                sinceLastUpdate = 0;
            } else {
                sinceLastUpdate++;
            }
            iteration++;
        }
        console.log(iteration);
        return bestPath;
    }

    public getOrderedList(pokemons: PokemonWithRarity[], megaPokemons: PokemonInterface[]): PokemonWithRarity[] {
        this.idMap = new Map(pokemons.map((p) => [p.id, p]));

        const graph = this.buildWeightedGraph(pokemons, megaPokemons);

        const edges: Edge[] = [];
        graph.forEach((value, key) => {
            edges.push(...value.filter((edge) => edge.target < key));
        });
        const edgesSortedWeightDesc = edges.sortDesc((edge) => edge.weight);
        const degrees = new Map<number, number>();
        const nodes = Array.from(graph.keys());
        const ds = new DisjointSet(nodes);
        const finalEdges: Edge[] = [];

        for (const edge of edgesSortedWeightDesc) {
            const { node, target } = edge;

            const degNode = degrees.get(node) ?? 0;
            const degTarget = degrees.get(target) ?? 0;

            if (degNode < 2 && degTarget < 2 && ds.union(node, target)) {
                finalEdges.push(edge);
                degrees.set(node, degNode + 1);
                degrees.set(target, degTarget + 1);
            }
        }
        const adjacency = new Map<number, { edge: Edge; next: number }[]>();

        for (const edge of finalEdges) {
            if (!adjacency.has(edge.node)) adjacency.set(edge.node, []);
            if (!adjacency.has(edge.target)) adjacency.set(edge.target, []);
            adjacency.get(edge.node)!.push({ edge, next: edge.target });
            adjacency.get(edge.target)!.push({ edge, next: edge.node });
        }
        let start: number | undefined;
        for (const [node, neighbors] of adjacency.entries()) {
            if (neighbors.length === 1) {
                start = node;
                break;
            }
        }
        if (start === undefined) throw new Error('Pas de point de départ (chemin circulaire ?)');
        const orderedEdges: Edge[] = [];
        const visited = new Set<number>();
        let current = start;
        let previous = -1;

        while (true) {
            visited.add(current);
            const neighbors = adjacency.get(current)!;

            const nextEdge = neighbors.find((n) => n.next !== previous);
            if (!nextEdge) break; // Fin du chemin

            orderedEdges.push(nextEdge.edge);
            previous = current;
            current = nextEdge.next;
        }

        const orderedFinalId = this.reconstructPath(finalEdges);
        const orderedResult: PokemonWithRarity[] = orderedFinalId.map((id) => this.idMap.get(id)!);
        return orderedResult;
    }

    private reconstructPath(finalEdges: Edge[]): number[] {
        const adjacency = new Map<number, number[]>();

        // Construire la liste d'adjacence
        for (const { node, target } of finalEdges) {
            if (!adjacency.has(node)) adjacency.set(node, []);
            if (!adjacency.has(target)) adjacency.set(target, []);
            adjacency.get(node)!.push(target);
            adjacency.get(target)!.push(node);
        }

        // Trouver un noeud de départ (degré 1)
        let start: number | undefined;
        for (const [node, neighbors] of adjacency.entries()) {
            if (neighbors.length === 1) {
                start = node;
                break;
            }
        }
        if (start === undefined) throw new Error('Pas de nœud de départ trouvé (le chemin est peut-être un cycle)');

        // Parcourir le chemin pour récupérer les nœuds dans l'ordre
        const orderedNodes: number[] = [];
        const visited = new Set<number>();
        let current = start;
        let previous = -1;

        while (true) {
            orderedNodes.push(current);
            visited.add(current);
            const neighbors = adjacency.get(current)!;
            const next = neighbors.find((n) => n !== previous && !visited.has(n));
            if (next === undefined) break;
            previous = current;
            current = next;
        }

        return orderedNodes;
    }

    private buildWeightedGraph(pokemons: PokemonInterface[], megaPokemons: PokemonInterface[]): Map<number, Edge[]> {
        const graph = new Map<number, Edge[]>();

        for (const a of pokemons) {
            for (const b of pokemons) {
                if (a.id >= b.id) continue;

                const weight = this.getWeightEdge(a, b, megaPokemons);

                if (!graph.has(a.id)) graph.set(a.id, []);
                if (!graph.has(b.id)) graph.set(b.id, []);
                graph.get(a.id)!.push({ target: b.id, node: a.id, weight });
                graph.get(b.id)!.push({ target: a.id, node: b.id, weight });
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
}
