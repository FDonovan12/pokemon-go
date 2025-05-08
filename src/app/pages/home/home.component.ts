import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { GetAllService, PokemonInterface } from '../../repositories/get-all.service';
import { pokemons } from '../../test';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
})
export class HomeComponent {
    private readonly httpClient: HttpClient = inject(HttpClient);
    private readonly getAllService: GetAllService = inject(GetAllService);

    join = (arr: (PokemonInterface | string)[]) => ' & ' + arr.map(this.getName).join(', ') + ' & ';

    getName(pokemon: PokemonInterface | string): string {
        return typeof pokemon === 'string' ? pokemon : pokemon.name;
    }
    pokemonsList = this.getAllService.pokemonIndex;

    filters = [
        { label: 'IV PVP', query: ' & 2-pv & 2-défense & -1attaque & ' },
        {
            label: 'Filtre level 1',
            query: ' & 2-attaque, -1défense & 2-attaque, -1pv & -1défense, -1pv & 0*, 1*, 2* & !# & âge0 & pc-100 & ',
        },
        { label: 'Filtre level 2', query: ' & 2-attaque, -1défense, -1pv & 0*, 1*, 2* & !# & âge0 & pc-100 & ' },
        { label: 'Filtre level 3', query: ' & 0*, 1*, 2* & !# & âge0 & pc-100 & ' },
        {
            label: 'Starter',
            query: this.join([
                pokemons.Bulbizarre,
                pokemons.Salameche,
                pokemons.Carapuce,
                pokemons.Germignon,
                pokemons.Hericendre,
                pokemons.Kaiminus,
                pokemons.Arcko,
                pokemons.Poussifeu,
                pokemons.Tortipouss,
                pokemons.Ouisticram,
                pokemons.Tiplouf,
                pokemons.Gobou,
                pokemons.Vipelierre,
                pokemons.Gruikui,
                pokemons.Moustillon,
                pokemons.Marisson,
                pokemons.Feunnec,
                pokemons.Grenousse,
                pokemons.Brindibou,
                pokemons.Flamiaou,
                pokemons.Otaquin,
                pokemons.Ouistempo,
                pokemons.Flambino,
                pokemons.Larmeleon,
                'Chochodile',
                'Poussacha',
                'Coiffeton',
            ]),
        },
        {
            label: "Grandir et s'épanouir", // L’événement se déroule du vendredi 2 mai à 10h au mercredi 7 mai 20h (heure locale)
            query: this.join([
                pokemons.Magicarpe,
                pokemons.Wailmer,
                pokemons.Tylton,
                pokemons.Trompignon,
                pokemons.Dedenne,
                pokemons.Bombydou,
                pokemons.Munna,
                pokemons.Sovkipou,
                pokemons.Minisange,
                'Lilliterelle',
                pokemons.Ptiravi,
                pokemons['Mime-Jr'],
                pokemons.Toxizap,
            ]),
        },
        {
            label: 'Découverte sucrée', // L’événement se déroule du jeudi 24 avril à 10h au mardi 29 avril 20h (heure locale)
            query: this.join([
                pokemons.Rattata,
                pokemons.Abra,
                pokemons.Chetiflor,
                pokemons.Cadoizo,
                pokemons.Gloupti,
                pokemons.Keunotor,
                pokemons.Munna,
                pokemons.Croquine,
                pokemons.Rongourmand,
                pokemons.Ronflex,
                pokemons.Caratroc,
                pokemons.Dodoala,
                pokemons.Verpom,
                pokemons.Ceribou,
                pokemons.Goinfrex,
            ]),
        },
        {
            label: 'Effervescence printanière', // L’événement se déroule du mercredi 9 avril à 10h au lundi 14 avril 20h (heure locale)
            query: this.join([
                pokemons.Remoraid,
                pokemons.Passerouge,
                pokemons.Tournicoton,
                pokemons.Marill,
                pokemons.Nenupiot,
                pokemons.Couaneton,
                pokemons.Araqua,
                pokemons.Lokhlass,
                pokemons.Goupix,
                pokemons.Ponyta,
                pokemons.Chamallot,
                pokemons.Helionceau,
                pokemons.Caninos,
                pokemons.Mystherbe,
                pokemons.Granivol,
                pokemons.Roselia,
                pokemons.Ceribou,
                pokemons.Noadkoko,
            ]),
        },
    ];

    addEvent(eventName: string, pokemons: PokemonInterface[]): void {
        this.filters.push({ label: eventName, query: pokemons.map((pokemon) => pokemon.name).join(', ') + ' & ' });
    }

    copy(string: string) {
        navigator.clipboard
            .writeText(string)
            .then(() => {
                console.log('Text copied to clipboard:', string);
            })
            .catch((err) => {
                console.error('Error copying text: ', err);
            });
    }
    ngOnInit(): void {
        this.getData();
        // console.log(Object.entries(pokemons).map((ob) => ob[1]));
    }

    public getData() {
        this.httpClient.get('https://pokebuildapi.fr/api/v1/pokemon').subscribe((data: any) => {
            console.log(data);
            const test = data.map((pokemon: any) => {
                return {
                    id: pokemon.id,
                    name: pokemon.name,
                    image: pokemon.image,
                    sprite: pokemon.sprite,
                    slug: pokemon.slug,
                    type: pokemon.apiTypes.map((type: any) => type.name),
                };
            });
            console.log(test);
            const pokemonMap = test.reduce((acc: any, pokemon: any) => {
                acc[pokemon.slug] = pokemon;
                return acc;
            }, {} as Record<string, (typeof test)[number]>);
            console.log(pokemonMap);
        });
    }
}
