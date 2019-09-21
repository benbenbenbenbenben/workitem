import { Input, Result, Tibu } from "tibu";
const { parse, rule, optional, many, either, token } = Tibu
import { WorkitemManager } from "../WorkitemManager"
import { Command, Example } from "./command";
import { IHost } from "../IHost";
import { ILogger } from "../ILogger";
import { IGit } from "../IGit";
import { ErrorCodes } from "../ErrorCodes";
import chalk from "chalk";

export class Rename extends Command {
    public async run(argsraw: string, logger: ILogger): Promise<void> {
        const result = this.parse(argsraw)
        const wim = new WorkitemManager(this.git, this.fs)
        if (result === false) {
            logger.fail(ErrorCodes.UnknownCommand, chalk`{bgGreen.white add} could not proceed`)
        }
        wim.rename(result.item, result.newname)
    }
    public constructor(git: IGit, fs: IHost) {
        super(git, fs)
    }
    public parse(argsraw: string) {
        const rename = token("rename", "rename")
        const item = token("item", /((\d+\.)+(\d+))|(\#?([a-f0-9]{3,7}))/i)

        let result: any = false
        parse(argsraw)(
            rule(rename, Command.ws, item, Command.ws, Command.msg, Command.EOL).yields(
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

Command.register(Rename, "renames a workitem", [
    { example: 'rename <item> "new name"', info: "renames an item", options: [{
        label: "item", description: "the item id or index, e.g; #f08472a or 1.1"
    }]}
])