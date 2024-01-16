import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { error } from 'console';
import { PaginationDto } from 'src/common/dto/pagination-dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {
  private defaultLimit: number;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService,
  ) {
    this.defaultLimit = this.configService.getOrThrow<number>('defaultLimit');
  }

  async create(createPokemonDto: CreatePokemonDto) {
    try {
      createPokemonDto.nombre = createPokemonDto.nombre.toLowerCase();

      const pokemon = await this.pokemonModel.create(createPokemonDto);

      return pokemon;
    } catch (err) {
      if (err.code === 11000) {
        throw new BadRequestException(
          `Pokemon exists in db ${JSON.stringify(err.keyValue)}`,
        );
      } else {
        console.log(err);
        throw new InternalServerErrorException(
          `Can't create pokemon - Check Server logs`,
        );
      }
    }

    // return 'This action adds a new pokemon';
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = 0 } = paginationDto;

    return this.pokemonModel.find().limit(limit).skip(offset);
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    //busco por no
    if (!isNaN(Number(term))) {
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    //busco por mongoID

    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }

    //busco por nombre

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({
        nombre: term.toLowerCase().trim(),
      });
    }

    if (!pokemon) {
      throw new NotFoundException(
        `Pokemon con id, no o nombre ${term} no encontrado`,
      );
    }

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    try {
      const pokemon = await this.findOne(term);

      if (updatePokemonDto.nombre)
        updatePokemonDto.nombre = updatePokemonDto.nombre.toLowerCase().trim();

      await pokemon.updateOne(updatePokemonDto, { new: true });

      const updatedPokemon = { ...pokemon.toJSON(), ...updatePokemonDto };

      return updatedPokemon;
    } catch (err) {
      if ((err.code = 11000)) {
        throw new BadRequestException(
          `Ya existe un pokemon con el no o id ingresados`,
        );
      } else {
        console.log(err);
        throw new InternalServerErrorException(
          `No se puede actualizar el pokemon - revise logs del server`,
        );
      }
    }
  }

  async remove(id: string) {
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();
    const resp = await this.pokemonModel.findByIdAndDelete(id);
    if (!resp) {
      throw new BadRequestException(`No existe un pokemon con el id ${id}`);
    }
    return resp;
  }

  async fillWithSeed(pokemons: CreatePokemonDto[]) {
    await this.pokemonModel.deleteMany({});

    const resp = await this.pokemonModel.insertMany(pokemons);
  }
}
