import { ExecException } from "child_process";

export interface IHost {
    // process
    execSync(cmdline: string): Buffer
    exec(cmdline: string, options: any, callback: (error: ExecException | null, stdout: Buffer, stderr: Buffer) => void): void
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
    getKey(): Promise<any>
}