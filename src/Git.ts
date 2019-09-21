import { IGit } from "./IGit";
import { IHost } from "./IHost";
import { Input, Result, Tibu } from "tibu"
import { resolve } from "path";
import { exec } from "child_process";
const { parse, rule, optional, many, either, token } = Tibu

export class Git implements IGit {
    fs: IHost
    /**
     *
     */
    constructor(fs: IHost) {
        this.fs = fs
    }
    async git(raw: string): Promise<string> {
        return this.fs.exec(`git ${raw}`)
            .then(x => x.stdout)
    }
    async getCurrentBranch(): Promise<string> {
        const gitout = await this.git("branch")
        let branch: string = ""
        parse(gitout)(
            rule("* ", token("branch", /\w+/))
            .yields(r => { 
                branch = r.one("branch")
            })
        )
        return branch
    }
    async getUsername(): Promise<string> {
        let user = await this.git("config user.name")
        return user.replace(/\r\n|\r|\n/g, "")
    }
    async getEmail(): Promise<string> {        
        let email = await this.git("config user.email")
        return email.replace(/\r\n|\r|\n/g, "")
    }
    async getWho(): Promise<string> {
        return `${await this.getUsername()} <${await this.getEmail()}>`
    }    
    async setEmail(email: string): Promise<boolean> {
        return this.git(`config user.email "${email}"`).then(x => true).catch(x => false)
    }
    async setUsername(username: string): Promise<boolean> {
        return this.git(`config user.name "${username}"`).then(x => true).catch(x => false)
    }
    async isRepo(): Promise<boolean> {
        return this.git("status")
            .then(x => true)
            .catch(x => false);
    }
    async isInit(): Promise<boolean> {
        return this.git("branch")
            .then(x => x.indexOf("*") >= 0)
            .catch(x => false)
    }
    async init(): Promise<boolean> {
        return this.git("init").then(x => true).catch(x => false)
    }    
    async add(pattern: string): Promise<boolean> {
        return this.git(`add ${pattern}`).then(x => true).catch(x => false)
    }
    async commit(message: string): Promise<boolean> {
        return this.git(`commit -m "${message}"`).then(x => true).catch(x => false)
    }
}