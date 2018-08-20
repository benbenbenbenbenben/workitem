import { Input, Result, Tibu } from "tibu";
const { parse, rule, optional, many, either, token } = Tibu
import { WorkitemManager } from "../WorkitemManager"
import { Command } from "./command";
import { IHost } from "../IHost";
import { ILogger } from "../ILogger";
import { IGit } from "../IGit";
import { ErrorCodes } from "../ErrorCodes";
import chalk from "chalk";

export class Move extends Command {
    public async run(argsraw: string, logger: ILogger): Promise<void> {        
        const result = this.parse(argsraw)
        const wim = new WorkitemManager(this.git, this.fs)
        if (result === false) {
            logger.fail(ErrorCodes.UnknownCommand, chalk`{bgGreen.white add} could not proceed`)
        }
        wim.move(result.item, result.stage)
    }
    public constructor(git: IGit, fs: IHost) {
        super(git, fs)
    }
    public parse(argsraw: string) {
        const move = token("move", "move")
        const item = token("item", /((\d+\.)+(\d+))|(\#?([a-f0-9]{7}))/i)
        const stage = token("stage", /\w+/)

        let result: any = false
        parse(argsraw)(
            rule(move, Command.ws, item, Command.ws, optional(/to\s+/), stage, Command.EOL).yields(
                (r, c) => {
                    result = {
                        item: r.one("item"),
                        stage: r.one("stage"),
                    }
                }
            )
        )
        return result
    }

}
Command.register(Move, "moves a workitem")