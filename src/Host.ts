import { IHost } from "./IHost";
import fs from "fs-extra"
import { exec, execSync, ExecException } from "child_process"
import { emitKeypressEvents } from "readline"
import chalk from "../node_modules/chalk";

export class Host implements IHost {
    private static init: boolean = false
    constructor() {
        if (Host.init)
            return
        try {
            emitKeypressEvents(process.stdin)
            process.stdin.setRawMode!(true)
        } catch (e) { }
        Host.init = true
    }
    execSync(cmdline: string): Buffer {
        return execSync(cmdline)
    }    
    exec(cmdline: string, options: any, callback: (error: ExecException | null, stdout: Buffer, stderr: Buffer) => void): void {
        exec(cmdline, options, callback)
    }
    outputJsonSync(filename: string, data: any) {
        fs.outputJsonSync(filename, data)
    }
    writeJsonSync(filename: string, data: any) {
        this.outputJsonSync(filename, data)
    }
    readJsonSync(filename: string): any {
        return fs.readJsonSync(filename)
    }
    existsSync(fileorfolder: string): boolean {
        return fs.existsSync(fileorfolder)
    }
    readdirSync(dir: string): string[] {
        return fs.readdirSync(dir)
    }
    statSync(fileorfolder: string): fs.Stats {
        return fs.statSync(fileorfolder)
    }
    readFileSync(file: string, options: any): Buffer {
        return fs.readFileSync(file, options)
    }
    writeFileSync(file: string, content: any, options: any) {
        fs.writeFileSync(file, content, options)
    }
    mkdirSync(dirname: string): void {
        fs.mkdirSync(dirname)
    }
    static handleKeyPress(resolve:any, reject:any): (str:string, key: any) => void {
        return (str:string, key: any) => {
            if (key.ctrl && key.name === 'c') {
                console.log(chalk`{red.bold exiting mid task}`)
                process.exit()
            } else {
                resolve(key)
            }
        }
    }
    async getKey(): Promise<any> {
        return new Promise((resolve, reject) => {
            process.stdin.once("keypress", Host.handleKeyPress(resolve, reject))
        })
    }
}