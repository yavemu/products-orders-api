import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Username for authentication - case sensitive',
    example: 'admin',
    type: String,
    required: true,
    minLength: 3,
    maxLength: 50,
  })
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(50, { message: 'Username cannot exceed 50 characters' })
  username: string;

  @ApiProperty({
    description: 'Password for authentication - case sensitive',
    example: 'admin',
    type: String,
    required: true,
    minLength: 3,
    maxLength: 100,
    format: 'password',
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(3, { message: 'Password must be at least 3 characters long' })
  @MaxLength(100, { message: 'Password cannot exceed 100 characters' })
  password: string;
}