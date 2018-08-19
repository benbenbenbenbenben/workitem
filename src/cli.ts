// #!/usr/bin/env node
import chalk from "chalk"
import { Command, ICommand } from "./commands/command";
import { ILogger } from "./ILogger";
import { ErrorCodes } from "./ErrorCodes";
import { Host } from "./Host";
import { Git } from "./Git";

class CLI implements ILogger {
    log(message: string | undefined = undefined): void {
        if (message)
            console.log(message)
        else
            console.log()
    }
    fail(err: number, message: string): void {
        if (err === ErrorCodes.NotInitialised) {
            this.log(chalk`{bgYellow warning} this directory is not initialised as a repo`)
            this.showHelp()
        } else {
            console.error(message)
        }
        process.exit(err)
    }
    showHelp(): void {
        this.log(`\ncommand usage:\n`)
        Command.printhelp(this)
        this.log()
    }
    constructor() {
        ;
    }
    public async run(argsraw: string) {
        const fs = new Host()
        const git = new Git(fs)

        const commands = [
            "show",
            "init",
            "add",
            "note",
            "rename",
            "move",
            "collate"
        ]

        for (let command of commands) { 
            await import(`./commands/${command}`)
        }
        console.log(chalk`{bgRed.white.bold workitem 2.0.0}`);
        
        const parseok = await Command.run(git, fs, this, argsraw)

        if (parseok === false) {
            if (argsraw.length) {
                this.fail(ErrorCodes.UnknownCommand, `Sorry, that command couldn't be understood`)
            } else {
                this.showHelp()
            }
        }
    }
}

new CLI().run(process.argv.slice(2).map(s => !s.includes(" ") ? s : ['"', s.replace(/\"/g, "\\\""), '"'].join("")).join(" "))