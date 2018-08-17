const chalk = require('chalk')
const ProgressBar = require('./../progressbar')
const fs = require('fs')
const Prompt = require('prompt-improved')
const { WorkitemManager } = require('./../WorkitemManager')

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
    flags: 'collate',
    desc: 'Collates work items across local branches',
    run: argv => {
        const wim = new WorkitemManager()
        // log(argv)
        // log(wim.config)
        const collate = wim.previewcollate()
        log(chalk`{bgGreen.white collate}`)
        log(chalk`You are on branch {bgRed.white ${collate.here}}.`)
    }
}