import { PokemonInterface, typePokemon } from '@entities/pokemon';

export class EventPokemon {
    public slug: string;

    constructor(
        public name: string,
        public startAt: Date,
        public endAt: Date,
        public savageGroups: SavageGroup[],
        public eggPokemons?: PokemonInterface[],
        public raidPokemons?: PokemonInterface[],
    ) {
        this.slug = this.name.slugify();
    }

    get allSavagePokemons(): PokemonWithRarity[] {
        return this.savageGroups.flatMap((group) => group.pokemons);
    }

    get rareSavagePokemons(): PokemonInterface[] {
        return this.savageGroups.flatMap((group) => group.rarePokemons);
    }
}

export interface SavageGroupInterface {
    pokemons: PokemonWithRarity[];
    title: string | undefined;
}
export class SavageGroup {
    public pokemons: PokemonWithRarity[];

    constructor(
        pokemons: (PokemonWithRarity | PokemonInterface)[],
        public title: string | undefined = undefined,
        public megas: PokemonInterface[] = [],
        public megasGroup: MegaGroup[] = [],
    ) {
        this.pokemons = pokemons.map((p) => (p instanceof PokemonWithRarity ? p : new PokemonWithRarity(p)));
    }

    get pokemonsFlat(): PokemonInterface[] {
        return this.pokemons.map((p) => p.pokemon);
    }

    get rarePokemons(): PokemonInterface[] {
        return this.pokemons.filter((p) => p.isRare).map((p) => p.pokemon);
    }

    get commonPokemons(): PokemonInterface[] {
        return this.pokemons.filter((p) => !p.isRare).map((p) => p.pokemon);
    }
}

export interface MegaGroup {
    mega: PokemonInterface;
    pokemonBoost: PokemonInterface[];
}

export class PokemonWithRarity {
    constructor(
        public pokemon: PokemonInterface,
        public isRare: boolean = false,
    ) {}

    get name(): string {
        return this.pokemon.name;
    }

    get type(): typePokemon[] {
        return this.pokemon.type;
    }

    get image(): string {
        return this.pokemon.image;
    }

    get sprite(): string {
        return this.pokemon.sprite;
    }
}

export class EventBuilder {
    private _name!: string;
    private _startAt!: Date;
    private _endAt!: Date;
    private _savageGroups: SavageGroup[] = [];
    private _eggPokemons: PokemonInterface[] = [];
    private _raidPokemons?: PokemonInterface[] = [];

    withName(name: string): this {
        this._name = name;
        return this;
    }

    withStartAt(date: Date): this {
        this._startAt = date;
        return this;
    }

    withEndAt(date: Date): this {
        this._endAt = date;
        return this;
    }

    addSavageGroup(pokemons: (PokemonWithRarity | PokemonInterface)[], title?: string): this {
        const group = new SavageGroup(pokemons, title);
        this._savageGroups.push(group);
        return this;
    }

    withEggPokemons(pokemons: PokemonInterface[]): this {
        this._eggPokemons = pokemons;
        return this;
    }

    withRaidPokemons(pokemons: PokemonInterface[]): this {
        this._raidPokemons = pokemons;
        return this;
    }

    build(): EventPokemon {
        return new EventPokemon(
            this._name,
            this._startAt,
            this._endAt,
            this._savageGroups,
            this._eggPokemons,
            this._raidPokemons,
        );
    }
}
