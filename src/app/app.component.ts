import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GetAllService } from './repositories/pokemon/get-all.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
})
export class AppComponent {
    private readonly httpClient: HttpClient = inject(HttpClient);
    private readonly getAllService: GetAllService = inject(GetAllService);
    ngOnInit(): void {
        // this.getData();
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
