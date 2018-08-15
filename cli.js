#!/usr/bin/env node
const chalk = require('chalk')
const fs = require('fs')
const { WorkitemManager } = require('./WorkitemManager')
const isworkitemdirectory = fs.existsSync("./.workitem")

require('sywac')
  .usage(chalk.bgRed.white.bold("workitem 1.0.0"))
  .command(require('./init'))
  .command(require('./commands/add'))
  .command(require('./commands/move'))
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
    console.log(chalk`{bgRed.white.bold workitem 1.0.0}`)
    if (x.argv._.length == 0 || (x.argv._.filter(x => x == "show"))) {
      const wim = new WorkitemManager()
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