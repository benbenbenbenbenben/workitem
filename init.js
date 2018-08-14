const chalk = require('chalk')
const ProgressBar = require('./progressbar')
const fs = require('fs')
const Prompt = require('prompt-improved')

const prompt = new Prompt({
    // Some options for all prompts
    prefix: '[?] ',
    prefixTheme: Prompt.chalk.green
});

const fail = (code = -127, msg = 'unknown error') => console.error(`error ${code}: ${msg}`)|code
const log = (msg) => console.log(msg)|1

const promptsync = require('prompt-sync')({sigint:true})
const readkey = () => {
    return promptsync()
}

class Init {
    banner() {
        log(chalk`{bgRed.white workitem 1.0.0}`)
        log(chalk`{bgGreen init}`)
        return true
    }
    isgitrepo() {
        return fs.existsSync(`.git`)
    }
    isinitialised() {
        return fs.existsSync('./.workitem/workitem.json')
    }
    hasworkitemdir() {
        return fs.existsSync('./.workitem')
    }
    isgitclean() {
        return require('child_process').execSync("git status --porcelain").toString().length == 0
    }
    gotoworkitembranch() {
        // branch to a randomised branch
        const rand = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        this.branch = `workitem_init_${rand}`
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
    createdirectories() {
        const key = readkey()
        switch(key) {
            case "1":
                log('[1]: todo -> doing -> done')
                fs.mkdirSync('./.workitem')
                fs.mkdirSync('./.workitem/.secrets')
                fs.mkdirSync('./.workitem/todo')
                fs.mkdirSync('./.workitem/doing')
                fs.mkdirSync('./.workitem/done')
                fs.writeFileSync("./.workitem/workflow.json", JSON.stringify({
                    incoming: "todo",
                    active: ["doing"],
                    completed: "done",
                    transitions: [
                        ["todo", "doing"],
                        ["doing", "done"]
                    ],
                    workbranch: this.branch
                }, null, 2))
                return true
            case "2":
                log('[2]: backlog -> analysis -> dev -> test -> review -> done')
                fs.mkdirSync('./.workitem')
                fs.mkdirSync('./.workitem/.secrets')
                fs.mkdirSync('./.workitem/backlog')
                fs.mkdirSync('./.workitem/analysis')
                fs.mkdirSync('./.workitem/dev')
                fs.mkdirSync('./.workitem/test')
                fs.mkdirSync('./.workitem/review')
                fs.mkdirSync('./.workitem/done')
                fs.writeFileSync("./.workitem/workflow.json", JSON.stringify({
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
                }, null, 2))
                return true
            case "3":
                log("[3]: I'll create my own folders")
                fs.mkdirSync('./.workitem')
                fs.mkdirSync('./.workitem/.secrets')
                fs.writeFileSync("./.workitem/workflow.json", JSON.stringify({
                    incoming: "",
                    active: [],
                    completed: "",
                    transitions: [
                    ],
                    workbranch: this.branch
                }, null, 2))
                return true
            default:
                log('Unknown option')
                return false
        }
    }
    updategitignore() {
        if (fs.existsSync('.gitignore')) {
            let ignore = fs.readFileSync('.gitignore', 'utf8').toString()
            if (!/^\.workitem\/\.secrets/mi.test(ignore)) {
                const eolmatch = ignore.match(/\r\n|\r|\n/)
                if (eolmatch) {
                    ignore += `${eolmatch[0]} # workitem secrets path${eolmatch[0]}.workitem/.secrets`
                } else {
                    ignore += '\r\n # workitem secrets path\r\n.workitem/.secrets'
                }
                fs.writeFileSync('.gitignore', ignore, 'utf8')
            }
        } else {
            fs.writeFileSync('.gitignore', '# workitem secrets path\r\n.workitem/.secrets', 'utf8')
        }
        return true
    }
    configurehook() {
        const key = readkey()
        switch (key){
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
            log(chalk`{bgBlue.white About the Commit Hook}\nThe commit hook makes sure that git commit messages reference a workitem.\n\nFor example: git commit -a -m "[workitem:2992:close] fixed pesky bug"\n\nIf you try to commit without a workitem reference like this one, workitem will prevent the commit from succeeding.`)
            return false
            default:
            return false
        }
    }
    setupworkitem() {
        log(
            "Which workflow would you like?\n"+
            "[1]: todo -> doing -> done\n"+
            "[2]: backlog -> analysis -> dev -> test -> review -> done\n"+
            "[3]: I'll create my own folders"
        )    
        while(!this.createdirectories()){}
        while(!this.updategitignore){}
        log(
            "Would you like to install a git commit hook for workitem?\n"+
            "[Y]es, let's do that\n"+
            "[N]o\n"+
            "[W]hat does the hook do?"
        )
        while(!this.configurehook()){}
        this.commit()
        return true
    }
}

module.exports = {
    flags: 'init',
    desc: 'Initialise the current git repo as a workitem repo',
    run: argv => {
        const init = new Init()
        const result =
            init.banner() && init.isgitrepo()
            ? init.isinitialised()
             ? fail(-1, chalk`{bold Done! This directory is already a workitem repo!}`)
             : init.hasworkitemdir()
              ? fail(-3, 'This workitem repository is broken. There is a directory structure but I cannot find the configuration file workitem.json')
              : init.isgitclean()
               ? init.gotoworkitembranch() && init.setupworkitem()
                ? log(chalk`{bgBlue.white Done!}`)
                : init.revert()
               : fail(-4, 'You have uncommited changes in this repository. Use \'git status\' to view these. Once resolved you can initialise this workitem repository.')
            : fail(-2, 'This directory is not a git repository. You can\'t initialise a workitem repository outside a git repository.')
        
        process.exit(result)
    }
}