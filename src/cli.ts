import chalk from 'chalk';
import { Command } from './commands/command';
import type { ILogger } from './ILogger';
import { ErrorCodes } from './ErrorCodes';
import { Host } from './Host';
import { Git } from './Git';

class CLI implements ILogger {
  log(message: string | undefined = undefined): void {
    if (message) console.log(message);
    else console.log();
  }
  fail(err: number, message: string): void {
    if (err === ErrorCodes.NotInitialised) {
      this.log(chalk`\n{bgYellow warning} NotInitialised ${message}`);
      this.showHelp();
    } else {
      console.error(message);
    }
    process.exit(err);
  }
  showHelp(): void {
    this.log(`\n`);
    Command.printhelp(this);
    this.log();
    this.log(chalk`use {bgGreen help} [command] for specific help`);
    this.log();
  }
  explain(thisrule: any): any {
    const asarr: any[] = thisrule;
    return asarr
      .map((p) => {
        if (p.__token__) {
          if (p.__token__ === p.toString()) {
            return p.__token__;
          } else {
            return `${p.__token__}:${p.toString()}`;
          }
        } else {
          if (p.pattern) {
            switch (p.name) {
              case 'many':
                return `${this.explain(p.pattern)}*`;
              case 'optional':
                return `${this.explain(p.pattern)}?`;
            }
            return `${p.name}(${this.explain(p.pattern)})`;
          } else {
            return null;
          }
        }
      })
      .filter((x) => x)
      .join(' ');
  }
  public async run(argsRaw: string) {
    process.stdout.write(chalk`{bgRed.white.bold workitem 2.0.0} `);
    const fs = new Host();
    const git = new Git(fs);
    const currentBranch = await git.getCurrentBranch().catch(() => false);

    if (currentBranch === '__workitem__') {
      // TODO: when this happens it's likely to be that git didn't successfully switch back to the previous branch
      this.fail(
        ErrorCodes.WorkitemBranchDetected,
        chalk`workitem is in an invalid state because a previous command did complete correctly. Run {green workitem fix} to diagnose and fix the problem.`
      );
    }

    const commands = [
      'init',
      'show',
      'add',
      'note',
      'rename',
      'move',
      'collate',
      'search',
      'tag'
    ];

    for (const command of commands) {
      await import(`./commands/${command}`);
    }

    // short circuit for help
    if (/^(--help|-h|help|\/help|\/h)$/i.test(argsRaw)) {
      this.showHelp();
      process.exit();
    }
    if (/^(--help|-h|help|\/help|\/h)\s+(\w+)$/i.test(argsRaw)) {
      // this.log()
      this.log(
        chalk`{bgGreen help} {bold.hex('#cedaed') ${argsRaw.split(' ')[1]}}`
      );
      this.log();
      Command.printhelp(this, argsRaw.split(' ')[1]);
      process.exit();
    }

    const parseok = await Command.run(git, fs, this, argsRaw);

    if (parseok === false) {
      if (argsRaw.length) {
        this.fail(
          ErrorCodes.UnknownCommand,
          `Sorry, that command couldn't be understood`
        );
      } else {
        this.showHelp();
      }
    }
  }
}

new CLI()
  .run(
    process.argv
      .slice(2)
      .map((s) =>
        !s.includes(' ') ? s : ['"', s.replace(/"/g, '\\"'), '"'].join('')
      )
      .join(' ')
  )
  .then((x) => process.exit())
  .catch((x) => process.exit(ErrorCodes.UnknownError));
