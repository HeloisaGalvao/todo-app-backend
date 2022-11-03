import { ApiPropertyOptional } from '@nestjs/swagger';

export class TodoQueryDto {
  @ApiPropertyOptional() task?: string;
}
