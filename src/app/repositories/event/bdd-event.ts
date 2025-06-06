import { inject, Injectable } from '@angular/core';
import { EventBuilder, EventPokemon, PokemonWithRarity } from '@entities/event';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';

@Injectable({
    providedIn: 'root',
})
export class BddEvent {
    private readonly getAllService: PokemonRepository = inject(PokemonRepository);

    getEventsPokemon(): EventPokemon[] {
        const pokemons = this.getAllService.pokemonIndex.byName;
        const result: EventPokemon[] = [
            new EventBuilder()
                .withName('Saison Jours heureux')
                .withStartAt(new Date(2025, 5, 3, 10))
                .withEndAt(new Date(2025, 8, 2, 10))
                .addSavageGroup(
                    [
                        new PokemonWithRarity(pokemons.VoltorbeHisui),
                        new PokemonWithRarity(pokemons.Arcko),
                        new PokemonWithRarity(pokemons.Poussifeu),
                        new PokemonWithRarity(pokemons.Gobou),
                        new PokemonWithRarity(pokemons.Vivaldaim),
                        new PokemonWithRarity(pokemons.Mucuscule),
                        new PokemonWithRarity(pokemons.Mimantis),
                    ],
                    'Nord',
                )
                .addSavageGroup(
                    [
                        new PokemonWithRarity(pokemons.QwilfishHisui),
                        new PokemonWithRarity(pokemons.Draby),
                        new PokemonWithRarity(pokemons.Tortipouss),
                        new PokemonWithRarity(pokemons.Ouisticram),
                        new PokemonWithRarity(pokemons.Tiplouf),
                        new PokemonWithRarity(pokemons.Vivaldaim),
                        new PokemonWithRarity(pokemons.Grelacon),
                    ],
                    'Sud',
                )
                .addSavageGroup(
                    [
                        new PokemonWithRarity(pokemons.Roucarnage),
                        new PokemonWithRarity(pokemons.MiaoussAlola),
                        new PokemonWithRarity(pokemons.Cheniti),
                        new PokemonWithRarity(pokemons.Chaglam),
                        new PokemonWithRarity(pokemons.Baggiguane),
                        new PokemonWithRarity(pokemons.Funecire),
                        new PokemonWithRarity(pokemons.Patachiot),
                    ],
                    'Villes',
                )
                .addSavageGroup(
                    [
                        new PokemonWithRarity(pokemons.PonytaGalar),
                        new PokemonWithRarity(pokemons.Pharamp),
                        new PokemonWithRarity(pokemons.Simularbre),
                        new PokemonWithRarity(pokemons.Cheniti),
                        new PokemonWithRarity(pokemons.Ratentif),
                        new PokemonWithRarity(pokemons.Chlorobule),
                        new PokemonWithRarity(pokemons.Tournicoton),
                    ],
                    'Forêts',
                )
                .addSavageGroup(
                    [
                        new PokemonWithRarity(pokemons.RacaillouAlola),
                        new PokemonWithRarity(pokemons.Tarinor),
                        new PokemonWithRarity(pokemons.Galeking),
                        new PokemonWithRarity(pokemons.Cheniti),
                        new PokemonWithRarity(pokemons.LimondeGalar),
                        new PokemonWithRarity(pokemons.Sapereau),
                        new PokemonWithRarity(pokemons.Minisange),
                    ],
                    'Montagnes',
                )
                .addSavageGroup(
                    [
                        new PokemonWithRarity(pokemons.RamolossGalar),
                        new PokemonWithRarity(pokemons.Leviator),
                        new PokemonWithRarity(pokemons.Demanta),
                        new PokemonWithRarity(pokemons.Keunotor),
                        new PokemonWithRarity(pokemons.Araqua),
                        new PokemonWithRarity(pokemons.Denticrisse),
                        new PokemonWithRarity(pokemons.Tetampoule),
                    ],
                    'Plages',
                )
                .build(),
            new EventBuilder()
                .withName('Go Fest 2025') // L’événement se déroule du samedi 28 juin à 10h au samedi 29 juin 18h (heure locale))
                .withStartAt(new Date(2025, 5, 28, 10))
                .withEndAt(new Date(2025, 5, 29, 18))
                .addSavageGroup(
                    [
                        new PokemonWithRarity(pokemons.Leveinard),
                        new PokemonWithRarity(pokemons.Airmure),
                        new PokemonWithRarity(pokemons.Embrylex),
                        new PokemonWithRarity(pokemons.Dinoclier),
                        new PokemonWithRarity(pokemons.Escargaume),
                        new PokemonWithRarity(pokemons.Vostourno),
                        new PokemonWithRarity(pokemons.Gouroutan),
                        new PokemonWithRarity(pokemons.Mucuscule, true),
                    ],
                    'Samedi',
                )
                .addSavageGroup(
                    [
                        new PokemonWithRarity(pokemons.CanartichoGalar),
                        new PokemonWithRarity(pokemons.Osselait),
                        new PokemonWithRarity(pokemons.Tarsal),
                        new PokemonWithRarity(pokemons.Carabing),
                        new PokemonWithRarity(pokemons.Scalpion),
                        new PokemonWithRarity(pokemons.Solochi),
                        new PokemonWithRarity(pokemons.Quartermac),
                        new PokemonWithRarity(pokemons.Bebecaille, true),
                    ],
                    'Dimanche',
                )
                .addSavageGroup(
                    [
                        new PokemonWithRarity(pokemons.Malosse),
                        new PokemonWithRarity(pokemons.Chamallot),
                        new PokemonWithRarity(pokemons.Skelenox),
                        new PokemonWithRarity(pokemons.Scrutella),
                        new PokemonWithRarity(pokemons.Gringolem),
                        new PokemonWithRarity(pokemons.Passerouge),
                        new PokemonWithRarity(pokemons.Flabebe),
                        new PokemonWithRarity(pokemons.Venalgue),
                        new PokemonWithRarity(pokemons.Chochodile),
                        new PokemonWithRarity(pokemons.Strassie, true),
                    ],
                    'Volcan',
                )
                .addSavageGroup(
                    [
                        new PokemonWithRarity(pokemons.Machoc),
                        new PokemonWithRarity(pokemons.Elektek),
                        new PokemonWithRarity(pokemons.Teddiursa),
                        new PokemonWithRarity(pokemons.Baggiguane),
                        new PokemonWithRarity(pokemons.Marisson),
                        new PokemonWithRarity(pokemons.Flabebe),
                        new PokemonWithRarity(pokemons.Pandespiegle),
                        new PokemonWithRarity(pokemons.Dedenne),
                        new PokemonWithRarity(pokemons.Crabagarre),
                        new PokemonWithRarity(pokemons.Kungfouine, true),
                    ],
                    'Dojo',
                )
                .addSavageGroup(
                    [
                        new PokemonWithRarity(pokemons.SabletteAlola),
                        new PokemonWithRarity(pokemons.Marcacrin),
                        new PokemonWithRarity(pokemons.Obalie),
                        new PokemonWithRarity(pokemons.Tiplouf),
                        new PokemonWithRarity(pokemons.Blizzi),
                        new PokemonWithRarity(pokemons.Munna),
                        new PokemonWithRarity(pokemons.Lewsor),
                        new PokemonWithRarity(pokemons.Flabebe),
                        new PokemonWithRarity(pokemons.Grelacon),
                        new PokemonWithRarity(pokemons.Frigodo, true),
                    ],
                    'Tundra',
                )
                .addSavageGroup(
                    [
                        new PokemonWithRarity(pokemons.Melofee),
                        new PokemonWithRarity(pokemons.Tentacool),
                        new PokemonWithRarity(pokemons.Mysdibule),
                        new PokemonWithRarity(pokemons.Gloupti),
                        new PokemonWithRarity(pokemons.Venipatte),
                        new PokemonWithRarity(pokemons.Otaquin),
                        new PokemonWithRarity(pokemons.Vorasterie),
                        new PokemonWithRarity(pokemons.Spododo),
                        new PokemonWithRarity(pokemons.Togetic, true),
                        new PokemonWithRarity(pokemons.Flabebe, true),
                    ],
                    'Swamp',
                )
                .build(),
            new EventBuilder()
                .withName('Ruines fantômes') // L’événement se déroule du samedi 14 juin à 10h au mercredi 18 juin 20h (heure locale))
                .withStartAt(new Date(2025, 5, 14, 10))
                .withEndAt(new Date(2025, 5, 18, 20))

                .addSavageGroup([
                    new PokemonWithRarity(pokemons.Rhinocorne),
                    new PokemonWithRarity(pokemons.Skelenox),
                    new PokemonWithRarity(pokemons.Rapion),
                    new PokemonWithRarity(pokemons.Rototaupe),
                    new PokemonWithRarity(pokemons.Arkeapti),
                    new PokemonWithRarity(pokemons.Scrutella),
                    new PokemonWithRarity(pokemons.Gringolem),
                    new PokemonWithRarity(pokemons.Brocelome),
                    new PokemonWithRarity(pokemons.Eoko),
                    new PokemonWithRarity(pokemons.Tenefix),
                ])
                .build(),
            new EventBuilder()
                .withName('Prodiges Mécaniques') // L’événement se déroule du samedi 7 juin à 10h au mercredi 11 juin 20h (heure locale))
                .withStartAt(new Date(2025, 5, 7, 10))
                .withEndAt(new Date(2025, 5, 11, 20))

                .addSavageGroup([
                    new PokemonWithRarity(pokemons.Miaouss),
                    new PokemonWithRarity(pokemons.Granivol),
                    new PokemonWithRarity(pokemons.Grindur),
                    new PokemonWithRarity(pokemons.LimondeGalar),
                    new PokemonWithRarity(pokemons.Gringolem),
                    new PokemonWithRarity(pokemons.Tetampoule),
                    new PokemonWithRarity(pokemons.Terhal),
                    new PokemonWithRarity(pokemons.Hexadron),
                    new PokemonWithRarity(pokemons.Eoko),
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
                    new PokemonWithRarity(pokemons.Leveinard),
                    new PokemonWithRarity(pokemons.Marill),
                    new PokemonWithRarity(pokemons.Couafarel),
                    new PokemonWithRarity(pokemons.Bombydou),
                    new PokemonWithRarity(pokemons.Spododo),
                    new PokemonWithRarity(pokemons.Dodoala),
                    new PokemonWithRarity(pokemons.Bibichut),
                    new PokemonWithRarity(pokemons.Ronflex),
                    new PokemonWithRarity(pokemons.Eoko),
                ])
                .withEggPokemons([pokemons.Korillon, pokemons.Munna, pokemons.Fluvetin, pokemons.Sucroquin])
                .build(),
            new EventBuilder()
                .withName("Grandir et s'épanouir") // L’événement se déroule du vendredi 2 mai à 10h au mercredi 7 mai 20h (heure locale))
                .withStartAt(new Date(2025, 4, 2, 10))
                .withEndAt(new Date(2025, 4, 7, 20))

                .addSavageGroup([
                    new PokemonWithRarity(pokemons.Magicarpe),
                    new PokemonWithRarity(pokemons.Wailmer),
                    new PokemonWithRarity(pokemons.Tylton),
                    new PokemonWithRarity(pokemons.Trompignon),
                    new PokemonWithRarity(pokemons.Dedenne),
                    new PokemonWithRarity(pokemons.Bombydou),
                    new PokemonWithRarity(pokemons.Munna),
                    new PokemonWithRarity(pokemons.Sovkipou),
                    new PokemonWithRarity(pokemons.Minisange),
                    new PokemonWithRarity(pokemons.Lilliterelle),
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
                    new PokemonWithRarity(pokemons.Ferosinge),
                    new PokemonWithRarity(pokemons.Otaria),
                    new PokemonWithRarity(pokemons.Zigzaton),
                    new PokemonWithRarity(pokemons.Meditikka),
                    new PokemonWithRarity(pokemons.Grenousse),
                    new PokemonWithRarity(pokemons.Solochi),
                    new PokemonWithRarity(pokemons.Goupilou),
                ])
                .build(),
        ];
        result.sort((a, b) => b.startAt.getTime() - a.startAt.getTime());
        return result;
    }
}
