import { computed, effect, inject } from '@angular/core';
import { LabelEntry } from '@entities/label';
import { PokemonInterface, PokemonSlug } from '@entities/pokemon';
import { patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { InternalListPokemonRepository } from '@repositories/list-pokemon-repository/internal-list-pokemon.repository';
import { ListPokemonRepository } from '@repositories/list-pokemon-repository/list-pokemon.repository';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { withPokemonSearch } from 'app/shared/features/pokemon-search/with-pokemon-search.feature';
import { ToastService } from 'app/shared/features/toast/toast.service';

const LOCAL_STORAGE_KEEP = { label: 'veut garder', slug: 'pokemon-want-keep' };

const initialState = {
    _allPokemons: [] as PokemonInterface[],
    generationSelected: 1,
    listEntries: [] as LabelEntry[],
    selectedListEntry: { label: '', slug: '' } as LabelEntry,
    selectedPokemonWantKeep: new Set<PokemonInterface>(),
    search: '',
};

export const ListPokemonPageStore = signalStore(
    { providedIn: 'root' },
    withPokemonSearch(),
    withProps(() => ({
        _pokemonRepository: inject(PokemonRepository),
        _listPokemonRepository: inject(ListPokemonRepository),
        _toastService: inject(ToastService),
        _internalListPokemonRepository: inject(InternalListPokemonRepository),
    })),
    withState(initialState),
    withComputed((store) => ({
        selectedListKey: computed(() => store.selectedListEntry().slug),
    })),
    withComputed((store) => ({
        actualListPokemonMap: computed(() => {
            const list = [...store.selectedPokemonWantKeep()];
            const sorted = list.sortAsc((pokemon) => pokemon.id);
            const map = sorted.groupBy((pokemon) => pokemon.generation);
            return map;
        }),
        resultSelected: computed((): PokemonInterface[] => {
            return store.doSearch(store._allPokemons, store.search, store.generationSelected);
        }),
    })),
    withMethods((store) => ({
        unselectAll() {
            patchState(store, { selectedPokemonWantKeep: new Set<PokemonInterface>() });
        },
        selectList(event: Event) {
            const selectElement = event.target as HTMLSelectElement;
            const selectedListSlug = selectElement.value;
            const entry = store.listEntries().find((entry) => entry.slug === selectedListSlug);
            patchState(store, { selectedListEntry: entry });
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
            const oldListNames = store.listEntries();
            const existingSlugs = oldListNames.map((entry) => entry.slug);
            const newSlug = nameList.slugify();
            if (existingSlugs.includes(newSlug)) {
                window.alert('Vous ne pouvez pas ajouter une liste qui existe déjà');
                return;
            }
            const newEntry: LabelEntry = { label: nameList, slug: newSlug };
            const newList = [...oldListNames, newEntry];
            patchState(store, { listEntries: newList, selectedListEntry: newEntry });
        },
    })),
    withMethods((store) => ({
        deleteSelectedList: () => {
            if (store.listEntries().length === 1) {
                window.alert('Vous ne pouvez pas supprimer la dernière liste');
                return;
            }
            const selectedLabel = store.selectedListEntry().label;
            const message = `Êtes-vous sûr de supprimer la liste "${selectedLabel}" avec ${store.selectedPokemonWantKeep().size} Pokémon ?`;
            store._toastService.prepare('Confirmation', message).showConfirmation(
                () => {
                    // Confirmation
                    store._listPokemonRepository.deleteList(store.selectedListEntry());
                    const oldList = store.listEntries();
                    const newList = oldList.filter((entry) => entry.slug !== store.selectedListEntry().slug);
                    const selectedEntry = newList.first();
                    patchState(store, {
                        listEntries: newList,
                        selectedListEntry: selectedEntry ?? LOCAL_STORAGE_KEEP,
                    });
                    store._toastService.prepare('✓ Supprimée', `Liste "${selectedLabel}" supprimée`).showSuccess();
                },
                () => {
                    // Annulation, ne rien faire
                },
            );
        },
        _persistListKeys: () => {
            const list = store.listEntries();
            store._listPokemonRepository.saveListKeys(list);
        },
    })),
    withHooks((store) => ({
        onInit() {
            const storageListEntries: LabelEntry[] = store._listPokemonRepository.getListKeys();
            effect(() => {
                const newSet: Set<PokemonInterface> = store._listPokemonRepository
                    .getPokemonsForList(store.selectedListEntry())
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
                const entry = store.selectedListEntry();
                store._listPokemonRepository.saveSlugsForList(entry, listSlugs);
            });
            effect(store._persistListKeys);
            const allPokemons = store._pokemonRepository.getAllPokemon();
            const selectedSlug = storageListEntries.first() ?? LOCAL_STORAGE_KEEP;
            console.log('allPokemons : ', allPokemons);
            patchState(store, {
                _allPokemons: allPokemons,
                listEntries: storageListEntries,
                selectedListEntry: selectedSlug,
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
