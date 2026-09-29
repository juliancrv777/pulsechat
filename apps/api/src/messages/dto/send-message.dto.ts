import {Transform} from 'class-transformer';
import {IsString,MaxLength,MinLength} from 'class-validator';

export class SendMessageDto {
  @IsString()
  @MinLength(1)
  channelId!: string;

  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  content!: string;
}
// Message payloads are normalized before validation.
