import { Input, Result, Tibu } from "tibu";
const { parse, rule, optional, many, either, token, all } = Tibu
import { WorkitemManager } from "../WorkitemManager"
import { Command, ICommand } from "./command";
import { ErrorCodes } from "../ErrorCodes";
import chalk from "chalk"
import { ILogger } from "../ILogger";
import { IGit } from "../IGit";
import { IHost } from "../IHost";

export interface Add extends Command {}
export class Add extends Command  {
    public run(argsraw: string, logger: ILogger): void {
        const result = this.parse(argsraw)
        const wim = new WorkitemManager(this.git, this.fs)
        if (result === false) {
            logger.fail(ErrorCodes.UnknownCommand, chalk`{bgGreen.white add} could not proceed`)
        }
        if (result === true) {
            logger.fail(ErrorCodes.NotImplemented, chalk`wizard not implemented`)
        }
        wim.add(result)
    }
    public constructor(git: IGit, fs: IHost) {
        super(git, fs)
    }
    public parse(argsraw: string): boolean | any {       
        const add = token("add", /^add/i)
        const type = token("type", /\w+/)
        const xats = rule(Command.ws, token("xats", /\@\w+/))
        const xtags = rule(Command.ws, token("xtags", /\#\w+/))
        const xest = rule(Command.ws, token("xest", /\~\w+/))
        const xplus = token("xplus", /\+\w+/)
        const xmin = token("xmin", /\-\w+/)
        const xbigger = rule(Command.ws, token("xbigger", /\>\w+/))
        const xsmaller = rule(Command.ws, token("xsmaller", /\<\w+/))

        let result: any = false
        parse(argsraw)(
            rule(either(
                rule(add, Command.ws, either(all(type, Command.ws, Command.msg), Command.msg), many(xtags),
                    optional(xats), optional(xest),
                    optional(either(xbigger, xsmaller)),
                    Command.EOL).yields((r, c) => {
                    result = {
                        description: r.one("msg"),
                        tags: r.get("xtags"),
                        type: r.one("type"),
                        location: r.one("xats"),
                        estimate: r.one("xest"),
                        child: r.one("xsmaller"),
                        parent: r.one("xbigger"),
                    }
                }),
                rule(add, Command.EOL).yields(() => {
                    result = true
                }),
            )),
        )
        return result
    }
}
Command.register(Add, "adds a workitem")