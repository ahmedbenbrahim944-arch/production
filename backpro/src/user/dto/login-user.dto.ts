// src/user/dto/login-user.dto.ts
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  nom: string;

  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  password: string;
}