import { IGit } from "./IGit";
import { IHost } from "./IHost";

export class FakeGit implements IGit {
    getUsername(): string {
        throw new Error("Method not implemented.");
    }
    getEmail(): string {
        throw new Error("Method not implemented.");
    }
    getWho(): string {
        throw new Error("Method not implemented.");
    }
    fs!: IHost
    public getCurrentBranch(): string {
        throw new Error("Method not implemented.");
    }
    public raw(command: string): string {
        return ""
    }
}