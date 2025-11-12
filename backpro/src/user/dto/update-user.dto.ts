// src/user/dto/update-user.dto.ts
import { IsString, MinLength, MaxLength, IsOptional, IsBoolean, Matches } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Le nom ne doit pas dépasser 50 caractères' })
  nom?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Le prénom ne doit pas dépasser 50 caractères' })
  prenom?: string;

  @IsString()
  @IsOptional()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
  })
  password?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}