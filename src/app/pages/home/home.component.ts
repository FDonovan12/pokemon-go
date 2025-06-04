import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PokemonInterface } from '@entities/pokemon';
import { GetAllService } from '@repositories/pokemon/get-all.service';
import { EventInterface } from '../../entities/event';
import { BddEvent } from '../../repositories/event/event';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [RouterLink, DatePipe],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
})
export class HomeComponent {
    private readonly httpClient: HttpClient = inject(HttpClient);
    private readonly getAllService: GetAllService = inject(GetAllService);
    readonly bddEvent: BddEvent = inject(BddEvent);

    today = new Date();

    join = (arr: PokemonInterface[]) => ' & ' + arr.map(this.getName).join(', ') + ' & ';

    getName(pokemon: PokemonInterface | string): string {
        return typeof pokemon === 'string' ? pokemon : pokemon.name;
    }
    pokemonsList = this.getAllService.pokemonIndex;

    private readonly pokemons = this.getAllService.pokemonIndex.byName;

    futureEvents: EventInterface[] = this.bddEvent
        .getEventsPokemon()
        .filter((event) => new Date() <= event.endAt)
        .slice()
        .sort((a, b) => (a.startAt <= b.startAt ? -1 : 1));

    private readonly onlySavagePokemons = ' & !raid & !éclos & !étude & ';

    private readonly starterPokemon = [
        this.pokemons.Bulbizarre,
        this.pokemons.Salameche,
        this.pokemons.Carapuce,
        this.pokemons.Germignon,
        this.pokemons.Hericendre,
        this.pokemons.Kaiminus,
        this.pokemons.Arcko,
        this.pokemons.Poussifeu,
        this.pokemons.Tortipouss,
        this.pokemons.Ouisticram,
        this.pokemons.Tiplouf,
        this.pokemons.Gobou,
        this.pokemons.Vipelierre,
        this.pokemons.Gruikui,
        this.pokemons.Moustillon,
        this.pokemons.Marisson,
        this.pokemons.Feunnec,
        this.pokemons.Grenousse,
        this.pokemons.Brindibou,
        this.pokemons.Flamiaou,
        this.pokemons.Otaquin,
        this.pokemons.Ouistempo,
        this.pokemons.Flambino,
        this.pokemons.Larmeleon,
        this.pokemons.Chochodile,
        this.pokemons.Poussacha,
        this.pokemons.Coiffeton,
    ];
    baseFilters = [
        { label: 'IV PVP', query: ' & 2-pv & 2-défense & -1attaque & ' },
        {
            label: 'Filtre level 1',
            query:
                this.onlySavagePokemons +
                ' & 2-attaque, -1défense & 2-attaque, -1pv & -1défense, -1pv & 0*, 1*, 2* & !# & âge0 & pc-100 & ',
        },
        {
            label: 'Filtre level 2',
            query: this.onlySavagePokemons + ' & 2-attaque, -1défense, -1pv & 0*, 1*, 2* & !# & âge0 & pc-100 & ',
        },
        {
            label: 'Filtre level 3',
            query: this.onlySavagePokemons + ' & 2-attaque, -2défense, -2pv & 0*, 1*, 2* & !# & âge0 & pc-100 & ',
        },
        { label: 'Filtre level 4', query: this.onlySavagePokemons + ' & 0*, 1*, 2* & !# & âge0 & pc-100 & ' },
        {
            label: 'Starter',
            query: this.join(this.starterPokemon),
        },
    ];
    filters = [
        ...this.baseFilters,
        ...this.bddEvent
            .getEventsPokemon()
            .filter((event) => event.startAt <= new Date(Date.now() + 1 * 86400000))
            .map((event) => ({
                label: event.name,
                query: this.join(event.savagePokemons.map((group) => group.pokemons).flat()),
            })),
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
        // this.getData();
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
