export class Deferred {
  promise: Promise<string>
  resolve!: (value: string | PromiseLike<string>) => void
  reject!: (reason?: string) => void
  constructor() {
    this.promise = new Promise<string>((resolve, reject) => {
      // Asigna los métodos resolve y reject al objeto
      this.resolve = resolve
      this.reject = reject
    })
  }
}
