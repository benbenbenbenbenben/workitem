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
    flags: 'move <item> [to] <stage>',
    desc: 'Moves a work item [to] another stage',
    run: argv => {
        const wim = new WorkitemManager()
        console.log(argv)
        console.log(wim.config)
        let result = wim.move(argv.item, argv.stage)
        //const wiid = wim.add({
        //    description: argv.description,
        //    tags: argv._.filter(x => x.indexOf("#") == 0),
        //    location: [...argv._.filter(x => x.indexOf("@") == 0), undefined][0]
        //})
        if (!result.success) {
            fail(-10, result.message)
        }
    }
}