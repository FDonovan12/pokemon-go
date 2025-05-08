import { inject, Injectable } from '@angular/core';
import { GetAllService } from '../repositories/get-all.service';

@Injectable({
    providedIn: 'root',
})
export class BddEvent {
    private readonly getAllService: GetAllService = inject(GetAllService);

    getEventsPokemon() {
        console.log(this.getAllService);
        console.log(this.getAllService.pokemonIndex);
        console.log(this.getAllService.pokemonIndex.byName);
        return [
            {
                name: "Grandir et s'épanouir", // L’événement se déroule du vendredi 2 mai à 10h au mercredi 7 mai 20h (heure locale)
                slug: 'grandir-et-s-epanouir', // L’événement se déroule du vendredi 2 mai à 10h au mercredi 7 mai 20h (heure locale)
                savagePokemons: [
                    this.getAllService.pokemonIndex.byName.Magicarpe,
                    this.getAllService.pokemonIndex.byName.Wailmer,
                    this.getAllService.pokemonIndex.byName.Tylton,
                    this.getAllService.pokemonIndex.byName.Trompignon,
                    this.getAllService.pokemonIndex.byName.Dedenne,
                    this.getAllService.pokemonIndex.byName.Bombydou,
                    this.getAllService.pokemonIndex.byName.Munna,
                    this.getAllService.pokemonIndex.byName.Sovkipou,
                    this.getAllService.pokemonIndex.byName.Minisange,
                    //'Lilliterelle',
                ],
                eggPokemons: [
                    this.getAllService.pokemonIndex.byName.Ptiravi,
                    this.getAllService.pokemonIndex.byName['Mime-Jr'],
                    this.getAllService.pokemonIndex.byName.Toxizap,
                    this.getAllService.pokemonIndex.byName.Riolu,
                    this.getAllService.pokemonIndex.byName.Sovkipou,
                ],
            },
        ];
    }
}
