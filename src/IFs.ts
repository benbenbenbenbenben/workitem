import { readFileSync, writeFileSync, mkdirSync } from "fs";

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
    readFileSync(file:string, options: any): Buffer
    writeFileSync(file:string, content: any, options: any): any
    mkdirSync(dirname:string): void
}