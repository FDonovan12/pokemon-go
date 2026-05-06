import { computed, effect, inject } from '@angular/core';
import { PokemonFamily, PokemonInterface, PokemonSlug } from '@entities/pokemon';
import { patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { ListPokemonRepository } from '@repositories/list-pokemon-repository/list-pokemon.repository';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';

const LOCAL_STORAGE_KEEP = 'pokemon-want-keep';
const LOCAL_STORAGE_KEEP_KEYS = 'pokemon-want-keep-keys';
const initialState = {
    _allFamilyPokemon: [] as PokemonInterface[],
    generationSelected: 1,
    listName: [''],
    selectedListName: '',
    selectedPokemonWantKeep: new Set<PokemonInterface>(),
    search: '',
};

export const ListPokemonPageStore = signalStore(
    { providedIn: 'root' },
    withProps(() => ({
        _pokemonRepository: inject(PokemonRepository),
        _listPokemonRepository: inject(ListPokemonRepository),
    })),
    withState(initialState),
    withComputed((store) => ({
        selectedListKey: computed(() => store.selectedListName().slugify()),
    })),
    withComputed((store) => ({
        actualListPokemonMap: computed(() => {
            const list = [...store.selectedPokemonWantKeep()];
            const sorted = list.sortAsc((pokemon) => pokemon.id);
            const map = sorted.groupBy((pokemon) => pokemon.generation);
            return map;
        }),
        resultSelected: computed(() => {
            let allFamilySelected: PokemonFamily[] = [];
            if (store.search()) {
                allFamilySelected = store
                    ._allFamilyPokemon()
                    .filter(
                        (pokemon) =>
                            pokemon.slug.slugify().includes(store.search().slugify()) ||
                            pokemon.type.some((type) => type.slugifyEquals(store.search())),
                    )
                    .map((pokemon) => pokemon.family);
            } else {
                const onlyThisGeneration: PokemonInterface[] = store
                    ._allFamilyPokemon()
                    .filter((pokemon) => pokemon.generation === store.generationSelected());

                allFamilySelected = onlyThisGeneration.map((pokemon) => pokemon.family);
            }

            const result: PokemonInterface[] = store
                ._allFamilyPokemon()
                .filter((pokemon) => allFamilySelected.includes(pokemon.family))
                .groupBy('family')
                .toList('values')
                .flat();
            return result;
        }),
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
            patchState(store, { selectedPokemonWantKeep: set });
        },
        exportKeepPokemon() {
            const slugs = Array.from(store.selectedPokemonWantKeep()).map((p) => p.slug);
            const blob = new Blob([JSON.stringify(slugs, null, 2)], {
                type: 'application/json',
            });

            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = store.selectedListKey() + '.json';
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
                const set = new Set<PokemonInterface>(store.selectedPokemonWantKeep().toList());
                allSlugs.forEach((pokemonName) => set.add(store._pokemonRepository.pokemonIndex.byName[pokemonName]));
                patchState(store, { selectedPokemonWantKeep: set });
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
            patchState(store, { listName: newList, selectedListName: nameList });
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
            const storageListName: string[] = store._listPokemonRepository.getListKeys();
            effect(() => {
                const newSet: Set<PokemonInterface> = store._listPokemonRepository
                    .getPokemonsForList(store.selectedListKey())
                    .toSet();
                patchState(store, {
                    selectedPokemonWantKeep: newSet,
                });
            });
            effect(() => {
                const listSlugs = store
                    .selectedPokemonWantKeep()
                    .toList()
                    .map((pokemon: PokemonInterface) => pokemon.slug);
                store._listPokemonRepository.saveSlugsForList(store.selectedListKey(), listSlugs);
            });
            effect(() => {
                const list = store.listName();
                store._listPokemonRepository.saveListKeys(list);
            });
            const allFamilyPokemons = Object.entries(store._pokemonRepository.pokemonIndex.byName).map(
                (couple) => couple[1],
            );
            const selectedKey = storageListName.first()?.slugify() ?? LOCAL_STORAGE_KEEP;
            const newSet: Set<PokemonInterface> = store._listPokemonRepository.getPokemonsForList(selectedKey).toSet();
            patchState(store, {
                _allFamilyPokemon: allFamilyPokemons,
                selectedPokemonWantKeep: newSet,
                listName: storageListName,
                selectedListName: selectedKey,
            });
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
