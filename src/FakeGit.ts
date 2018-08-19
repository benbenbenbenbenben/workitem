import { IGit } from "./IGit";
import { IHost } from "./IHost";

export class FakeGit implements IGit {
    fs!: IHost
    public getCurrentBranch(): string {
        throw new Error("Method not implemented.");
    }
    public raw(command: string): string {
        return ""
    }
}