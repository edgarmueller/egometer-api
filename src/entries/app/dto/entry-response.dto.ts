import { Entry } from '../../domain/entry'

export class EntryResponseDto {
  id: string
  date: string
  meterId: string
  value: unknown

  static fromDomain(entry: Entry): EntryResponseDto {
    const dto = new EntryResponseDto()
    dto.id = entry.id
    dto.date = entry.date
    dto.meterId = entry.meterId
    dto.value = entry.value
    return dto
  }
}
