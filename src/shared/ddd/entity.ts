export class Entity {
  readonly id: string

  constructor(props: any) {
    Object.assign(this, props)
  }
}
