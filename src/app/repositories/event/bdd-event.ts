import { inject, Injectable } from '@angular/core';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { EventPokemon, SavageGroup } from '../../entities/event';

@Injectable({
    providedIn: 'root',
})
export class BddEvent {
    private readonly getAllService: PokemonRepository = inject(PokemonRepository);

    getEventsPokemon(): EventPokemon[] {
        const pokemons = this.getAllService.pokemonIndex.byName;
        const result: EventPokemon[] = [
            new EventPokemon(
                'Go Fest 2025', // L’événement se déroule du saemdi 28 juin à 10h au samedi 29 juin 18h (heure locale)
                new Date(2025, 5, 28, 10),
                new Date(2025, 5, 29, 18),
                [
                    new SavageGroup(
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
                    ),
                    new SavageGroup(
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
                    ),
                    new SavageGroup(
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
                    ),
                    new SavageGroup(
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
                    ),
                ],
                [],
                [],
            ),
            new EventPokemon(
                'Ruines fantômes', // L’événement se déroule du samedi 14 juin à 10h au mercredi 18 juin 20h (heure locale)
                new Date(2025, 5, 14, 10),
                new Date(2025, 5, 18, 20),
                [
                    new SavageGroup([
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
                    ]),
                ],
                [],
                [],
            ),
            new EventPokemon(
                'Prodiges Mécaniques', // L’événement se déroule du samedi 7 juin à 10h au mercredi 11 juin 20h (heure locale)
                new Date(2025, 5, 7, 10),
                new Date(2025, 5, 11, 20),
                [
                    new SavageGroup([
                        pokemons.Miaouss,
                        pokemons.Granivol,
                        pokemons.Grindur,
                        pokemons.LimondeGalar,
                        pokemons.Gringolem,
                        pokemons.Tetampoule,
                        pokemons.Terhal,
                        pokemons.Hexadron,
                        pokemons.Eoko,
                    ]),
                ],
                [],
                [pokemons.Miaouss, pokemons.Terhal, pokemons.Grindur, pokemons.LimondeGalar, pokemons.Hexadron],
            ),
            new EventPokemon(
                'Retraite Sereine', // L’événement se déroule du vendredi 30 mai à 10h au mardi 3 juin 20h (heure locale)
                new Date(2025, 4, 30, 10),
                new Date(2025, 5, 3, 20),
                [
                    new SavageGroup([
                        pokemons.Leveinard,
                        pokemons.Marill,
                        pokemons.Couafarel,
                        pokemons.Bombydou,
                        pokemons.Spododo,
                        pokemons.Dodoala,
                        pokemons.Bibichut,
                        pokemons.Ronflex,
                        pokemons.Eoko,
                    ]),
                ],
                [pokemons.Korillon, pokemons.Munna, pokemons.Fluvetin, pokemons.Sucroquin],
            ),
            new EventPokemon(
                "Grandir et s'épanouir", // L’événement se déroule du vendredi 2 mai à 10h au mercredi 7 mai 20h (heure locale)
                new Date(2025, 4, 2, 10),
                new Date(2025, 4, 7, 20),
                [
                    new SavageGroup([
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
                    ]),
                ],
                [pokemons.Ptiravi, pokemons['Mime-Jr'], pokemons.Toxizap, pokemons.Riolu, pokemons.Sovkipou],
            ),
            new EventPokemon(
                'Semaine Combat GO : Attaque finale !', // L’événement se déroule du mercredi 21 mai à 10 h au mardi 27 mai à 20 h (heure locale)
                new Date(2025, 4, 21, 10),
                new Date(2025, 4, 27, 20),
                [
                    new SavageGroup([
                        pokemons.Ferosinge,
                        pokemons.Otaria,
                        pokemons.Zigzaton,
                        pokemons.Meditikka,
                        pokemons.Grenousse,
                        pokemons.Solochi,
                        pokemons.Goupilou,
                    ]),
                ],
            ),
        ];
        result.sort((a, b) => b.startAt.getTime() - a.startAt.getTime());
        return result;
    }
}
