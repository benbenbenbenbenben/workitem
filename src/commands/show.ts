import { Input, Result, Tibu } from "tibu";
const { parse, rule, optional, many, either, token, all } = Tibu
import { WorkitemManager } from "../WorkitemManager"
import { Command, Example } from "./command";
import { IHost } from "../IHost";
import { ILogger } from "../ILogger";
import { IGit } from "../IGit";
import { ErrorCodes } from "../ErrorCodes";
import chalk from "chalk";

export class Show extends Command {
    public async run(argsraw: string, logger: ILogger): Promise<void> {
        const result = this.parse(argsraw)
        const wim = new WorkitemManager(this.git, this.fs)
        if (result === false) {
            logger.fail(ErrorCodes.UnknownCommand, chalk`{bgGreen.white show} could not proceed`)
        } else if (wim.isInitialised()) {
            logger.log(chalk`{bgGreen.white show}`)
            if (result.item) {
                const item:any = wim.idToWorkitem(result.item).value
                if (item.type) {
                    logger.log(chalk`{bgBlue.white.bold ${item.stage} #${item.id}} {bgYellow.bold ${item.type}} ${item.description}`)
                } else {
                    logger.log(chalk`{bgBlue.white.bold ${item.stage} #${item.id}} ${item.description}`)
                }
                if (result.more) {
                    // load linked stuff
                    const comments = wim.getComments(item.id)
                    if (comments.length) {
                        logger.log(chalk`{bgBlack.yellowBright comments:}`)
                        for (let comment of comments) {
                            logger.log(chalk`${comment.content} {yellowBright.italic ${comment.who}}`)
                        }
                    }
                }
                if (item.tags) {
                    logger.log()
                    const tags = item.tags.map((t:string) => chalk`{bgWhite.black ${t}}`).join(" ")
                    logger.log(tags)
                }
                let footer = []
                if (item.parent) {
                   footer.push(chalk`child of: {bgBlue.white ${item.parent}}`)
                }
                if (item.child) {                    
                    footer.push(`parent of: ${item.child.map((c:string) => chalk`{bgBlue.white ${c}}`).join(" ")}`)
                }
                if (item.estimate) {
                    footer.push(`est: ${item.estimate}`)
                }
                if (footer.length) {
                    logger.log(footer.join("\n"))
                }
            } else {
                const logs = wim.show()
                const top = result.more || result.stage ? undefined : 3
                logs.forEach((l, j) => {
                    if (result.stage === null || l.stage === result.stage) {
                        logger.log(chalk`{bgBlueBright.yellowBright ${l.stage}}`)
                        l.items.slice(0, top).forEach((i, k) => {
                            logger.log(chalk`[${j.toString()}.${k.toString()}] {bold #${i.id}} {yellow ${i.description}}`)
                        })
                        if (top) {
                            let x = l.items.length - top
                            if (x > 0)
                                logger.log(` +${x} more...`)
                        }
                    }
                })
            }
        } else {
            logger.fail(ErrorCodes.NotInitialised, chalk`This directory is not a .workitem repository. Run workitem init to create a repository here.`)
        }
    }
    public constructor(git: IGit, fs: IHost) {
        super(git, fs)
    }
    public parse(argsraw: string) {
        const show = token("show", "show")
        const more = token("more", "more")
        const item = token("item", /((\d+\.)+(\d+))|(\#?([a-f0-9]{3,7}))/i)
        const stage = token("stage", /[\w_-]+/)

        let result: any = false
        parse(argsraw)(
            rule(optional(either(all(show, Command.ws, more), show, more, all("@", stage))), optional(Command.ws, item), Command.EOL).yields(
                (r, c) => {
                    result = {
                        show: true,
                        more: r.one("more") === "more",
                        item: r.one("item"),
                        stage: r.one("stage")
                    }
                }
            )
        )

        return result
    }
}

Command.register(Show, "(default) shows the current workitems",  [
    { example: "show", info: "show a truncated view of workitems", options: [] },
    { example: "show more | more", info: "shows all work items", options: [] },
    { example: "show [more] <item>", info: "shows an item in detail", options: [
        {
            label: "more", description: "includes more detail"
        },
        {
            label: "item", description: "the item id or index, e.g; #f08472a or 1.1"
        }
    ] },
])