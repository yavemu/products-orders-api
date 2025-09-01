import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  _id: string;

  @ApiProperty({ example: 'Yam' })
  firstName: string;

  @ApiProperty({ example: 'Vélez' })
  lastName: string;

  @ApiProperty({ example: 'yam@example.com' })
  email: string;

  @ApiProperty({ example: '2025-08-31T21:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-08-31T21:00:00.000Z' })
  updatedAt: Date;
}
