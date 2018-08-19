import { IFs } from "./IFs";

export class FakeFs implements IFs {
    execSync(cmdline: string): Buffer {
        throw new Error("Method not implemented.");
    }    exec(cmdline: string, options: any, callback: (error: Error, result: string) => void): void {
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