import { inject, Injectable } from '@angular/core';
import { EventInterface } from '../../entities/event';
import { GetAllService, PokemonInterface } from '../pokemon/get-all.service';

@Injectable({
    providedIn: 'root',
})
export class BddEvent {
    private readonly getAllService: GetAllService = inject(GetAllService);

    getEventsPokemon(): EventInterface[] {
        const pokemons = this.getAllService.pokemonIndex.byName;
        const result: EventInterface[] = [
            {
                name: "Grandir et s'épanouir", // L’événement se déroule du vendredi 2 mai à 10h au mercredi 7 mai 20h (heure locale)
                slug: 'grandir-et-s-epanouir', // L’événement se déroule du vendredi 2 mai à 10h au mercredi 7 mai 20h (heure locale)
                savagePokemons: [
                    pokemons.Magicarpe,
                    pokemons.Wailmer,
                    pokemons.Tylton,
                    pokemons.Trompignon,
                    pokemons.Dedenne,
                    pokemons.Bombydou,
                    pokemons.Munna,
                    pokemons.Sovkipou,
                    pokemons.Minisange,
                    //'Lilliterelle',
                ],
                eggPokemons: [
                    pokemons.Ptiravi,
                    pokemons['Mime-Jr'],
                    pokemons.Toxizap,
                    pokemons.Riolu,
                    pokemons.Sovkipou,
                ],
            },
        ];
        return result;
    }

    private returnSavageWithMega(savages: PokemonInterface[]) {
        const result: (PokemonInterface & { mega: any })[] = [];
        const megas = this.getAllService.megaList.filter((mega) => this.countTypeBoost(mega, savages));
        for (let savage of savages) {
            const megaPossible = megas.filter((mega) => this.haveTypeInCommon(mega, savage));
            const newSavage = { ...savage, mega: megaPossible };
            result.push(newSavage);
        }
        return result;
    }
    haveTypeInCommon(pokemon1: PokemonInterface, pokemon2: PokemonInterface): boolean {
        return pokemon1.type.some((type) => type === pokemon2.type[0] || type === pokemon2.type[1]);
    }

    countTypeBoost(mega: PokemonInterface, savages: PokemonInterface[], minCount: number = 2): boolean {
        if (mega.type.length < minCount) return false;
        let totalListCount = 0;
        const listPokemonBuffPerType: any = Object.fromEntries(mega.type.map((type) => [type, []]));
        const countBoostPerType: any = mega.type.reduce((obj: any, key) => {
            obj[key] = 0;
            return obj;
        }, {});
        savages.forEach((savage) => {
            let boost = false;
            mega.type.forEach((type) => {
                if (savage.type.includes(type)) {
                    countBoostPerType[type]++;
                    listPokemonBuffPerType[type].push(savage);
                    boost = true;
                }
            });
            if (boost) totalListCount++;
        });
        let maxLength = Math.max(...Object.values(listPokemonBuffPerType).map((list: any) => list.length));

        return maxLength < totalListCount;
    }
}
