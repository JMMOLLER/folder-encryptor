export class Deferred<T> {
  promise: Promise<T>
  resolve!: (value: T | PromiseLike<T>) => void
  reject!: (reason?: unknown) => void
  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      // Asigna los métodos resolve y reject al objeto
      this.resolve = resolve
      this.reject = reject
    })
  }
}
