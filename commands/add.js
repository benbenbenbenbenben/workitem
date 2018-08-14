const chalk = require('chalk')
const ProgressBar = require('./../progressbar')
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

module.exports = {
    flags: 'add <description>',
    desc: 'Adds a work item',
    run: argv => {
        const config = JSON.parse(fs.readFileSync('./../.workitem/workitem.json', 'utf8').toString())
        console.log(argv)
        console.log(config)
        const witemname = argv.description
        
    }
}