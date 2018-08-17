#!/usr/bin/env node
const chalk = require('chalk')
const fs = require('fs')
const { WorkitemManager } = require('./WorkitemManager')
const isworkitemdirectory = fs.existsSync("./.workitem")

console.log(chalk`{bgRed.white.bold workitem 1.0.0}`)
require('sywac')
  .usage(chalk`{bgGreen.white help}`)
  .command(require('./init'))
  .command(require('./commands/add'))
  .command(require('./commands/note'))
  .command(require('./commands/move'))
  .command(require('./commands/rename'))
  .command(require('./commands/collate'))
  .help().showHelpByDefault(!isworkitemdirectory)
  .style({
    flags: s => chalk.bgGreen.white(s),
    desc: s => chalk.white(s),
    hints: s => chalk.dim(s)
  })
  .parse().then(x => {
    if (x.argv.help) {
      console.log(x.output)
      return
    }
    if (x.details.args.length == 0 || x.details.args.join("").match(/show|more|showmore/) != null) {
      let wim
      try {
        wim = new WorkitemManager()
      } catch(e) {
        console.log(x.output)
        return
      }
      let logs = wim.show()
      let top = (x.argv._.filter(x => x == "more").length > 0) ? 9999 : 3
      const dirfilter = x.argv._.filter(x => wim.config.directories.filter(y => x == y).length > 0);
      if (dirfilter.length) {
        logs = logs.filter(l => dirfilter.filter(y => y == l.stage).length > 0)
        top = 9999
      }
      logs.forEach((l, j) => {
        console.log(chalk`{bgBlue.yellow ${l.stage}}`)
        l.items.slice(0, top).forEach((i, k) => {
          console.log(chalk`[${j}.${k}] {bold #${i.id}} {yellow ${i.description}}`)
        })
        let x = l.items.length - top
        if (x > 0)
        console.log(` +${x} more...`)
      })
      
      // show hints
      console.log()
      console.log(chalk`{bold hint:} the number in square brackets can reference work items,\nso:\n    workitem {bold 1.3} note "remember the important things"\nis the same as:\n    workitem {bold #3c4a09c} note "remember the important things"`)
    }
  })