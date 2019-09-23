import { Input, Result, Tibu } from "tibu";
const { parse, rule, optional, many, either, token } = Tibu
import { WorkitemManager } from "../WorkitemManager"
import { Command, Example } from "./command";
import { IHost } from "../IHost";
import { ILogger } from "../ILogger";
import { IGit } from "../IGit";
import { ErrorCodes } from "../ErrorCodes";
import chalk from "chalk";

export class Tag extends Command {
    public async run(argsraw: string, logger: ILogger): Promise<void> {
        const result = this.parse(argsraw)
        const wim = new WorkitemManager(this.git, this.fs)
        if (result === false) {
            logger.fail(ErrorCodes.UnknownCommand, chalk`{bgGreen.white tag} could not proceed`)
        }
        const workitemsuccess = wim.idToWorkitem(result.item)
        if (!workitemsuccess.success) {
            logger.fail(ErrorCodes.UnknownIdentifier, workitemsuccess.error!)
        }
        const workitem = workitemsuccess.value
        wim.tag(result.item, result.tag)
        logger.log(chalk`{bgGreen.white tag} #${workitem.id} ${workitem.description} {yellow added} {bgWhite.black ${result.tag}}`)
    }
    public constructor(git: IGit, fs: IHost) {
        super(git, fs)
    }
    public parse(argsraw: string) {
        const tag = token("tag", "tag")
        const item = token("item", /((\d+\.)+(\d+))|(\#?([a-f0-9]{3,7}))/i)
        const thetag = token("thetag", /#[\w_][\w_-]+/i)
        // const rm = token("rm", "rm")

        let result: any = false
        parse(argsraw)(
            rule(tag, Command.ws, item, Command.ws, thetag, Command.EOL).yields(
                (r, c) => {
                    result = {
                        item: r.one("item"),
                        tag: r.one("thetag"),
                    }
                }
            )
        )

        return result
    }
}
Command.register(Tag, "adds commentary to a work item", [
    { example: 'tag <item> "new tag"', info: "adds a new commentary tag to an item", options:[
        {
            label: "item", description: "the item id or index, e.g; #f08472a or 1.1"
        }
    ] }
])