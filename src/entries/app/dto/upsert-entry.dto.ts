import { IsDefined } from 'class-validator'

export class UpsertEntryDto {
  @IsDefined()
  value: unknown
}
