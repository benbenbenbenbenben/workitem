import { promisify } from "util";
import { IHost } from "./IHost";
import fs from "fs-extra"
import { exec as sexec } from "shelljs"
import { spawn, exec, execSync, ExecException } from "child_process"
const pexec = promisify(exec)
import { emitKeypressEvents } from "readline"
import chalk from "../node_modules/chalk";

export class Host implements IHost {
    private static statCache: Map<string, any> = new Map()
    private static jsonCache: Map<string, any> = new Map()
    private static init: boolean = false
    constructor() {
        if (Host.init)
            return
        try {
            emitKeypressEvents(process.stdin)
            process.stdin.setRawMode!(true)
            process.stdin.on("keypress", (str, key) => {
                if (key.ctrl && key.name === 'c') {
                    console.log(chalk`{red.bold exiting mid task}`)
                    process.exit()
                }
            })
        } catch (e) { }
        Host.init = true
    }
    execSync(cmdline: string): Buffer {
        return Buffer.from(sexec(cmdline, { silent:true }).stdout)
    }    
    async exec(cmdline: string): Promise<{stdout: string, stderr:string}> {
        return new Promise((resolve, reject) => {
            const output = sexec(cmdline, { async:false, silent:true })
            if (output.code !== 0) {
                reject(output)
            } else {
                resolve(output)
            }
        })
    }
    writeJsonSync(filename: string, data: any) {
        fs.writeJSONSync(filename, data)
    }
    readJsonSync(filename: string): any {
        if (Host.jsonCache.has(filename)) {
            return Host.jsonCache.get(filename)
        }
        const file = fs.readJsonSync(filename)
        Host.jsonCache.set(filename, file)
        return file
    }
    existsSync(fileorfolder: string): boolean {
        return fs.existsSync(fileorfolder)
    }
    readdirSync(dir: string): string[] {
        return fs.readdirSync(dir)
    }
    statSync(fileorfolder: string): fs.Stats {
        if (Host.statCache.has(fileorfolder)) {
            return Host.statCache.get(fileorfolder)
        }
        const stat = fs.statSync(fileorfolder)
        Host.statCache.set(fileorfolder, stat)
        return stat
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
                try {
                    resolve(key)
                } catch(e) {
                    reject()
                }
            }
        }
    }
    async getKey(): Promise<any> {
        return new Promise((resolve, reject) => {
            process.stdin.once("keypress", Host.handleKeyPress(resolve, reject))
        })
    }
}