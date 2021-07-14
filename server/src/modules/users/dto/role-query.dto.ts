import { IsNotEmpty } from 'class-validator';

export class RoleQueryDto {
  @IsNotEmpty()
  readonly userId: string;
  @IsNotEmpty()
  readonly value: string;
}
