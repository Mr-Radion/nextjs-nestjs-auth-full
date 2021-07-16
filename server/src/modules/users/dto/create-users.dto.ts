// import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class CreateUserDto {
  // @ApiModelProperty({
  // 	example: 'Scorage',
  // 	description: 'Имя пользователя'
  // })
  @Length(5, 20)
  @IsNotEmpty()
  readonly userName?: {
    firstName: string;
    lastName: string;
  };
  // @ApiProperty({ example: 'user@mail.ru', description: 'Почтовый адрес' })
  @IsString({ message: 'Должно быть строкой' })
  @IsEmail({}, { message: 'Некорректный email' })
  @IsNotEmpty()
  readonly email: string;
  // @ApiProperty({ example: '12345678', description: 'Пароль' })
  @IsString({ message: 'Должно быть строкой' })
  @Length(4, 16, { message: 'Не меньше 4 и не больше 16' })
  @IsNotEmpty()
  // @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
  //   message: 'Password too weak',
  // })
  readonly password: string;
}
