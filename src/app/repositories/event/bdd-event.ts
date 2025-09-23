import { Injectable, inject } from '@angular/core';
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
                .withName('Totalement Normal')
                .withStartAt(new Date(2025, 8, 23, 10))
                .withEndAt(new Date(2025, 8, 17, 20))
                .addSavageGroup([
                    new PokemonWithRarity(pokemons.Fouinette),
                    new PokemonWithRarity(pokemons.Insolourdo),
                    new PokemonWithRarity(pokemons.Laporeille),
                    new PokemonWithRarity(pokemons.Chuchmur),
                    new PokemonWithRarity(pokemons.Roucool),
                    new PokemonWithRarity(pokemons.Parecool),
                    new PokemonWithRarity(pokemons.Teddiursa),
                    new PokemonWithRarity(pokemons.Nanmeouie, true),
                ])
                .build(),
            new EventBuilder()
                .withName('Journée Étude Fossiles')
                .withStartAt(new Date(2025, 7, 2, 14))
                .withEndAt(new Date(2025, 7, 2, 17))
                .addSavageGroup([
                    new PokemonWithRarity(pokemons.Amonita),
                    new PokemonWithRarity(pokemons.Kabuto),
                    new PokemonWithRarity(pokemons.Lilia),
                    new PokemonWithRarity(pokemons.Anorith),
                    new PokemonWithRarity(pokemons.Kranidos),
                    new PokemonWithRarity(pokemons.Dinoclier),
                    new PokemonWithRarity(pokemons.Arkeapti, true),
                    new PokemonWithRarity(pokemons.Carapagos, true),
                ])
                .build(),
            new EventBuilder()
                .withName('Semaine Aventure')
                .withStartAt(new Date(2025, 6, 29, 14))
                .withEndAt(new Date(2025, 7, 3, 17))
                .addSavageGroup(
                    [
                        new PokemonWithRarity(pokemons.Snubbull),
                        new PokemonWithRarity(pokemons.Miamiasme),
                        new PokemonWithRarity(pokemons.Lewsor),
                        new PokemonWithRarity(pokemons.Grillepattes),
                        new PokemonWithRarity(pokemons.Psystigri, true),
                    ],
                    'Villes',
                )
                .addSavageGroup(
                    [
                        new PokemonWithRarity(pokemons.Rongourmand),
                        new PokemonWithRarity(pokemons.Patachiot),
                        new PokemonWithRarity(pokemons.Olivini),
                        new PokemonWithRarity(pokemons.Tetampoule),
                        new PokemonWithRarity(pokemons.Terracool, true),
                    ],
                    'Forêts et plaines',
                )
                .addSavageGroup(
                    [
                        new PokemonWithRarity(pokemons.Hippopotas),
                        new PokemonWithRarity(pokemons.Rototaupe),
                        new PokemonWithRarity(pokemons.Furaiglon),
                        new PokemonWithRarity(pokemons.Scorplane, true),
                    ],
                    'Montagnes',
                )
                .addSavageGroup(
                    [
                        new PokemonWithRarity(pokemons.Sepiatop),
                        new PokemonWithRarity(pokemons.Vorasterie),
                        new PokemonWithRarity(pokemons.Araqua),
                        new PokemonWithRarity(pokemons.Bacabouh),
                        new PokemonWithRarity(pokemons.Taupikeau),
                    ],
                    'Plages et étendues d’eau',
                )
                .build(),
            new EventBuilder()
                .withName('Ultra Bonus : D’acier et d’écailles')
                .withStartAt(new Date(2025, 6, 22, 10))
                .withEndAt(new Date(2025, 6, 27, 20))
                .addSavageGroup([
                    new PokemonWithRarity(pokemons.Magneti),
                    new PokemonWithRarity(pokemons.Minidraco),
                    new PokemonWithRarity(pokemons.Galekid),
                    new PokemonWithRarity(pokemons.Terhal),
                    new PokemonWithRarity(pokemons.Draby),
                    new PokemonWithRarity(pokemons.Grindur),
                    new PokemonWithRarity(pokemons.Sonistrelle),
                    new PokemonWithRarity(pokemons.Minisange),
                    new PokemonWithRarity(pokemons.Coupenotte, true),
                    new PokemonWithRarity(pokemons.Mucuscule, true),
                ])
                .build(),
            new EventBuilder()
                .withName('Festival Aquatique')
                .withStartAt(new Date(2025, 6, 15, 10))
                .withEndAt(new Date(2025, 6, 20, 20))
                .addSavageGroup([
                    new PokemonWithRarity(pokemons.Carapuce),
                    new PokemonWithRarity(pokemons.Ramoloss),
                    new PokemonWithRarity(pokemons.Krabby),
                    new PokemonWithRarity(pokemons.Stari),
                    new PokemonWithRarity(pokemons.Magicarpe),
                    new PokemonWithRarity(pokemons.Marill),
                    new PokemonWithRarity(pokemons.Barloche),
                    new PokemonWithRarity(pokemons.Coquiperl),
                    new PokemonWithRarity(pokemons.Mustebouee),
                    new PokemonWithRarity(pokemons.Ecayon),
                    new PokemonWithRarity(pokemons.Sovkipou),
                    new PokemonWithRarity(pokemons.Lanturn, true),
                    new PokemonWithRarity(pokemons.Barpau, true),
                    new PokemonWithRarity(pokemons.Batracne, true),
                    new PokemonWithRarity(pokemons.Carapagos, true),
                ])
                .build(),
            new EventBuilder()
                .withName('Ultra Bonus : Célébration de Hisui')
                .withStartAt(new Date(2025, 6, 8, 10))
                .withEndAt(new Date(2025, 6, 13, 20))
                .addSavageGroup([
                    new PokemonWithRarity(pokemons.Nosferapti),
                    new PokemonWithRarity(pokemons.Voltorbe.alternatives?.Hisui!),
                    new PokemonWithRarity(pokemons.Qwilfish.alternatives?.Hisui!),
                    new PokemonWithRarity(pokemons.Zorua.alternatives?.Hisui!),
                    new PokemonWithRarity(pokemons.Magicarpe),
                    new PokemonWithRarity(pokemons.Etourmi),
                    new PokemonWithRarity(pokemons.Cradopaud),
                    new PokemonWithRarity(pokemons.Chlorobule),
                    new PokemonWithRarity(pokemons.Furaiglon),
                    new PokemonWithRarity(pokemons.Grelacon),
                    new PokemonWithRarity(pokemons.Farfuret, true),
                    new PokemonWithRarity(pokemons.Embrylex, true),
                    new PokemonWithRarity(pokemons.Draby, true),
                ])
                .build(),
            new EventBuilder()
                .withName('Sur les traces de Voltoutou')
                .withStartAt(new Date(2025, 5, 20, 1))
                .withEndAt(new Date(2025, 5, 22, 23))
                .addSavageGroup([
                    new PokemonWithRarity(pokemons.Caninos.alternatives?.Hisui!, true),
                    new PokemonWithRarity(pokemons.Caninos),
                    new PokemonWithRarity(pokemons.Snubbull),
                    new PokemonWithRarity(pokemons.Malosse),
                    new PokemonWithRarity(pokemons.Medhyena),
                    new PokemonWithRarity(pokemons.Dynavolt),
                    new PokemonWithRarity(pokemons.Ponchiot),
                    new PokemonWithRarity(pokemons.Couafarel),
                    new PokemonWithRarity(pokemons.Patachiot),
                    new PokemonWithRarity(pokemons.Voltoutou, true),
                ])
                .build(),
            new EventBuilder()
                .withName('Saison Jours heureux')
                .withStartAt(new Date(2025, 5, 3, 10))
                .withEndAt(new Date(2025, 8, 2, 10))
                .addSavageGroup(
                    [
                        new PokemonWithRarity(pokemons.Voltorbe.alternatives?.Hisui!),
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
                        new PokemonWithRarity(pokemons.Qwilfish.alternatives?.Hisui!),
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
                        new PokemonWithRarity(pokemons.Miaouss.alternatives?.Alola!),
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
                        new PokemonWithRarity(pokemons.Ponyta.alternatives?.Galar!),
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
                        new PokemonWithRarity(pokemons.Racaillou.alternatives?.Alola!),
                        new PokemonWithRarity(pokemons.Tarinor),
                        new PokemonWithRarity(pokemons.Galeking),
                        new PokemonWithRarity(pokemons.Cheniti),
                        new PokemonWithRarity(pokemons.Limonde.alternatives?.Galar!),
                        new PokemonWithRarity(pokemons.Sapereau),
                        new PokemonWithRarity(pokemons.Minisange),
                    ],
                    'Montagnes',
                )
                .addSavageGroup(
                    [
                        new PokemonWithRarity(pokemons.Ramoloss.alternatives?.Galar!),
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
                .withName('Go Fest 2025')
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
                        new PokemonWithRarity(pokemons.Canarticho.alternatives?.Galar!),
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
                        new PokemonWithRarity(pokemons.Sabelette.alternatives?.Alola!),
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
                .withName('Ruines fantômes')
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
                .withName('Prodiges Mécaniques')
                .withStartAt(new Date(2025, 5, 7, 10))
                .withEndAt(new Date(2025, 5, 11, 20))
                .addSavageGroup([
                    new PokemonWithRarity(pokemons.Miaouss),
                    new PokemonWithRarity(pokemons.Granivol),
                    new PokemonWithRarity(pokemons.Grindur),
                    new PokemonWithRarity(pokemons.Limonde.alternatives?.Galar!),
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
                    pokemons.Limonde.alternatives?.Galar!,
                    pokemons.Hexadron,
                ])
                .build(),
            new EventBuilder()
                .withName('Retraite Sereine')
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
                .withName("Grandir et s'épanouir")
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
                    pokemons['Mime-jr'],
                    pokemons.Toxizap,
                    pokemons.Riolu,
                    pokemons.Sovkipou,
                ])
                .build(),
            new EventBuilder()
                .withName('Semaine Combat GO : Attaque finale !')
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
