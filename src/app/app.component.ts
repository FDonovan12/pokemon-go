import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { Pokemon, pokemons } from './test';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
})
export class AppComponent {
    private readonly httpClient: HttpClient = inject(HttpClient);

    join = (arr: Pokemon[]) => arr.map((pokemon) => pokemon.name).join(', ') + ' & ';

    filters = [
        { label: 'IV PVP', query: '2-pv & 2-défense & -1attaque & ' },
        {
            label: 'Filtre level 1',
            query: '2-attaque, -1défense & 2-attaque, -1pv & -1défense, -1pv & !# & âge0 & pc-100 & ',
        },
        { label: 'Filtre level 2', query: '2-attaque, -1défense, -1pv, 0* & !# & âge0 & pc-100 & ' },
        { label: 'Filtre level 3', query: '0*, 1*, 2* & !# & âge0 & pc-100 & ' },
        {
            label: 'Grandir et s"épanouir',
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
                // pokemons.lillitrelle,
                pokemons.Ptiravi,
                pokemons['Mime-Jr'],
                pokemons.Toxizap,
            ]),
        },
        {
            label: 'Découverte sucrée',
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
    ];

    addEvent(eventName: string, pokemons: Pokemon[]): void {
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
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        this.getData();
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
