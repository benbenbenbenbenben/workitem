import { IHost } from "./IHost";

export interface IGit {
    fs: IHost
    getCurrentBranch(): string
}