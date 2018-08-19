import { Input, Result, Tibu } from "tibu";
const { parse, rule, optional, many, either, token } = Tibu
import { WorkitemManager } from "../WorkitemManager"
import { Command } from "./command";
import { IFs } from "../IFs";
import { ILogger } from "../ILogger";
import { IGit } from "../IGit";

export class Move extends Command {
    public run(argsraw: string, logger: ILogger): void {
        throw new Error("Method not implemented.");
    }
    public constructor(git: IGit, fs: IFs) {
        super(git, fs)
    }
    public parse(argsraw: string) {
        const move = token("move", "move")
        const item = token("item", /((\d+\.)+(\d+))|(\#?([a-f0-9]{7}))/i)
        const stage = token("stage", /\w+/)

        let result: any = false
        parse(argsraw)(
            rule(move, Command.ws, item, Command.ws, optional(/to\s+/), stage).yields(
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