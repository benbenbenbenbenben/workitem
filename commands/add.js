const chalk = require('chalk')
const ProgressBar = require('./../progressbar')
const fs = require('fs')
const Prompt = require('prompt-improved')
const { WorkitemManager } = require('./../workitem')

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

module.exports = {
    flags: 'add <description>',
    desc: 'Adds a work item',
    run: argv => {
        const wim = new WorkitemManager()
        console.log(argv)
        console.log(wim.config)
        const wiid = wim.add(argv.description)
        log(chalk`workitem added: {bgBlue.yellow #${wiid}}: ${argv.description}`)
    }
}