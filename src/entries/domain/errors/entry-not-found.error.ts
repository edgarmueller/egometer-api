export class EntryNotFoundError extends Error {
  constructor(entryId?: string) {
    super(entryId ? `Entry ${entryId} not found` : `Entry not found`)
  }
}
