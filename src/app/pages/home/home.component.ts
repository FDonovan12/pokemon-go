import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { EventInterface } from '../../entities/event';
import { BddEvent } from '../../repositories/event/event';
import { GetAllService, PokemonInterface } from '../../repositories/pokemon/get-all.service';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
})
export class HomeComponent {
    private readonly httpClient: HttpClient = inject(HttpClient);
    private readonly getAllService: GetAllService = inject(GetAllService);
    readonly bddEvent: BddEvent = inject(BddEvent);

    join = (arr: (PokemonInterface | string)[]) => ' & ' + arr.map(this.getName).join(', ') + ' & ';

    getName(pokemon: PokemonInterface | string): string {
        return typeof pokemon === 'string' ? pokemon : pokemon.name;
    }
    pokemonsList = this.getAllService.pokemonIndex;

    private readonly pokemons = this.getAllService.pokemonIndex.byName;

    currentEvent: EventInterface | undefined = this.bddEvent
        .getEventsPokemon()
        .filter((event) => event.startAt <= new Date() && new Date() <= event.endAt)[0];

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
                this.getAllService.pokemonIndex.byName.Bulbizarre,
                this.getAllService.pokemonIndex.byName.Salameche,
                this.getAllService.pokemonIndex.byName.Carapuce,
                this.getAllService.pokemonIndex.byName.Germignon,
                this.getAllService.pokemonIndex.byName.Hericendre,
                this.getAllService.pokemonIndex.byName.Kaiminus,
                this.getAllService.pokemonIndex.byName.Arcko,
                this.getAllService.pokemonIndex.byName.Poussifeu,
                this.getAllService.pokemonIndex.byName.Tortipouss,
                this.getAllService.pokemonIndex.byName.Ouisticram,
                this.getAllService.pokemonIndex.byName.Tiplouf,
                this.getAllService.pokemonIndex.byName.Gobou,
                this.getAllService.pokemonIndex.byName.Vipelierre,
                this.getAllService.pokemonIndex.byName.Gruikui,
                this.getAllService.pokemonIndex.byName.Moustillon,
                this.getAllService.pokemonIndex.byName.Marisson,
                this.getAllService.pokemonIndex.byName.Feunnec,
                this.getAllService.pokemonIndex.byName.Grenousse,
                this.getAllService.pokemonIndex.byName.Brindibou,
                this.getAllService.pokemonIndex.byName.Flamiaou,
                this.getAllService.pokemonIndex.byName.Otaquin,
                this.getAllService.pokemonIndex.byName.Ouistempo,
                this.getAllService.pokemonIndex.byName.Flambino,
                this.getAllService.pokemonIndex.byName.Larmeleon,
                'Chochodile',
                'Poussacha',
                'Coiffeton',
            ]),
        },
        {
            label: 'Semaine Combat GO : Attaque finale !', // L’événement se déroule du mercredi 21 mai à 10 h au mardi 27 mai à 20 h (heure locale)
            query: this.join([
                this.getAllService.pokemonIndex.byName.Ferosinge,
                this.getAllService.pokemonIndex.byName.Otaria,
                this.getAllService.pokemonIndex.byName.Zigzaton,
                this.getAllService.pokemonIndex.byName.Meditikka,
                this.getAllService.pokemonIndex.byName.Grenousse,
                this.getAllService.pokemonIndex.byName.Solochi,
                this.getAllService.pokemonIndex.byName.Goupilou,
            ]),
        },
        {
            label: 'Choc des couronnes', // L’événement se déroule du vendredi 10 mai à 10h au mercredi 18 mai 20h (heure locale)
            query: this.join([
                this.getAllService.pokemonIndex.byName.Ramoloss,
                this.getAllService.pokemonIndex.byName.Parecool,
                this.getAllService.pokemonIndex.byName.Tiplouf,
                this.getAllService.pokemonIndex.byName.Apitrini,
                this.getAllService.pokemonIndex.byName.Vipelierre,
                this.getAllService.pokemonIndex.byName.Helionceau,
                this.getAllService.pokemonIndex.byName.Scalpion,
                this.getAllService.pokemonIndex.byName.Nidoking,
                this.getAllService.pokemonIndex.byName.Nidoqueen,
            ]),
        },
        {
            label: "Grandir et s'épanouir", // L’événement se déroule du vendredi 2 mai à 10h au mercredi 7 mai 20h (heure locale)
            query: this.join([
                this.getAllService.pokemonIndex.byName.Magicarpe,
                this.getAllService.pokemonIndex.byName.Wailmer,
                this.getAllService.pokemonIndex.byName.Tylton,
                this.getAllService.pokemonIndex.byName.Trompignon,
                this.getAllService.pokemonIndex.byName.Dedenne,
                this.getAllService.pokemonIndex.byName.Bombydou,
                this.getAllService.pokemonIndex.byName.Munna,
                this.getAllService.pokemonIndex.byName.Sovkipou,
                this.getAllService.pokemonIndex.byName.Minisange,
                'Lilliterelle',
                this.getAllService.pokemonIndex.byName.Ptiravi,
                this.getAllService.pokemonIndex.byName['Mime-Jr'],
                this.getAllService.pokemonIndex.byName.Toxizap,
            ]),
        },
        {
            label: 'Découverte sucrée', // L’événement se déroule du jeudi 24 avril à 10h au mardi 29 avril 20h (heure locale)
            query: this.join([
                this.getAllService.pokemonIndex.byName.Rattata,
                this.getAllService.pokemonIndex.byName.Abra,
                this.getAllService.pokemonIndex.byName.Chetiflor,
                this.getAllService.pokemonIndex.byName.Cadoizo,
                this.getAllService.pokemonIndex.byName.Gloupti,
                this.getAllService.pokemonIndex.byName.Keunotor,
                this.getAllService.pokemonIndex.byName.Munna,
                this.getAllService.pokemonIndex.byName.Croquine,
                this.getAllService.pokemonIndex.byName.Rongourmand,
                this.getAllService.pokemonIndex.byName.Ronflex,
                this.getAllService.pokemonIndex.byName.Caratroc,
                this.getAllService.pokemonIndex.byName.Dodoala,
                this.getAllService.pokemonIndex.byName.Verpom,
                this.getAllService.pokemonIndex.byName.Ceribou,
                this.getAllService.pokemonIndex.byName.Goinfrex,
            ]),
        },
        {
            label: 'Effervescence printanière', // L’événement se déroule du mercredi 9 avril à 10h au lundi 14 avril 20h (heure locale)
            query: this.join([
                this.getAllService.pokemonIndex.byName.Remoraid,
                this.getAllService.pokemonIndex.byName.Passerouge,
                this.getAllService.pokemonIndex.byName.Tournicoton,
                this.getAllService.pokemonIndex.byName.Marill,
                this.getAllService.pokemonIndex.byName.Nenupiot,
                this.getAllService.pokemonIndex.byName.Couaneton,
                this.getAllService.pokemonIndex.byName.Araqua,
                this.getAllService.pokemonIndex.byName.Lokhlass,
                this.getAllService.pokemonIndex.byName.Goupix,
                this.getAllService.pokemonIndex.byName.Ponyta,
                this.getAllService.pokemonIndex.byName.Chamallot,
                this.getAllService.pokemonIndex.byName.Helionceau,
                this.getAllService.pokemonIndex.byName.Caninos,
                this.getAllService.pokemonIndex.byName.Mystherbe,
                this.getAllService.pokemonIndex.byName.Granivol,
                this.getAllService.pokemonIndex.byName.Roselia,
                this.getAllService.pokemonIndex.byName.Ceribou,
                this.getAllService.pokemonIndex.byName.Noadkoko,
            ]),
        },
    ];

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
        console.log(this.currentEvent);
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
