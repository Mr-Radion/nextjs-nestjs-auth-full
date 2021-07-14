import { Length, IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class UpdateUserDto {
  @Length(5, 20)
  @IsNotEmpty()
  readonly userName?: {
    firstName: string;
    lastName: string;
  };

  @IsString({ message: 'Должно быть строкой' })
  @IsEmail({}, { message: 'Некорректный email' })
  @IsNotEmpty()
  readonly email?: string;

  @IsString({ message: 'Должно быть строкой' })
  @Length(4, 16, { message: 'Не меньше 4 и не больше 16' })
  @IsNotEmpty()
  readonly password?: string;
}
