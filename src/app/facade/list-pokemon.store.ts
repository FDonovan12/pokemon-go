// import { computed, effect, inject } from '@angular/core';
// import { PokemonInterface, PokemonSlug } from '@entities/pokemon';
// import { patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
// import { ListPokemonRepository } from '@repositories/list-pokemon-repository/list-pokemon.repository';
// import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';

// const initialState = {
//     _allFamilyPokemon: [] as PokemonInterface[],
//     listName: [''],
// };

// export const ListPokemonStore = signalStore(
//     { providedIn: 'root' },
//     withProps(() => ({
//         _pokemonRepository: inject(PokemonRepository),
//         _listPokemonRepository: inject(ListPokemonRepository),
//     })),
//     withState(initialState),
//     withComputed((store) => ({
//         selectedListKey: computed(() => store.selectedListName().slugify()),
//     })),
//     withComputed((store) => ({})),
//     withMethods((store) => ({
//         selectList(selectedListName: string) {
//             patchState(store, { selectedListName });
//         },
//         exportKeepPokemon() {
//             const slugs = Array.from(store.selectedPokemonWantKeep()); // Ou plus si tu veux
//             const blob = new Blob([JSON.stringify(slugs, null, 2)], {
//                 type: 'application/json',
//             });

//             const a = document.createElement('a');
//             a.href = URL.createObjectURL(blob);
//             a.download = 'keep-pokemon.json';
//             a.click();

//             URL.revokeObjectURL(a.href);
//         },
//         addList: (nameList: string) => {
//             const oldList = store.listName();
//             const oldListSlugify = oldList.map((list) => list.slugify());
//             if (oldListSlugify.includes(nameList.slugify())) {
//                 window.alert('Vous ne pouvez pas ajouter une liste qui existe déjà');
//                 return;
//             }
//             const newList = [...oldList, nameList];
//             patchState(store, { listName: newList });
//         },
//         selectPokemon(pokemon: PokemonInterface) {
//             const set = new Set<PokemonSlug>(store.selectedPokemonWantKeep());
//             const slug = pokemon.slug;
//             if (set.has(slug)) {
//                 set.delete(slug);
//             } else {
//                 set.add(slug);
//             }
//             patchState(store, { selectedPokemonWantKeep: set });
//         },
//     })),
//     withMethods((store) => ({})),
//     withHooks((store) => ({
//         onInit() {
//             const storageListName: string[] = store._listPokemonRepository.getListKeys();
//             effect(() => {
//                 const newSet: Set<PokemonSlug> = store._listPokemonRepository
//                     .getSlugsForList(store.selectedListKey())
//                     .toSet();
//                 patchState(store, {
//                     selectedPokemonWantKeep: newSet,
//                 });
//             });
//             effect(() => {
//                 const list = [...store.selectedPokemonWantKeep()];
//                 store._listPokemonRepository.saveSlugsForList(store.selectedListKey(), list);
//             });
//             effect(() => {
//                 const list = store.listName();
//                 store._listPokemonRepository.saveListKeys(list);
//             });
//         },
//     })),
// );
