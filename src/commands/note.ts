import { Input, Result, Tibu } from "tibu";
const { parse, rule, optional, many, either, token } = Tibu
import { WorkitemManager } from "../WorkitemManager"
import { Command } from "./command";
import { IHost } from "../IHost";
import { ILogger } from "../ILogger";
import { IGit } from "../IGit";

export class Note extends Command {
    public run(argsraw: string, logger: ILogger): void {
        throw new Error("Method not implemented.");
    }
    public constructor(git: IGit, fs: IHost) {
        super(git, fs)
    }
    public parse(argsraw: string) {
        const move = token("note", "note")
        const item = token("item", /((\d+\.)+(\d+))|(\#?([a-f0-9]{7}))/i)

        let result: any = false
        parse(argsraw)(
            rule(move, Command.ws, item, Command.ws, Command.msg).yields(
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