import { Tibu } from 'tibu';
const { parse, rule, token } = Tibu;
import { WorkitemManager } from '../WorkitemManager';
import { Command } from './command';
import type { IHost } from '../IHost';
import type { ILogger } from '../ILogger';
import type { IGit } from '../IGit';
import { ErrorCodes } from '../ErrorCodes';
import chalk from 'chalk';

export class Note extends Command {
  public async run(argsRaw: string, logger: ILogger): Promise<void> {
    const result = this.parse(argsRaw);
    const wim = new WorkitemManager(this.git, this.fs);
    if (result === false) {
      logger.fail(
        ErrorCodes.UnknownCommand,
        chalk`{bgGreen.white note} could not proceed`
      );
    }
    const who = await this.git.getWho();
    const workitem = await wim.idToWorkitem(result.item);
    if (!workitem.success) {
      logger.fail(ErrorCodes.UnknownIdentifier, workitem.error!);
    }
    wim.comment(result.item, result.comment, who);
    logger.log(chalk`{bgGreen.white note}`);
    logger.log(
      chalk`{bgBlue.white.bold ${wim.workitemToStage(workitem.value.id)} #${
        workitem.value.id
      }} ${workitem.value.description}`
    );
    logger.log(
      chalk`{yellow added comment:} ${result.comment} {yellow ${who}}`
    );
  }
  public constructor(git: IGit, fs: IHost) {
    super(git, fs);
  }
  public parse(argsraw: string) {
    const move = token('note', 'note');
    const item = token('item', /((\d+\.)+(\d+))|(#?([a-f0-9]{3,7}))/i);

    let result: any = false;
    parse(argsraw)(
      rule(move, Command.ws, item, Command.ws, Command.msg, Command.EOL).yields(
        (r) => {
          result = {
            item: r.one('item')?.value,
            comment: r.one('msg')?.value
          };
        }
      )
    );

    return result;
  }
}
Command.register(Note, 'adds commentary to a work item', [
  {
    example: 'note <item> "new note"',
    info: 'adds a new commentary note to an item',
    options: [
      {
        label: 'item',
        description: 'the item id or index, e.g; #f08472a or 1.1'
      }
    ]
  }
]);
