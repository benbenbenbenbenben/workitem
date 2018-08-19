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

        const blessed = require('blessed')
        const screen = blessed.screen({smartCSR: true, title: "editor-widget example"})
        var progress = blessed.progressbar({
            parent: screen,
            border: 'line',
            style: {
              fg: 'blue',
              bg: 'default',
              bar: {
                bg: 'default',
                fg: 'blue'
              },
              border: {
                fg: 'default',
                bg: 'default'
              }
            },
            ch: ':',
            width: '50%',
            height: 3,
            top: 3,
            left: 3,
            filled: 0
          })
          screen.render()
//screen.destroy()
let x  = 0
        wim.previewcollate(update => {
            //console.log(1)
            progress.setProgress(100 / update.total * update.current)
            screen.render()
        }, () => {
            screen.destroy()
        })
        //screen.destroy()
        // log(chalk`{bgGreen.white collate}`)
        // log(chalk`You are on branch {bgRed.white ${collate.here}}.`)

    }
}