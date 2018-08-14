const chalk = require('chalk')
const ProgressBar = require('./progressbar')
const log = console.log
const fs = require('fs')
const Prompt = require('prompt-improved')

var prompt = new Prompt({
    // Some options for all prompts
    prefix: '[?] ',
    prefixTheme: Prompt.chalk.green
});

module.exports = {
    flags: 'init',
    desc: 'Initialise the current git repo as a workitem repo',
    run: argv => {
        log(chalk`{bgRed.white workitem 1.0.0}`)
        log(chalk`{bgGreen init}`)


        log(`checking this directory...`)
        if (!fs.existsSync(`.git`)) {
            log(`Stopping. This directory is not a git repository. You can't initialise a workitem repository outside a git repository.`)
            process.exit(-1)
        }
        fs.exists('./.workitem/workflow.json', (result) => {
            if (result) {
                log(chalk`{bold Done! This repo is already workitem enabled!}`)
            } else {
                if (fs.existsSync('./.workitem')) {
                    log('This workitem repository is broken. There is a directory structure but I cannot find the configuration file workflow.json')
                    process.exit(-2)
                }
                // check git status before changing anything
                log('checking git status')
                let gitstatus = require('child_process').execSync("git status --porcelain").toString()
                if (gitstatus.length > 0) {
                    log(`You have uncommited changes in this repository. Use 'git status' to view these. Once resolved you can initialise this workitem repository.`)
                    process.exit('3')
                }
                // branch to a randomised branch
                const rand = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
                const branch = `workitem_init_${rand}`
                require('child_process').execSync(`git checkout -b ${branch}`).toString()
                //           
                prompt.ask("Which workflow would you like?\n"+
                "[1]: todo -> doing -> done\n"+
                "[2]: backlog -> analysis -> dev -> test -> review\n"+
                "[3]: I'll create my own folders", function(err, res) {
                    if (err) return console.error(err);
                    switch(res) {
                        case "1":
                        log(`[1]: todo -> doing -> done`)
                        log(`creating directories`)
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
                            ]
                        }, null, 2))
                        log(`updating .gitignore`)
                        if (fs.existsSync('.gitignore')) {
                            const ignore = fs.readFileSync('.gitignore', 'utf8')
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
                        break;
                        case "2":
                        log(2)
                        log(`creating directories`)
                        fs.mkdirSync('./.workitem')
                        fs.mkdirSync('./.workitem/backlog')
                        fs.mkdirSync('./.workitem/analysis')
                        fs.mkdirSync('./.workitem/dev')
                        fs.mkdirSync('./.workitem/test')
                        fs.mkdirSync('./.workitem/review')
                        break;
                        case "3":
                        log(3)
                        break;
                        default:
                        // TODO: verify this rolls back branch
                        require('child_process').execSync(`git clean -f`).toString()
                        require('child_process').execSync(`git checkout -`).toString()
                        require('child_process').execSync(`git branch -d ${branch}`).toString()
                        log(`Cleaned up and stopping. Option ${res} is not recognised.`)
                        break;
                    }
                });
            }
        })

    }
}