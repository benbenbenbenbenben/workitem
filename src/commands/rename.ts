import { Tibu } from 'tibu';
const { parse, rule, token } = Tibu;
import { WorkitemManager } from '../WorkitemManager';
import { Command } from './command';
import type { IHost } from '../IHost';
import type { ILogger } from '../ILogger';
import type { IGit } from '../IGit';
import { ErrorCodes } from '../ErrorCodes';
import chalk from 'chalk';

export class Rename extends Command {
  public async run(argsraw: string, logger: ILogger): Promise<void> {
    const result = this.parse(argsraw);
    const wim = new WorkitemManager(this.git, this.fs);
    if (result === false) {
      logger.fail(
        ErrorCodes.UnknownCommand,
        chalk`{bgGreen.white add} could not proceed`
      );
    }
    wim.rename(result.item, result.newname);
  }
  public constructor(git: IGit, fs: IHost) {
    super(git, fs);
  }
  public parse(argsraw: string) {
    const rename = token('rename', 'rename');
    const item = token('item', /((\d+\.)+(\d+))|(#?([a-f0-9]{3,7}))/i);

    let result: any = false;
    parse(argsraw)(
      rule(
        rename,
        Command.ws,
        item,
        Command.ws,
        Command.msg,
        Command.EOL
      ).yields((r) => {
        result = {
          item: r.one('item')?.value,
          newname: r.one('msg')?.value
        };
      })
    );

    return result;
  }
}

Command.register(Rename, 'renames a workitem', [
  {
    example: 'rename <item> "new name"',
    info: 'renames an item',
    options: [
      {
        label: 'item',
        description: 'the item id or index, e.g; #f08472a or 1.1'
      }
    ]
  }
]);
