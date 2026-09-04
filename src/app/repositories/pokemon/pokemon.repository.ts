import { httpResource, HttpResourceRef } from '@angular/common/http';
import { computed, inject, Injectable, resource, Signal } from '@angular/core';
import {
    Base,
    GenerationPokemon,
    Mega,
    NamePokemon,
    OldPokemonSlug,
    PokemonFamily,
    PokemonInterface,
    PokemonSetting,
    PokemonSlug,
} from '@entities/pokemon';
import { AllRankPVP, Combo, IV, RankPVP } from '@entities/stats';
import { PokemonCalcService } from '@services/pokemon-calc-service/pokemon-calc.services';
import { ToastService } from '@shared/features/toast/toast.service';
import { computeByKey, createLookup } from '@shared/utils/create-lookup';
import { pokemonsListHomeMade } from '../../bdd/bdd-home-made';
import pokemonsData from '../../bdd/bdd-pokemons.json';
import { familyPokemon } from '../../bdd/family-pokemon';
import { pokemonFamilyName } from '../../bdd/family-pokemon-name';
import { megaPokemon } from '../../bdd/mega-pokemon';

const pokemonsList = pokemonsData as PokemonInterface[];

export type MegaBase = Base & Mega;
interface PokemonIv {
    attack: number;
    defense: number;
    stamina: number;
}
type PokemonHomeMade = (typeof pokemonsListHomeMade)[number];

type PokemonIndex = {
    byId: Record<PokemonInterface['dexNumber'], PokemonInterface>;
    byName: Record<PokemonInterface['slug'], PokemonInterface>;
};

@Injectable({
    providedIn: 'root',
})
export class PokemonRepository {
    private readonly _toastService: ToastService = inject(ToastService);
    private readonly _pokemonCalcService: PokemonCalcService = inject(PokemonCalcService);

    pokemonsSetting: HttpResourceRef<PokemonSetting[]> = httpResource(
        () => 'https://raw.githubusercontent.com/FDonovan12/pokemon-go-api/output/pokemon-setting.json',
        {
            defaultValue: [] as PokemonSetting[],
        },
    );
    allDifferentFormPokemonsSetting = resource({
        params: () => this.pokemonsSetting.value(),
        loader: async ({ params: pokemons }) => {
            if (!pokemons) return [];
            return pokemons.map((form) => [form.base, ...form.different.map((d) => d.base)]).flat();
        },
        defaultValue: [] as Base[],
    });
    differentForm = createLookup(this.allDifferentFormPokemonsSetting.value, (p) => p.slug);

    allMega: Signal<MegaBase[]> = computed(() =>
        this.differentForm
            .getAll()
            .filter((pokemon) => pokemon.mega && pokemon.mega.length > 0)
            .flatMap((pokemon) =>
                pokemon.mega!.map((mega) => ({
                    ...pokemon,
                    ...mega,
                })),
            ),
    );

    baseFormPokemonsSetting = resource({
        params: () => this.pokemonsSetting.value(),
        loader: async ({ params: pokemons }) => {
            if (!pokemons) return [];
            return pokemons.map((form) => form.base);
        },
        defaultValue: [] as Base[],
    });
    baseForm = createLookup(this.baseFormPokemonsSetting.value, (p) => p.slug);

    private allFormPokemonsSetting = resource({
        params: () => this.pokemonsSetting.value(),
        loader: async ({ params: pokemons }) => {
            if (!pokemons) return [];
            return pokemons.map((form) => [form.base, ...form.different.map((d) => d.base), ...form.same]).flat();
        },
        defaultValue: [] as Base[],
    });

    private cpMultiplierResource: HttpResourceRef<Record<string, number> | undefined> = httpResource(
        () => 'https://raw.githubusercontent.com/FDonovan12/pokemon-go-api/output/pokemon/cp-multiplier.json',
    );
    cpMultiplier = createLookup(this.cpMultiplierResource.value);

    allLevels = computed(() => {
        const MAX_LEVEL_POSSIBLE = 55;
        const cpms = this.cpMultiplier.asMap();
        if (!cpms) return [];
        return [...cpms.keys()]
            .map(Number)
            .filter((level) => level <= MAX_LEVEL_POSSIBLE)
            .sortAsc();
    });

