export class Success<T> {
    public value!: T
    public success: boolean
    public error: string | undefined
    constructor(success: boolean, torerror: T | string) {
        this.success = success
        if (typeof torerror === "string") {
            this.error = torerror
        } else {
            this.value = torerror
        }
    }
}