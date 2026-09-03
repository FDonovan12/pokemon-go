import { computed, effect, inject, Injector } from '@angular/core';
import { LabelEntry, ListLabel, ListSlug } from '@entities/label';
import { Base } from '@entities/pokemon';
import { patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { ListPokemonRepository } from '@repositories/list-pokemon-repository/list-pokemon.repository';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { LocalStorageService } from '@services/local-storage-service/local-storage-service';
import { withPokemonSearch } from '@shared/features/pokemon-search/with-pokemon-search.feature';
import { ToastService } from '@shared/features/toast/toast.service';
import { persistToLocalStorage } from '@shared/utils/utils';

const LOCAL_STORAGE_KEEP = { label: 'veut garder', slug: 'pokemon-want-keep' } as LabelEntry;
const LAST_SELECTED_ENTRY_KEY = 'LAST_SELECTED_ENTRY_KEY';

const initialState = {
    listEntries: [] as LabelEntry[],
    selectedListEntry: { label: '', slug: '' } as LabelEntry,
    selectedPokemonWantKeep: new Set<Base>(),
};

export const ListPokemonPageStore = signalStore(
    { providedIn: 'root' },
    withPokemonSearch<Base>(),
    withProps(() => ({
        _pokemonRepository: inject(PokemonRepository),
        _localStorageService: inject(LocalStorageService),
        _listPokemonRepository: inject(ListPokemonRepository),
        _toastService: inject(ToastService),
    })),
    withState(initialState),
    withComputed((store) => ({
        selectedListKey: computed(() => store.selectedListEntry().slug),
        filteredPokemons: computed(() => store.resultSelected()),
    })),
    withComputed((store) => ({
        actualListPokemonMap: computed(() => {
            const list = [...store.selectedPokemonWantKeep()];
            const sorted = list.sortAsc((pokemon) => pokemon.dexNumber);
            const map = sorted.groupBy((pokemon) => pokemon.generation);
            return map;
        }),
    })),
    withMethods((store) => ({
        _persistListKeys: () => {
            const list = store.listEntries();
            store._listPokemonRepository.saveListKeys(list);
        },
        _persistListOfPokemon: () => {
            const listSlugs = store
                .selectedPokemonWantKeep()
                .toList()
                .map((pokemon: Base) => pokemon.slug);
            const entry = store.selectedListEntry();
            // store._listPokemonRepository.saveSlugsForList(entry, listSlugs);
        },
        _syncSelectedPokemonWantKeep: async () => {
            const newSet: Set<Base> = (
                await store._listPokemonRepository.getPokemonsForList(store.selectedListEntry())
            ).toSet();
            patchState(store, {
                selectedPokemonWantKeep: newSet,
            });
        },
    })),
    withMethods((store) => ({
        unselectAll() {
            patchState(store, { selectedPokemonWantKeep: new Set<Base>() });
        },
        selectList(event: Event) {
            const selectElement = event.target as HTMLSelectElement;
            const selectedListSlug = selectElement.value;
            const entry = store.listEntries().find((entry) => entry.slug === selectedListSlug);
            patchState(store, { selectedListEntry: entry });
        },
        selectPokemon(pokemon: Base) {
            const set = new Set<Base>(store.selectedPokemonWantKeep());
            if (set.has(pokemon)) {
                set.delete(pokemon);
                store._listPokemonRepository.removeSlugFromList(store.selectedListEntry(), pokemon.slug);
            } else {
                set.add(pokemon);
                store._listPokemonRepository.addSlugToList(store.selectedListEntry(), pokemon.slug);
            }
            patchState(store, { selectedPokemonWantKeep: set });
        },
        addList: (nameList: ListLabel): LabelEntry => {
            const oldListNames = store.listEntries();
            const newId = crypto.randomUUID() as ListSlug;

            const newEntry: LabelEntry = { label: nameList, slug: newId };
            const newList = [...oldListNames, newEntry];
            patchState(store, { listEntries: newList, selectedListEntry: newEntry });
            store._persistListKeys();
            return newEntry;
        },
    })),
    withMethods((store) => ({
        selectListPokemon(pokemons: Base[]) {
            pokemons.forEach((pokemon) => store.selectPokemon(pokemon));
        },
        reverseSelectedPokemon() {
            store._allPokemons().forEach((pokemon) => store.selectPokemon(pokemon));
        },
    })),
    withMethods((store) => ({
        renameSelectedList: (name: string) => {
            const label = name as ListLabel;
            const newSelectedEntry = store.selectedListEntry();
            newSelectedEntry.label = label;
            store._persistListKeys();
        },
        duplicateSelectedList: (name: string) => {
            const label = name as ListLabel;
            const newEntry = store.addList(label);
            const oldSet: Set<Base> = store.selectedPokemonWantKeep().toList().toSet();
            store._listPokemonRepository.addAllSlugsToList(
                newEntry,
                oldSet.toList().map((pokemon) => pokemon.slug),
            );
            patchState(store, {
                selectedPokemonWantKeep: oldSet,
            });
        },
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
                    store._persistListKeys();
                    store._toastService.prepare('✓ Supprimée', `Liste "${selectedLabel}" supprimée`).showSuccess();
                },
                () => {
                    // Annulation, ne rien faire
                },
            );
        },
    })),
    withHooks((store) => ({
        async onInit() {
            const injector = inject(Injector);
            effect(store._syncSelectedPokemonWantKeep);
            effect(store._persistListOfPokemon);
            effect(() => {
                const allPokemons = store._pokemonRepository.baseForm.getAll();
                patchState(store, {
                    _allPokemons: allPokemons,
                });
            });
            // effect(store._persistListKeys);

            const storageListEntries: LabelEntry[] = await store._listPokemonRepository.getListKeys();

            const selectedSlug = store._localStorageService.get(
                LAST_SELECTED_ENTRY_KEY,
                storageListEntries.first() ?? LOCAL_STORAGE_KEEP,
            );

            patchState(store, {
                // _allPokemons: allPokemons,
                listEntries: storageListEntries,
                selectedListEntry: selectedSlug,
            });
            persistToLocalStorage(LAST_SELECTED_ENTRY_KEY, store.selectedListEntry, injector);
        },
    })),
);
