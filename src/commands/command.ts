import { IRule, Tibu, Input, Result } from "tibu";
import { CONNREFUSED } from "dns";
import { ILogger } from "../ILogger";
import { IGit } from "../IGit";
import { IFs } from "../IFs";
import chalk from "../../node_modules/chalk";
const { rule, token, either, all, many, optional } = Tibu


export type ICommand = {
    parse(argsraw: string): boolean | any
    run(argsraw:string, logger: ILogger): void
}

export abstract class Command {
    private static registry: {
        name: string
        ctor: new(git: IGit, fs: IFs) => Command,
        help: string
    }[]
    public git: IGit
    public fs: IFs
    public constructor(git: IGit, fs: IFs) {
        this.git = git
        this.fs = fs
    }
    public abstract parse(argsraw: string): boolean | any
    public abstract run(argsraw:string, logger: ILogger): void
    public static ws: IRule = rule(/\s*/)
    public static msg: IRule = rule(either(rule("'", token("msg", /[^\']*/), "'"),
                        rule('"', token("msg", /[^\"]*/), '"')))
    public static EOL: any = (input: Input): Result =>
                        input.location === input.source.length
                                        ? Result.pass(input)
                                        : Result.fault(input)
    public static register<T extends Command>(c: new(git: IGit, fs: IFs) => T, help: string = ""): void {
        if (Command.registry === undefined) {
            Command.registry = []
        }
        if (Command.registry.find(x => x.name === c.name) === undefined) {
            Command.registry.push({
                name: c.name,
                ctor: c,
                help,
            })
        }
    }
    public static async run(git: IGit, fs:IFs, logger:ILogger, argsraw: string): Promise<boolean> {
        let parseok = false
        for (let reg of Command.registry) {
            const cmd = new reg.ctor(git, fs)
            if (cmd.parse(argsraw)) {
                parseok = true
                cmd.run(argsraw, logger)
                break
            }
        }
        return parseok
    }
    public static printhelp(logger: ILogger): void {        
        for (let reg of Command.registry) {
            logger.log(chalk`{bgGreen.white ${reg.name.toLowerCase()}}\t${reg.help}`)
        }
    }
}