import { Tibu } from 'tibu';
const { parse, rule, token } = Tibu;
import { WorkitemManager } from '../WorkitemManager';
import { Command } from './command';
import type { IHost } from '../IHost';
import type { ILogger } from '../ILogger';
import type { IGit } from '../IGit';
import { ErrorCodes } from '../ErrorCodes';
import chalk from 'chalk';

type TagArguments = {
  item: string;
  tag: string;
};

export class Tag extends Command {
  public async run(argsRaw: string, logger: ILogger): Promise<void> {
    const result = this.parse(argsRaw);
    const wim = new WorkitemManager(this.git, this.fs);
    if (!result) {
      return logger.fail(
        ErrorCodes.UnknownCommand,
        chalk`{bgGreen.white tag} could not proceed`
      );
    }
    const workitemSuccess = wim.idToWorkitem(result.item);
    if (!workitemSuccess.success) {
      logger.fail(
        ErrorCodes.UnknownIdentifier,
        workitemSuccess.error || 'missing error message'
      );
    }
    const workitem = workitemSuccess.value;
    wim.tag(result.item, result.tag);
    logger.log(
      chalk`{bgGreen.white tag} #${workitem.id} ${workitem.description} {yellow added} {bgWhite.black ${result.tag}}`
    );
  }
  public constructor(git: IGit, fs: IHost) {
    super(git, fs);
  }
  public parse(argsRaw: string): TagArguments | undefined {
    const tag = token('tag', 'tag');
    const item = token('item', /((\d+\.)+(\d+))|(#?([a-f0-9]{3,7}))/i);
    const thetag = token('thetag', /#[\w_][\w_-]+/i);
    // const rm = token("rm", "rm")

    let result: TagArguments | undefined = undefined;
    parse(argsRaw)(
      rule(tag, Command.ws, item, Command.ws, thetag, Command.EOL).yields(
        (r) => {
          const item = r.one('item')?.value;
          const thetag = r.one('thetag')?.value;
          if (item && thetag) {
            result = { item, tag: thetag };
          }
        }
      )
    );

    return result;
  }
}
Command.register(Tag, 'adds commentary to a work item', [
  {
    example: 'tag <item> "new tag"',
    info: 'adds a new commentary tag to an item',
    options: [
      {
        label: 'item',
        description: 'the item id or index, e.g; #f08472a or 1.1'
      }
    ]
  }
]);
