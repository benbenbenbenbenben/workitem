import { Input, Result, Tibu } from "tibu";
const { parse, rule, optional, many, either, token } = Tibu
import { WorkitemManager } from "../WorkitemManager"
import { Command } from "./command";
import { IFs } from "../IFs";
import { ILogger } from "../ILogger";
import { IGit } from "../IGit";

export class Rename extends Command {
    public run(argsraw: string, logger: ILogger): void {
        throw new Error("Method not implemented.");
    }
    public constructor(git: IGit, fs: IFs) {
        super(git, fs)
    }
    public parse(argsraw: string) {
        const rename = token("rename", "rename")
        const item = token("item", /((\d+\.)+(\d+))|(\#?([a-f0-9]{7}))/i)

        let result: any = false
        parse(argsraw)(
            rule(rename, Command.ws, item, Command.ws, Command.msg).yields(
                (r, c) => {
                    result = {
                        item: r.one("item"),
                        newname: r.one("msg"),
                    }
                }
            )
        )

        return result
    }
}
Command.register(Rename, "renames a workitem")