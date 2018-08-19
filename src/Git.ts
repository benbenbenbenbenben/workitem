import { IGit } from "./IGit";
import { IHost } from "./IHost";
import { Input, Result, Tibu } from "tibu"
const { parse, rule, optional, many, either, token } = Tibu

export class Git implements IGit {
    fs: IHost
    /**
     *
     */
    constructor(fs: IHost) {
        this.fs = fs
    }
    git(raw: string): string {
        return this.fs.execSync("git " + raw).toString()
    }
    getCurrentBranch(): string {
        const gitout = this.git("branch")
        let branch: string = ""
        parse(gitout)(
            rule("* ", token("branch", /\w+/))
            .yields(r => { 
                branch = r.one("branch")
            })
        )
        return branch
    }

}