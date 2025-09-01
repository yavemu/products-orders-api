import { IsString, MinLength, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Yam' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Vélez' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'yam@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  password: string;
}
