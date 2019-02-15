import { IHost } from "./IHost";

export interface IGit {
    fs: IHost
    getCurrentBranch(): Promise<string>
    
    getUsername(): Promise<string>
    getEmail(): Promise<string>
    getWho(): Promise<string>

    isRepo(): Promise<boolean>
    isInit(): Promise<boolean>

    createRepo(): Promise<boolean>
}