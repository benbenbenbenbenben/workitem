import { IGit } from "./IGit";

export class FakeGit implements IGit {
    public getCurrentBranch(): string {
        throw new Error("Method not implemented.");
    }
    public raw(command: string): string {
        return ""
    }
}