    pureCalculateCp(pokemon: Base, iv: Combo<IV>, level: number): number {
        const cpm = this.cpMultiplier.get(level.toString());
        if (!cpm) return 10;

        return this._pokemonCalcService.calcCp(
            pokemon.stats,
            { attack: iv.attack, defense: iv.defense, stamina: iv.stamina },
            cpm,
        );
    }
    availabilityBySlug = computeByKey(
        this.allDifferentFormPokemonsSetting.value,
        (p) => p.slug,
        (p) => this.getPokemonLeagueAvailability(p),
    );

    getPokemonLeagueAvailability(pokemon: Base): { super: boolean; hyper: boolean } {
        const IV_MAX: Combo<IV> = { attack: 15, defense: 15, stamina: 15 } as Combo<IV>;
        const maxCp = this.pureCalculateCp(pokemon, IV_MAX, 50);
        return { super: maxCp > 1480, hyper: maxCp > 2480 };
    }

    rank1PVP: HttpResourceRef<Record<PokemonSlug, RankPVP<IV>> | undefined> = httpResource(
        () => 'https://raw.githubusercontent.com/FDonovan12/pokemon-go-api/output/rank-1-pvp.json',
    );
    rank1Pvp = createLookup(this.rank1PVP.value);

    async getPVPRank(slug: PokemonSlug): Promise<AllRankPVP> {
        const result = await fetch(
            `https://raw.githubusercontent.com/FDonovan12/pokemon-go-api/output/rank-pvp/${slug}.json`,
        );
        if (!result.ok) {
            console.warn(`PVP rank not found for slug: ${slug} (${result.status})`);
            return null as any as AllRankPVP;
        }
        return result.json();
    }

    private buildPokemonIndex = (
        listFromAPI: PokemonInterface[],
        listHomemade: readonly PokemonHomeMade[] = [],
    ): PokemonIndex => {
        const list = [...listFromAPI, ...listHomemade] as PokemonInterface[];

        return {
            byId: Object.fromEntries(list.map((p) => [p.dexNumber, p])) as Record<
                PokemonInterface['dexNumber'],
                PokemonInterface
            >,
            byName: Object.fromEntries(list.map((p) => [p.slug, p])) as Record<
                PokemonInterface['slug'],
                PokemonInterface
            >,
        };
    };
    pokemonIndex = this.buildPokemonIndex(pokemonsList, pokemonsListHomeMade);

    getPokemonBySlug(slug: OldPokemonSlug): PokemonInterface {
        return this.pokemonIndex.byName[slug];
    }

    // getPokemonSettingBySlug(slug: PokemonSlug): Base {
    //     return this.allFormPokemonsSetting.value().find((pokemon) => pokemon.slug === slug)!; // TODO add a pokemon in case of not find
    // }

    getPokemonByName(name: NamePokemon): PokemonInterface {
        console.log('name : ', name);
        return this.pokemonIndex.byName['Bulbizarre'];
    }

    getPokemonByFamily(family: PokemonFamily): PokemonInterface[] {
        return this.getAllPokemon().filter((pokemon) => pokemon.family === family);
    }

    getPokemonById(id: number): PokemonInterface | undefined {
        return this.pokemonIndex.byId[id];
    }

    getPokemonsBySLugs(slugs: OldPokemonSlug[]): PokemonInterface[] {
        const result: PokemonInterface[] = [];
        const errors: string[] = [];
        slugs.forEach((slug) => {
            const raw = this.getPokemonBySlug(slug);
            if (raw) result.push(raw);
            else errors.push(slug);
        });
        if (errors.length) {
            const toastMessage =
                "Les pokemon suivant non pas eté retrouver a cause d'une erreur reselectionné les a la main : " +
                errors.join(',');
            this._toastService.prepare('Erreur lors du chargment des pokemons', toastMessage).showError();
        }
        return result;
        // return this.pokemonIndex.byName[slug];
    }

