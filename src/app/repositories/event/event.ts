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
                name: 'Go Fest 2025', // L’événement se déroule du saemdi 28 juin à 10h au samedi 29 juin 18h (heure locale)
                slug: 'go-fest-2025',
                startAt: new Date(2025, 5, 28, 10),
                endAt: new Date(2025, 5, 29, 18),
                savagePokemons: [
                    {
                        title: 'Volcan',
                        pokemons: [
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
                    },
                    {
                        title: 'Dojo',
                        pokemons: [
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
                    },
                    {
                        title: 'Tundra',
                        pokemons: [
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
                    },
                    {
                        title: 'Swamp',
                        pokemons: [
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
                    },
                ],
                eggPokemons: [],
            },
            {
                name: 'Ruines fantômes', // L’événement se déroule du samedi 14 juin à 10h au mercredi 18 juin 20h (heure locale)
                slug: 'ruines-fantomes',
                startAt: new Date(2025, 5, 14, 10),
                endAt: new Date(2025, 5, 18, 20),
                savagePokemons: [
                    {
                        pokemons: [
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
                        ],
                    },
                ],
                eggPokemons: [],
                raidPokemons: [],
            },
            {
                name: 'Prodiges Mécaniques', // L’événement se déroule du samedi 7 juin à 10h au mercredi 11 juin 20h (heure locale)
                slug: 'prodiges-mecaniques',
                startAt: new Date(2025, 5, 7, 10),
                endAt: new Date(2025, 5, 11, 20),
                savagePokemons: [
                    {
                        pokemons: [
                            pokemons.Miaouss,
                            pokemons.Granivol,
                            pokemons.Grindur,
                            pokemons.LimondeGalar,
                            pokemons.Gringolem,
                            pokemons.Tetampoule,
                            pokemons.Terhal,
                            pokemons.Hexadron,
                            pokemons.Eoko,
                        ],
                    },
                ],
                eggPokemons: [],
                raidPokemons: [
                    pokemons.Miaouss,
                    pokemons.Terhal,
                    pokemons.Grindur,
                    pokemons.LimondeGalar,
                    pokemons.Hexadron,
                ],
            },
            {
                name: 'Retraite Sereine', // L’événement se déroule du vendredi 30 mai à 10h au mardi 3 juin 20h (heure locale)
                slug: 'retraite-sereine',
                startAt: new Date(2025, 4, 30, 10),
                endAt: new Date(2025, 5, 3, 20),
                savagePokemons: [
                    {
                        pokemons: [
                            pokemons.Leveinard,
                            pokemons.Marill,
                            pokemons.Couafarel,
                            pokemons.Bombydou,
                            pokemons.Spododo,
                            pokemons.Dodoala,
                            pokemons.Bibichut,
                            pokemons.Ronflex,
                            pokemons.Eoko,
                        ],
                    },
                ],
                eggPokemons: [pokemons.Korillon, pokemons.Munna, pokemons.Fluvetin, pokemons.Sucroquin],
            },
            {
                name: "Grandir et s'épanouir", // L’événement se déroule du vendredi 2 mai à 10h au mercredi 7 mai 20h (heure locale)
                slug: 'grandir-et-s-epanouir', // L’événement se déroule du vendredi 2 mai à 10h au mercredi 7 mai 20h (heure locale)
                startAt: new Date(2025, 4, 2, 10),
                endAt: new Date(2025, 4, 7, 20),
                savagePokemons: [
                    {
                        pokemons: [
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
                    },
                ],
                eggPokemons: [
                    pokemons.Ptiravi,
                    pokemons['Mime-Jr'],
                    pokemons.Toxizap,
                    pokemons.Riolu,
                    pokemons.Sovkipou,
                ],
            },
            {
                name: 'Semaine Combat GO : Attaque finale !', // L’événement se déroule du mercredi 21 mai à 10 h au mardi 27 mai à 20 h (heure locale)
                slug: 'semaine-combat-go-attaque-finale', // L’événement se déroule du mercredi 21 mai à 10 h au mardi 27 mai à 20 h (heure locale)
                startAt: new Date(2025, 4, 21, 10),
                endAt: new Date(2025, 4, 27, 20),
                savagePokemons: [
                    {
                        pokemons: [
                            pokemons.Ferosinge,
                            pokemons.Otaria,
                            pokemons.Zigzaton,
                            pokemons.Meditikka,
                            pokemons.Grenousse,
                            pokemons.Solochi,
                            pokemons.Goupilou,
                        ],
                    },
                ],
                eggPokemons: [],
            },
        ];
        console.log(result.map((event) => event.startAt));
        result.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
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
