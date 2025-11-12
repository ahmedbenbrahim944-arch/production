// src/user/dto/create-user.dto.ts
import { IsString, MinLength, MaxLength, IsNotEmpty, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  @MaxLength(50, { message: 'Le nom ne doit pas dépasser 50 caractères' })
  nom: string;

  @IsString()
  @IsNotEmpty({ message: 'Le prénom est obligatoire' })
  @MaxLength(50, { message: 'Le prénom ne doit pas dépasser 50 caractères' })
  prenom: string;

  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
  })
  password: string;
}