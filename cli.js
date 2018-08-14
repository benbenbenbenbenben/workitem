#!/usr/bin/env node

const chalk = require('chalk')
require('sywac')
  .usage(chalk.bgRed.white.bold("workitem 1.0.0"))
  .command(require('./init'))
  .help().showHelpByDefault()
  .style({
    flags: s => chalk.bgGreen.white(s),
    desc: s => chalk.white(s),
    hints: s => chalk.dim(s)
  })
  .parseAndExit()