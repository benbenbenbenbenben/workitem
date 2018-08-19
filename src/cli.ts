// #!/usr/bin/env node
import chalk from "chalk"
import { Command, ICommand } from "./commands/command";
import { FakeGit } from "./FakeGit";
import { FakeFs } from "./FakeFs";
import { ILogger } from "./ILogger";
import { ErrorCodes } from "./ErrorCodes";

class CLI implements ILogger {
    log(message: string): void {
        console.log(message)
    }
    fail(err: number, message: string): void {
        console.error(message)
        process.exit(err)
    }
    constructor() {
        ;
    }
    public async run(argsraw: string) {
        const git = new FakeGit()
        const fs = new FakeFs()

        const commands = [
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
                this.log(`Usage:`)
                Command.printhelp(this)
            }
        }
    }
}

new CLI().run(process.argv.slice(2).join(" "))