    getAllPokemon(): PokemonInterface[] {
        return Object.entries(this.pokemonIndex.byId).map((couple) => couple[1]);
    }

    getAllOtherPokemons(pokemons: Base[]): Base[] {
        return this.getAllOtherPokemonsFromSLugs(pokemons.map((p) => p.slug));
    }

    getAllOtherPokemonsFromSLugs(pokemonsSlugs: PokemonSlug[]): Base[] {
        const set: Set<PokemonSlug> = pokemonsSlugs.toSet();
        return this.baseForm.getAll().filter((pokemon) => !set.has(pokemon.slug));
    }

    getAllPokemonSlugs(): OldPokemonSlug[] {
        return Object.entries(this.pokemonIndex.byName).map((couple) => couple[0] as OldPokemonSlug);
    }

    pokemonFamilyName = pokemonFamilyName;
    pokemonFamily = familyPokemon;

    starterPokemon = [
        this.pokemonIndex.byName.Bulbizarre,
        this.pokemonIndex.byName.Salameche,
        this.pokemonIndex.byName.Carapuce,
        this.pokemonIndex.byName.Germignon,
        this.pokemonIndex.byName.Hericendre,
        this.pokemonIndex.byName.Kaiminus,
        this.pokemonIndex.byName.Arcko,
        this.pokemonIndex.byName.Poussifeu,
        this.pokemonIndex.byName.Tortipouss,
        this.pokemonIndex.byName.Ouisticram,
        this.pokemonIndex.byName.Tiplouf,
        this.pokemonIndex.byName.Gobou,
        this.pokemonIndex.byName.Vipelierre,
        this.pokemonIndex.byName.Gruikui,
        this.pokemonIndex.byName.Moustillon,
        this.pokemonIndex.byName.Marisson,
        this.pokemonIndex.byName.Feunnec,
        this.pokemonIndex.byName.Grenousse,
        this.pokemonIndex.byName.Brindibou,
        this.pokemonIndex.byName.Flamiaou,
        this.pokemonIndex.byName.Otaquin,
        this.pokemonIndex.byName.Ouistempo,
        this.pokemonIndex.byName.Flambino,
        this.pokemonIndex.byName.Larmeleon,
        this.pokemonIndex.byName.Chochodile,
        this.pokemonIndex.byName.Poussacha,
        this.pokemonIndex.byName.Coiffeton,
    ];

    megaList = this.buildMegaList();

    private buildMegaList(): PokemonInterface[] {
        const listBase = megaPokemon;
        return listBase as PokemonInterface[];
    }
    async enrichPokemonsGenerationAndFamily(pokemons: PokemonInterface[]): Promise<PokemonInterface[]> {
        const base = 'https://pokeapi.co/api/v2';

        for (const p of pokemons) {
            try {
                const speciesRes = await fetch(`${base}/pokemon-species/${p.dexNumber}`);
                if (!speciesRes.ok) continue;
                const species = await speciesRes.json();

                // Génération (extraction du numéro depuis l'URL)
                const genUrl: string = species.generation.url;
                const genMatch = genUrl.match(/generation\/(\d+)\//);
                p.generation = (genMatch ? parseInt(genMatch[1], 10) : 0) as GenerationPokemon;

                // Récupère la chaîne d’évolution
                const evoChainUrl: string = species.evolution_chain.url;
                const evoRes = await fetch(evoChainUrl);
                if (!evoRes.ok) continue;
                const evoData = await evoRes.json();

                // Trouver l'espèce de base (anglais)
                const baseSpeciesName: string = evoData.chain.species.name;

                // Appel pour obtenir le nom français de l'espèce de base
                const baseSpeciesRes = await fetch(`${base}/pokemon-species/${baseSpeciesName}`);
                if (!baseSpeciesRes.ok) continue;
                const baseSpecies = await baseSpeciesRes.json();

                const frName = baseSpecies.names.find((n: any) => n.language.name === 'fr')?.name;
                if (!frName) continue;

                // Slugify + capitalize (selon ton projet)
                p.family = frName.slugify().capitalize();
            } catch {
                continue;
            }
        }
        return pokemons;
    }
}
