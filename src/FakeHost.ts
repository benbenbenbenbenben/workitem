import { IHost } from "./IHost";
import { ExecException } from "child_process";

export class FakeHost implements IHost {
    getKey(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    readFileSync(file: string, options: any): Buffer {
        throw new Error("Method not implemented.");
    }
    writeFileSync(file: string, content: any, options: any) {
        throw new Error("Method not implemented.");
    }
    mkdirSync(dirname: string): void {
        throw new Error("Method not implemented.");
    }
    execSync(cmdline: string): Buffer {
        throw new Error("Method not implemented.");
    }    
    exec(cmdline: string, options: any, callback: (error: ExecException | null, stdout: Buffer, stderr: Buffer) => void): void {
        throw new Error("Method not implemented.");
    }
    outputJsonSync(filename: string, data: any) {
        throw new Error("Method not implemented.");
    }
    writeJsonSync(filename: string, data: any) {
        throw new Error("Method not implemented.");
    }
    readJsonSync(filename: string) {
        throw new Error("Method not implemented.");
    }
    existsSync(fileorfolder: string): boolean {
        throw new Error("Method not implemented.");
    }
    readdirSync(dir: string): string[] {
        throw new Error("Method not implemented.");
    }
    statSync(fileorfolder: string) {
        throw new Error("Method not implemented.");
    }


}