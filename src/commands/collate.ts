import { Input, Result, Tibu } from "tibu";
const { parse, rule, optional, many, either, token } = Tibu
import { WorkitemManager } from "../WorkitemManager"
import { Command, ICommand } from "./command";
import { ILogger } from "../ILogger";
import { IGit } from "../IGit";
import { IFs } from "../IFs";

export class Collate extends Command {
    public run(argsraw: string, logger: ILogger): void {
        throw new Error("Method not implemented.");
    }
    public constructor(git: IGit, fs: IFs) {
        super(git, fs)
    }
    public parse(argsraw: string): boolean | any {
        const collate = token("collate", "collate")
        const auto = token("auto", "auto")

        let result: any = false
        parse(argsraw)(
            rule(collate, optional(Command.ws, auto), Command.EOL).yields(r => {
                result = {
                    collate: true,
                    auto: r.one("auto") === "auto"
                }
            })
        )
    }

}
Command.register(Collate, "collates workitems across local branches")