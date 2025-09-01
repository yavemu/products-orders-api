import { IsOptional, IsString, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchUserDto {
  @ApiPropertyOptional({ example: 'Yam' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Vélez' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 'yam@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
}
