import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token for API authentication - include in Authorization header as "Bearer {token}"',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE2OTMzMTQwMDAsImV4cCI6MTY5MzMxNzYwMH0.signature',
    type: String,
    format: 'jwt',
    pattern: '^[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]*$',
    readOnly: true,
  })
  access_token: string;
}