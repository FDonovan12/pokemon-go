import { computed, effect, inject } from '@angular/core';
import { PokemonInterface, PokemonSlug } from '@entities/pokemon';
import { patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';

const LOCAL_STORAGE_KEEP = 'pokemon-want-keep';
const LOCAL_STORAGE_KEEP_KEYS = 'pokemon-want-keep-keys';

const initialState = {
    allFamilyPokemon: [] as PokemonInterface[],
    generationSelected: 1,
    listName: [''],
    selectedListName: '',
    selectedPokemonWantKeep: new Set<PokemonInterface>(),
    search: '',
};

export const KeepStore = signalStore(
    { providedIn: 'root' },
    withProps(() => ({
        _pokemonRepository: inject(PokemonRepository),
    })),
    withState(initialState),
    withComputed((store) => ({
        selectedListKey: computed(() => store.selectedListName().slugify()),
    })),
    withComputed((store) => ({
        pokemonWantKeepMap: computed(() => {
            const list = [...store.selectedPokemonWantKeep()];
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
            patchState(store, { selectedPokemonWantKeep: new Set<PokemonInterface>() });
        },
        selectList(event: Event) {
            const selectElement = event.target as HTMLSelectElement;
            const selectedListName = selectElement.value;
            patchState(store, { selectedListName });
        },
        selectGeneration(generation: number) {
            patchState(store, { generationSelected: generation });
        },
        selectPokemon(pokemon: PokemonInterface) {
            const set = new Set<PokemonInterface>(store.selectedPokemonWantKeep());
            if (set.has(pokemon)) {
                set.delete(pokemon);
            } else {
                set.add(pokemon);
            }
            patchState(store, { selectedPokemonWantKeep: set, search: '' });
        },
        exportKeepPokemon() {
            const slugs = Array.from(store.selectedPokemonWantKeep()).map((p) => p.slug); // Ou plus si tu veux
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
                const set = new Set<PokemonInterface>([...store.selectedPokemonWantKeep()]);
                allSlugs.forEach((pokemonName) => set.add(store._pokemonRepository.pokemonIndex.byName[pokemonName]));
                console.log(set);
                patchState(store, { selectedPokemonWantKeep: set });
                console.log(store.selectedPokemonWantKeep());
            });
        },
        addList: (nameList: string) => {
            const oldList = store.listName();
            const oldListSlugify = oldList.map((list) => list.slugify());
            if (oldListSlugify.includes(nameList.slugify())) {
                window.alert('Vous ne pouvez pas ajouter une liste qui existe déjà');
                return;
            }
            const newList = [...oldList, nameList];
            patchState(store, { listName: newList });
        },
        setSearch: (value: string) => patchState(store, { search: value }),
    })),
    withMethods((store) => ({
        deleteSelectedList: () => {
            if (store.listName().length === 1) {
                window.alert('Vous ne pouvez pas supprimer la dérnière liste');
                return;
            }
            if (
                window.confirm(
                    `Etes vous sur de supprimer la liste ${store.selectedListName()} avec les ${store.selectedPokemonWantKeep().size} Pokemon`,
                )
            ) {
                const oldList = store.listName();
                const newList = oldList.filter((name) => name !== store.selectedListName());
                const selectedListName = newList.first();
                patchState(store, { listName: newList, selectedListName });
            }
        },
    })),
    withHooks((store) => ({
        onInit() {
            const raw = localStorage.getItem(LOCAL_STORAGE_KEEP_KEYS);
            console.log(raw);
            const storageListName: string[] = raw ? JSON.parse(raw) : [LOCAL_STORAGE_KEEP];
            const selectedKey = storageListName.first()?.slugify() ?? LOCAL_STORAGE_KEEP;
            effect(() => {
                const newSet = getSetPokemon(store.selectedListKey(), pokemonsByName);
                patchState(store, {
                    selectedPokemonWantKeep: newSet,
                });
            });
            effect(() => {
                const list = [...store.selectedPokemonWantKeep()].map((p) => p.slug);
                localStorage.setItem(store.selectedListKey(), JSON.stringify(list));
            });
            effect(() => {
                const list = store.listName();
                console.log(list);
                localStorage.setItem(LOCAL_STORAGE_KEEP_KEYS, JSON.stringify(list));
            });
            const pokemonsByName = store._pokemonRepository.pokemonIndex.byName;
            const allFamilyPokemons = store._pokemonRepository.pokemonFamilyName
                .map((pokemonName) => pokemonsByName[pokemonName])
                .filter((pokemon) => !pokemon.isLegendary && !pokemon.isMythical);
            const newSet = getSetPokemon(selectedKey, pokemonsByName);
            console.log(storageListName);
            patchState(store, {
                allFamilyPokemon: allFamilyPokemons,
                selectedPokemonWantKeep: newSet,
                listName: storageListName,
                selectedListName: selectedKey,
            });
        },
    })),
);

function getSetPokemon(keyStorage: string, pokemonsByName: Record<PokemonInterface['slug'], PokemonInterface>) {
    const storageKeep = localStorage.getItem(keyStorage);
    const storageSlugs: PokemonSlug[] = storageKeep ? JSON.parse(storageKeep) : [];
    console.log(storageSlugs, keyStorage);
    const newSet = new Set<PokemonInterface>(storageSlugs.compact().map((slug) => pokemonsByName[slug]));
    return newSet;
}

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
