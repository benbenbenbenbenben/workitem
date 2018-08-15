#!/usr/bin/env node
const chalk = require('chalk')
const fs = require('fs')

const isworkitemdirectory = fs.existsSync("./.workitem")

require('sywac')
  .usage(chalk.bgRed.white.bold("workitem 1.0.0"))
  .command(require('./init'))
  .command(require('./commands/add'))
  .help().showHelpByDefault(!isworkitemdirectory)
  .style({
    flags: s => chalk.bgGreen.white(s),
    desc: s => chalk.white(s),
    hints: s => chalk.dim(s)
  })
  .parse().then(x => {
    console.log(x.output)
  })