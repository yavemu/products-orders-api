import { ApiProperty } from '@nestjs/swagger';

export class DeleteUserResponseDto {
  @ApiProperty({ example: 'User deleted successfully' })
  message: string;
}
