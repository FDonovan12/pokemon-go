import { inject, Injectable } from '@angular/core';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { EventBuilder, EventPokemon } from '../../entities/event';

@Injectable({
    providedIn: 'root',
})
export class BddEvent {
    private readonly getAllService: PokemonRepository = inject(PokemonRepository);

    getEventsPokemon(): EventPokemon[] {
        const pokemons = this.getAllService.pokemonIndex.byName;
        const result: EventPokemon[] = [
            new EventBuilder()
                .withName('Go Fest 2025') // L’événement se déroule du samedi 28 juin à 10h au samedi 29 juin 18h (heure locale))
                .withStartAt(new Date(2025, 5, 28, 10))
                .withEndAt(new Date(2025, 5, 29, 18))
                .addSavageGroup(
                    [
                        pokemons.Malosse,
                        pokemons.Chamallot,
                        pokemons.Skelenox,
                        pokemons.Scrutella,
                        pokemons.Gringolem,
                        pokemons.Passerouge,
                        pokemons.Flabebe,
                        pokemons.Venalgue,
                        pokemons.Chochodile,
                        pokemons.Strassie,
                    ],
                    'Volcan',
                )
                .addSavageGroup(
                    [
                        pokemons.Machoc,
                        pokemons.Elektek,
                        pokemons.Teddiursa,
                        pokemons.Baggiguane,
                        pokemons.Marisson,
                        pokemons.Flabebe,
                        pokemons.Pandespiegle,
                        pokemons.Dedenne,
                        pokemons.Crabagarre,
                        pokemons.Kungfouine,
                    ],
                    'Dojo',
                )
                .addSavageGroup(
                    [
                        pokemons.SabletteAlola,
                        pokemons.Marcacrin,
                        pokemons.Obalie,
                        pokemons.Tiplouf,
                        pokemons.Blizzi,
                        pokemons.Munna,
                        pokemons.Lewsor,
                        pokemons.Flabebe,
                        pokemons.Grelacon,
                        pokemons.Frigodo,
                    ],
                    'Tundra',
                )
                .addSavageGroup(
                    [
                        pokemons.Melofee,
                        pokemons.Tentacool,
                        pokemons.Mysdibule,
                        pokemons.Gloupti,
                        pokemons.Venipatte,
                        pokemons.Otaquin,
                        pokemons.Vorasterie,
                        pokemons.Spododo,
                        pokemons.Togetic,
                        pokemons.Flabebe,
                    ],
                    'Swamp',
                )
                .build(),
            new EventBuilder()
                .withName('Ruines fantômes') // L’événement se déroule du samedi 14 juin à 10h au mercredi 18 juin 20h (heure locale))
                .withStartAt(new Date(2025, 5, 14, 10))
                .withEndAt(new Date(2025, 5, 18, 20))

                .addSavageGroup([
                    pokemons.Rhinocorne,
                    pokemons.Skelenox,
                    pokemons.Rapion,
                    pokemons.Rototaupe,
                    pokemons.Arkeapti,
                    pokemons.Scrutella,
                    pokemons.Gringolem,
                    pokemons.Brocelome,
                    pokemons.Eoko,
                    pokemons.Tenefix,
                ])
                .build(),
            new EventBuilder()
                .withName('Prodiges Mécaniques') // L’événement se déroule du samedi 7 juin à 10h au mercredi 11 juin 20h (heure locale))
                .withStartAt(new Date(2025, 5, 7, 10))
                .withEndAt(new Date(2025, 5, 11, 20))

                .addSavageGroup([
                    pokemons.Miaouss,
                    pokemons.Granivol,
                    pokemons.Grindur,
                    pokemons.LimondeGalar,
                    pokemons.Gringolem,
                    pokemons.Tetampoule,
                    pokemons.Terhal,
                    pokemons.Hexadron,
                    pokemons.Eoko,
                ])
                .withRaidPokemons([
                    pokemons.Miaouss,
                    pokemons.Terhal,
                    pokemons.Grindur,
                    pokemons.LimondeGalar,
                    pokemons.Hexadron,
                ])
                .build(),
            new EventBuilder()
                .withName('Retraite Sereine') // L’événement se déroule du vendredi 30 mai à 10h au mardi 3 juin 20h (heure locale))
                .withStartAt(new Date(2025, 4, 30, 10))
                .withEndAt(new Date(2025, 5, 3, 20))

                .addSavageGroup([
                    pokemons.Leveinard,
                    pokemons.Marill,
                    pokemons.Couafarel,
                    pokemons.Bombydou,
                    pokemons.Spododo,
                    pokemons.Dodoala,
                    pokemons.Bibichut,
                    pokemons.Ronflex,
                    pokemons.Eoko,
                ])
                .withEggPokemons([pokemons.Korillon, pokemons.Munna, pokemons.Fluvetin, pokemons.Sucroquin])
                .build(),
            new EventBuilder()
                .withName("Grandir et s'épanouir") // L’événement se déroule du vendredi 2 mai à 10h au mercredi 7 mai 20h (heure locale))
                .withStartAt(new Date(2025, 4, 2, 10))
                .withEndAt(new Date(2025, 4, 7, 20))

                .addSavageGroup([
                    pokemons.Magicarpe,
                    pokemons.Wailmer,
                    pokemons.Tylton,
                    pokemons.Trompignon,
                    pokemons.Dedenne,
                    pokemons.Bombydou,
                    pokemons.Munna,
                    pokemons.Sovkipou,
                    pokemons.Minisange,
                    pokemons.Lilliterelle,
                ])
                .withEggPokemons([
                    pokemons.Ptiravi,
                    pokemons['Mime-Jr'],
                    pokemons.Toxizap,
                    pokemons.Riolu,
                    pokemons.Sovkipou,
                ])
                .build(),
            new EventBuilder()
                .withName('Semaine Combat GO : Attaque finale !') // L’événement se déroule du mercredi 21 mai à 10 h au mardi 27 mai à 20 h (heure locale))
                .withStartAt(new Date(2025, 4, 21, 10))
                .withEndAt(new Date(2025, 4, 27, 20))

                .addSavageGroup([
                    pokemons.Ferosinge,
                    pokemons.Otaria,
                    pokemons.Zigzaton,
                    pokemons.Meditikka,
                    pokemons.Grenousse,
                    pokemons.Solochi,
                    pokemons.Goupilou,
                ])
                .build(),
        ];
        result.sort((a, b) => b.startAt.getTime() - a.startAt.getTime());
        return result;
    }
}
