import { Input, Result, Tibu } from "tibu";
const { parse, rule, optional, many, either, token } = Tibu
import { WorkitemManager } from "../WorkitemManager"
import { Command } from "./command";
import { IGit } from "../IGit";
import { ILogger } from "../ILogger";
import { IHost } from "../IHost";
import chalk from "chalk";

export class Init extends Command {
    private logger!:ILogger
    public async run(argsraw: string, logger: ILogger): Promise<void> {
        this.logger = logger
        const result = this.parse(argsraw)
        if (result.init) {
            const _ = 
                this.isgitrepo()
                ? this.isinitialised()
                    ? logger.fail(-1, chalk`{bold Done! This directory is already a workitem repo!}`)
                    : this.hasworkitemdir()
                     ? logger.fail(-3, 'This workitem repository is broken. There is a directory structure but I cannot find the configuration file workitem.json')
                     : this.isgitclean()
                      ? this.gotoworkitembranch() && await this.setupworkitem()
                       ? logger.log(chalk`{bgBlue.white Done!}`)
                       : this.revert()
                      : logger.fail(-4, 'You have uncommited changes in this repository. Use \'git status\' to view these. Once resolved you can initialise this workitem repository.')
                   : logger.fail(-2, 'This directory is not a git repository. You can\'t initialise a workitem repository outside a git repository.') 
        }
    }
    public constructor(git: IGit, fs: IHost) {
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

    // migrated js
    private branch!: string
    isgitrepo() {
        return this.fs.existsSync(`.git`)
    }
    isinitialised() {
        return this.fs.existsSync('./.workitem/workitem.json')
    }
    hasworkitemdir() {
        return this.fs.existsSync('./.workitem')
    }
    isgitclean() {
        return this.fs.execSync("git status --porcelain").toString().length == 0
    }
    gotoworkitembranch() {
        // branch to a randomised branch
        // const rand = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        this.branch = `__workitem__` // _init_${rand}`
        require('child_process').execSync(`git checkout -b ${this.branch}`).toString()
        //
        return true
    }
    revert() {
        if (this.branch) {
            require('child_process').execSync(`git reset --hard`).toString()
            require('child_process').execSync(`git clean -fd`).toString()
            require('child_process').execSync(`git checkout -`).toString()
            require('child_process').execSync(`git branch -d ${this.branch}`).toString()
        }
        return true
    }
    commit() {        
        require('child_process').execSync(`git add --all`).toString()
        require('child_process').execSync(`git commit -m "[workitem:admin:initialised]"`).toString()
        require('child_process').execSync(`git checkout -`).toString()
        require('child_process').execSync(`git merge ${this.branch}`).toString()
        return true
    }
    async createdirectories():Promise<boolean> {
        const key = await this.fs.getKey()
        switch(key.sequence) {
            case "1":
                this.logger.log('[1]: todo -> doing -> done')
                this.fs.mkdirSync('./.workitem')
                this.fs.mkdirSync('./.workitem/.secrets')
                this.fs.mkdirSync('./.workitem/todo')
                this.fs.mkdirSync('./.workitem/doing')
                this.fs.mkdirSync('./.workitem/done')
                this.fs.writeJsonSync("./.workitem/workitem.json", {
                    directories: ["todo", "doing", "done"],
                    incoming: "todo",
                    active: ["doing"],
                    completed: "done",
                    transitions: [
                        ["todo", "doing"],
                        ["doing", "done"]
                    ],
                    workbranch: this.branch
                })
                this.fs.writeJsonSync("./.workitem/todo/index.json", {})
                this.fs.writeJsonSync("./.workitem/doing/index.json", {})
                this.fs.writeJsonSync("./.workitem/done/index.json", {})
                return true
            case "2":
                this.logger.log('[2]: backlog -> analysis -> dev -> test -> review -> done')
                this.fs.mkdirSync('./.workitem')
                this.fs.mkdirSync('./.workitem/.secrets')
                this.fs.mkdirSync('./.workitem/backlog')
                this.fs.mkdirSync('./.workitem/analysis')
                this.fs.mkdirSync('./.workitem/dev')
                this.fs.mkdirSync('./.workitem/test')
                this.fs.mkdirSync('./.workitem/review')
                this.fs.mkdirSync('./.workitem/done')
                this.fs.writeJsonSync("./.workitem/workitem.json", {
                    directories: ["todo", "doing", "done"],
                    incoming: "backlog",
                    active: ["analysis", "dev", "test", "review"],
                    completed: "done",
                    transitions: [
                        ["backlog", "analysis"],
                        ["analysis", "dev"],
                        ["dev", "test"],
                        ["test", "review"],
                        ["review", "done"]
                    ],
                    workbranch: this.branch
                })
                this.fs.writeJsonSync("./.workitem/backlog/index.json", {})
                this.fs.writeJsonSync("./.workitem/analysis/index.json", {})
                this.fs.writeJsonSync("./.workitem/dev/index.json", {})
                this.fs.writeJsonSync("./.workitem/test/index.json", {})
                this.fs.writeJsonSync("./.workitem/review/index.json", {})
                this.fs.writeJsonSync("./.workitem/done/index.json", {})
                return true
            case "3":
                this.logger.log("[3]: I'll create my own folders")
                this.fs.mkdirSync('./.workitem')
                this.fs.mkdirSync('./.workitem/.secrets')
                this.fs.writeJsonSync("./.workitem/workitem.json", {
                    directories: ["todo", "doing", "done"],
                    incoming: "",
                    active: [],
                    completed: "",
                    transitions: [
                    ],
                    workbranch: this.branch
                })
                return true
            default:
                this.logger.log('Unknown option')
                return false
        }            
    }
    updategitignore() {
        if (this.fs.existsSync('.gitignore')) {
            let ignore = this.fs.readFileSync('.gitignore', 'utf8').toString()
            if (!/^\.workitem\/\.secrets/mi.test(ignore)) {
                const eolmatch = ignore.match(/\r\n|\r|\n/)
                if (eolmatch) {
                    ignore += `${eolmatch[0]} # workitem secrets path${eolmatch[0]}.workitem/.secrets`
                } else {
                    ignore += '\r\n # workitem secrets path\r\n.workitem/.secrets'
                }
                this.fs.writeFileSync('.gitignore', ignore, 'utf8')
            }
        } else {
            this.fs.writeFileSync('.gitignore', '# workitem secrets path\r\n.workitem/.secrets', 'utf8')
        }
        return true
    }
    async configurehook():Promise<boolean> {
        const key = await this.fs.getKey()
        switch (key.sequence.toLowerCase()){
            case "y":
            // detect existing hooks
            // 1. if existing pre-commit hook, create pre-commit dir and move pre-commit hook there, renaming to pre-commit.0
            // 2. create a file pre-commit that calls all files (execs) in the pre-commit subdirectory that match pattern pre-commit.\d+
            // 3. commit changes and checkout last branch
            return true
            case "n":
            // TODO: done, commit changes and checkout last branch
            return true
            case 'w':
            this.logger.log(chalk`{bgBlue.white About the Commit Hook}\nThe commit hook makes sure that git commit messages reference a workitem.\n\nFor example: git commit -a -m "[workitem:2992:close] fixed pesky bug"\n\nIf you try to commit without a workitem reference like this one, workitem will prevent the commit from succeeding.`)
            return false
            default:
            return false
        }
    }
    async setupworkitem() {
        this.logger.log(
            "Which workflow would you like?\n"+
            "[1]: todo -> doing -> done\n"+
            "[2]: backlog -> analysis -> dev -> test -> review -> done\n"+
            "[3]: I'll create my own folders"
        )    
        while(!await this.createdirectories()){}
        while(!this.updategitignore){}
        this.logger.log(
            "Would you like to install a git commit hook for workitem?\n"+
            "[Y]es, let's do that\n"+
            "[N]o\n"+
            "[W]hat does the hook do?"
        )
        while(!await this.configurehook()){}
        this.commit()
        return true
    }
}
Command.register(Init, "initialises a workitem repo in the current git repo")