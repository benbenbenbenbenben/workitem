import { Input, Result, Tibu } from "tibu";
const { parse, rule, optional, many, either, token } = Tibu
import { WorkitemManager } from "../WorkitemManager"
import { Command } from "./command";
import { IHost } from "../IHost";
import { ILogger } from "../ILogger";
import { IGit } from "../IGit";
import { ErrorCodes } from "../ErrorCodes";
import chalk from "../../node_modules/chalk";

export class Note extends Command {
    public run(argsraw: string, logger: ILogger): void {
        const result = this.parse(argsraw)
        const wim = new WorkitemManager(this.git, this.fs)
        if (result === false) {
            logger.fail(ErrorCodes.UnknownCommand, chalk`{bgGreen.white add} could not proceed`)
        }
        wim.comment(result.item, result.comment, this.git.getWho())
    }
    public constructor(git: IGit, fs: IHost) {
        super(git, fs)
    }
    public parse(argsraw: string) {
        const move = token("note", "note")
        const item = token("item", /((\d+\.)+(\d+))|(\#?([a-f0-9]{7}))/i)

        let result: any = false
        parse(argsraw)(
            rule(move, Command.ws, item, Command.ws, Command.msg, Command.EOL).yields(
                (r, c) => {
                    result = {
                        item: r.one("item"),
                        comment: r.one("msg"),
                    }
                }
            )
        )

        return result
    }
}
Command.register(Note, "adds commentary to a work item")