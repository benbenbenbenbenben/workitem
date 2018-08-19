import { Input, Result, Tibu } from "tibu";
const { parse, rule, optional, many, either, token, all } = Tibu
import { WorkitemManager } from "../WorkitemManager"
import { Command } from "./command";
import { IHost } from "../IHost";
import { ILogger } from "../ILogger";
import { IGit } from "../IGit";
import { ErrorCodes } from "../ErrorCodes";
import chalk from "chalk";

export class Show extends Command {
    public run(argsraw: string, logger: ILogger): void {
        const result = this.parse(argsraw)
        const wim = new WorkitemManager(this.git, this.fs)
        if (result === false) {
            logger.fail(ErrorCodes.UnknownCommand, chalk`{bgGreen.white show} could not proceed`)
        } else if(wim.isInitialised()) {
            logger.log(chalk`{bgGreen.white show}`)
            const logs = wim.show()
            const top = result.more ? 9999 : 3
            logs.forEach((l, j) => {
                logger.log(chalk`{bgBlue.yellow ${l.stage}}`)
                l.items.slice(0, top).forEach((i, k) => {
                    logger.log(chalk`[${j.toString()}.${k.toString()}] {bold #${i.id}} {yellow ${i.description}}`)
                })
                let x = l.items.length - top
                if (x > 0)
                    logger.log(` +${x} more...`)
              })
        } else {
            logger.fail(ErrorCodes.NotInitialised, chalk`this repo is not initialised`)
        }
        // wim.add(result)
    }
    public constructor(git: IGit, fs: IHost) {
        super(git, fs)
    }
    public parse(argsraw: string) {
        const show = token("show", "show")
        const more = token("more", "more")
        const item = token("item", /((\d+\.)+(\d+))|(\#?([a-f0-9]{7}))/i)

        let result: any = false
        parse(argsraw)(
            rule(optional(either(all(show, Command.ws, more), show, more)), optional(Command.ws, item), Command.EOL).yields(
                (r, c) => {
                    result = {
                        show: true,
                        more: r.one("more") === "more",
                        item: r.one("item"),
                    }
                }
            )
        )

        return result
    }
}
Command.register(Show, "(default) shows the current workitems")