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

    public getOrderedList2(pokemons: PokemonWithRarity[], megaPokemons: PokemonInterface[]) {
        const graph = this.buildWeightedGraph(pokemons, megaPokemons);
        const edges: Edge[] = [];
        graph.forEach((value, key) => {
            edges.push(...value.filter((edge) => edge.target < key));
        });
        console.log(edges);
        console.log(graph);
    }

    public getOrderedList(pokemons: PokemonWithRarity[], megaPokemons: PokemonInterface[]): PokemonWithRarity[] {
        this.idMap = new Map(pokemons.map((p) => [p.id, p]));

        const graph = this.buildWeightedGraph(pokemons, megaPokemons);

        const edges: Edge[] = [];
        graph.forEach((value, key) => {
            edges.push(...value.filter((edge) => edge.target < key));
        });
        const edgesSortedWeightDesc = edges.sortDesc((edge) => edge.weight);
        console.log(edgesSortedWeightDesc);
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

        console.log(finalEdges);
        const orderedFinalId = this.reconstructPath(finalEdges);
        console.log(this.reconstructPath(finalEdges));
        const test = this.findBestPathDFS(orderedFinalId, edges);
        console.log(orderedFinalId);
        console.log(test);
        const orderedResult: PokemonWithRarity[] = test.map((id) => this.idMap.get(id)!);
        return orderedResult;
    }
    private findBestPathDFS(nodes: number[], edges: Edge[]): number[] {
        const graph = new Map<number, { to: number; weight: number }[]>();

        // Construire le graphe pondéré
        for (const { node, target, weight } of edges) {
            if (!graph.has(node)) graph.set(node, []);
            if (!graph.has(target)) graph.set(target, []);
            graph.get(node)!.push({ to: target, weight });
            graph.get(target)!.push({ to: node, weight });
        }

        let bestPath: number[] = [];
        let bestScore = -Infinity;

        function dfs(path: number[], visited: Set<number>, score: number) {
            const last = path[path.length - 1];

            if (path.length === nodes.length) {
                if (score > bestScore) {
                    bestScore = score;
                    bestPath = [...path];
                }
                return;
            }

            for (const { to, weight } of graph.get(last) ?? []) {
                if (!visited.has(to)) {
                    visited.add(to);
                    path.push(to);
                    dfs(path, visited, score + weight);
                    path.pop();
                    visited.delete(to);
                }
            }
        }

        // Lancer la recherche depuis chaque nœud
        for (const node of nodes) {
            dfs([node], new Set([node]), 0);
        }

        return bestPath;
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

                const weight = this.commonTypeCount(a, b) * 100 + this.megaCommonBridgeCount(a, b, megaPokemons) * 0.1;
                if (weight <= 0) continue;

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

    private getConnectedComponent(startId: number, graph: Map<number, Edge[]>, visitedGlobal: Set<number>): number[] {
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

    private buildMaxSpanningTree(component: number[], graph: Map<number, Edge[]>): Map<number, number[]> {
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
