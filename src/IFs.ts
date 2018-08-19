export interface IFs {
    // process
    execSync(cmdline: string): Buffer
    exec(cmdline: string, options: any, callback: (error: Error, result: string) => void): void
    // io
    outputJsonSync(filename: string, data: any): any
    writeJsonSync(filename: string, data: any): any
    readJsonSync(filename: string): any
    existsSync(fileorfolder: string): boolean
    readdirSync(dir: string): string[]
    statSync(fileorfolder: string): any
}