import { IsDateString } from 'class-validator'

export class ListEntriesDto {
  @IsDateString({ strict: true })
  from: string

  @IsDateString({ strict: true })
  to: string
}
