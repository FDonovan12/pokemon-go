import { computed, effect, inject } from '@angular/core';
import { PokemonInterface, PokemonSlug } from '@entities/pokemon';
import { patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';

const LOCAL_STORAGE_KEEP = 'pokemon-want-keep';

const initialState = {
    allFamilyPokemon: [] as PokemonInterface[],
    generationSelected: 1,
    pokemonWantKeep: new Set<PokemonInterface>(),
    search: '',
};

export const KeepStore = signalStore(
    { providedIn: 'root' },
    withProps(() => ({
        _pokemonRepository: inject(PokemonRepository),
    })),
    withState(initialState),
    withComputed((store) => ({
        pokemonWantKeepMap: computed(() => {
            const list = [...store.pokemonWantKeep()];
            const sorted = list.sortAsc((pokemon) => pokemon.id);
            const map = sorted.groupBy((pokemon) => pokemon.generation);
            return map;
        }),
        resultSelected: computed(() => {
            if (store.search()) {
                return store
                    .allFamilyPokemon()
                    .filter((pokemon) => pokemon.slug.slugify().includes(store.search().slugify()));
            }
            return store.allFamilyPokemon().filter((pokemon) => pokemon.generation === store.generationSelected());
        }),
        resultSearch: computed(() =>
            store.allFamilyPokemon().filter((pokemon) => pokemon.name.includes(store.search())),
        ),
    })),
    withMethods((store) => ({
        unselectAll() {
            patchState(store, { pokemonWantKeep: new Set<PokemonInterface>() });
        },
        selectGeneration(generation: number) {
            patchState(store, { generationSelected: generation });
        },
        selectPokemon(pokemon: PokemonInterface) {
            const set = new Set<PokemonInterface>(store.pokemonWantKeep());
            if (set.has(pokemon)) {
                set.delete(pokemon);
            } else {
                set.add(pokemon);
            }
            patchState(store, { pokemonWantKeep: set, search: '' });
        },
        exportKeepPokemon() {
            const slugs = Array.from(store.pokemonWantKeep()).map((p) => p.slug); // Ou plus si tu veux
            const blob = new Blob([JSON.stringify(slugs, null, 2)], {
                type: 'application/json',
            });

            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'keep-pokemon.json';
            a.click();

            URL.revokeObjectURL(a.href);
        },
        onFilesSelected(event: Event) {
            const input = event.target as HTMLInputElement;
            if (!input.files) return;

            const files = Array.from(input.files);
            const promises = files.map((file) => readFile(file));

            Promise.all(promises).then((arraysOfSlugs) => {
                const allSlugs: PokemonSlug[] = arraysOfSlugs.flat();
                const set = new Set<PokemonInterface>([...store.pokemonWantKeep()]);
                allSlugs.forEach((pokemonName) => set.add(store._pokemonRepository.pokemonIndex.byName[pokemonName]));
                console.log(set);
                patchState(store, { pokemonWantKeep: set });
                console.log(store.pokemonWantKeep());
            });
        },
        setSearch: (value: string) => patchState(store, { search: value }),
    })),
    withHooks((store) => ({
        onInit() {
            effect(() => {
                const list = [...store.pokemonWantKeep()].map((p) => p.slug);
                localStorage.setItem(LOCAL_STORAGE_KEEP, JSON.stringify(list));
            });
            const pokemonsByName = store._pokemonRepository.pokemonIndex.byName;
            const allFamilyPokemons = store._pokemonRepository.pokemonFamilyName
                .map((pokemonName) => pokemonsByName[pokemonName])
                .filter((pokemon) => !pokemon.isLegendary && !pokemon.isMythical);
            // const map = new Map<number, PokemonInterface[]>();
            // allFamilyPokemons.forEach((pokemon) => {
            //     const list = map.get(pokemon.generation) ?? [];
            //     list.push(pokemon);
            //     map.set(pokemon.generation, list);
            // });
            const storageKeep = localStorage.getItem(LOCAL_STORAGE_KEEP);
            const storageSlugs: PokemonSlug[] = storageKeep ? JSON.parse(storageKeep) : [];
            const newSet = new Set<PokemonInterface>(storageSlugs.map((slug) => pokemonsByName[slug]));
            patchState(store, { allFamilyPokemon: allFamilyPokemons, pokemonWantKeep: newSet });
        },
    })),
);

function readFile(file: File): Promise<PokemonSlug[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            try {
                const json = JSON.parse(reader.result as string);
                if (Array.isArray(json)) {
                    resolve(json);
                } else {
                    reject('JSON non valide : doit être un tableau de slug');
                }
            } catch (e) {
                reject('Erreur parsing JSON');
            }
        };

        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}
