import { Input, Result, Tibu } from "tibu";
const { parse, rule, optional, many, either, token } = Tibu
import { WorkitemManager } from "../WorkitemManager"
import { Command } from "./command";
import { IGit } from "../IGit";
import { ILogger } from "../ILogger";
import { IFs } from "../IFs";

export class Init extends Command {
    public run(argsraw: string, logger: ILogger): void {
        throw new Error("Method not implemented.");
    }
    public constructor(git: IGit, fs: IFs) {
        super(git, fs)
    }
    public parse(argsraw: string) {
        const init = token("init", "init")
        const auto = token("auto", /auto/)

        let result: any = false
        parse(argsraw)(
            rule(init, optional(Command.ws, auto), Command.EOL).yields(r => {
                result = {
                    init: true,
                    auto: r.one("auto") === "auto"
                }
            })
        )

        return result
    }
}
Command.register(Init, "initialises a workitem repo in the current git repo")