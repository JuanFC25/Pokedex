import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';
import { PokemonService } from 'src/pokemon/pokemon.service';
import { CreatePokemonDto } from 'src/pokemon/dto/create-pokemon.dto';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  constructor(
    private pokemonService: PokemonService,
    private readonly http: AxiosAdapter,
  ) {}

  async executeSeed() {
    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=650',
    );

    const pokemonsToInsert: CreatePokemonDto[] = [];

    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no: number = Number(segments[segments.length - 2]);
      pokemonsToInsert.push({
        nombre: name,
        no: no,
      });
    });

    this.pokemonService.fillWithSeed(pokemonsToInsert);
    return 'Seed Executed';
  }
}
