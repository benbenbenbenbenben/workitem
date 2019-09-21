import { Input, Result, Tibu } from "tibu";
const { parse, rule, optional, many, either, flat, token, all } = Tibu
import { WorkitemManager } from "../WorkitemManager"
import { Command, Example } from "./command";
import { IHost } from "../IHost";
import { ILogger } from "../ILogger";
import { IGit } from "../IGit";
import { ErrorCodes } from "../ErrorCodes";
import chalk from "chalk";

export class Search extends Command {
    public async run(argsraw: string, logger: ILogger): Promise<void> {
        const result = this.parse(argsraw)
        const wim = new WorkitemManager(this.git, this.fs)
        if (result === false) {
            logger.fail(ErrorCodes.UnknownCommand, chalk`{bgGreen.white search} could not proceed`)
        }
        logger.log(chalk`{bgGreen.white search} ${argsraw.substr(7)}`)
        const items = wim.search(result)
        items.forEach(stage => {
            logger.log(chalk`{bgBlue.yellow ${stage.stage}}`)
            if (stage.items.length > 0) {
                stage.items.forEach(item => {
                    logger.log(chalk`{white.bold #${item.id}} ${item.description} ` +
                        (item.tags ? item.tags.map(tag => chalk`{yellow ${tag}}`).join(" ") : "")
                    )
                })
            } else {
                logger.log(chalk`{grey <no results>}`)
            }
        })
    }
    public constructor(git: IGit, fs: IHost) {
        super(git, fs)
    }
    public parse(argsraw: string) {
        const search = token("search", /search|find|\?/)
        const operator = rule(
            either(
                rule(token("and", /and|\&/)).yields(_ => (l, r) => item => l(item) && r(item)),
                rule(token("or", /or|\|/)).yields(_ => (l, r) => item => l(item) || r(item))
            )
        )
        const term = rule(
            either(
                rule(token("tag", /\#[\w_-]+/i)).yields(
                    x => item => item.tags && item.tags.find(tag => tag === x.one("tag"))
                ),
                rule(token("word", /[\w_-]+/i)).yields(
                    x => item => item.description && item.description.indexOf(x.one("word")) >= 0
                )
            )
        )
        const query = rule(
            either(
                rule(term, Command.ws, operator, Command.ws, () => query).yields(
                    (t, c) => {
                        const [l, o, r] = flat(c)
                        const f = o(l, r)
                        //f.toString = () => o + "(" + l + ", " + r + ")"
                        return f
                    }
                ),
                rule(term, Command.ws, () => query).yields(
                    (t, c) => {
                        const [l, r] = flat(c)
                        return item => l(item) && r(item)
                    }
                ),
                rule(term)
            )
        )

        let result: any = false
        parse(argsraw)(
            rule(search, Command.ws, query, Command.EOL).yields(
                (r, c) => {
                    result = flat(c).filter(x => x)[0]
                }
            )
        )
        
        return result
    }
}

Command.register(Search, "searchs a workitem", [
    { example: 'search <item> "new name"', info: "searchs an item", options: [{
        label: "item", description: "the item id or index, e.g; #f08472a or 1.1"
    }]}
])