import { Tibu } from 'tibu';
const { parse, rule, optional, either, token, all } = Tibu;
import { WorkitemManager } from '../WorkitemManager';
import { Command } from './command';
import type { IHost } from '../IHost';
import type { ILogger } from '../ILogger';
import type { IGit } from '../IGit';
import { ErrorCodes } from '../ErrorCodes';
import chalk from 'chalk';

export class Show extends Command {
  public async run(argsRaw: string, logger: ILogger): Promise<void> {
    const result = this.parse(argsRaw);
    const wim = new WorkitemManager(this.git, this.fs);
    if (result === false) {
      logger.fail(
        ErrorCodes.UnknownCommand,
        chalk`{bgGreen.white show} could not proceed`
      );
    } else if (wim.isInitialised()) {
      logger.log(chalk`{bgGreen.white show}`);
      if (result.item) {
        const itemSuccess = wim.idToWorkitem(result.item);
        if (!itemSuccess.success) {
          logger.fail(
            ErrorCodes.UnknownIdentifier,
            itemSuccess.error || 'missing error'
          );
        }
        const item: any = itemSuccess.value;
        if (item.type) {
          logger.log(
            chalk`{bgBlue.white.bold @${wim.workitemToStage(item.id)} #${
              item.id
            }} {bgYellow.bold ${item.type}} ${item.description}`
          );
        } else {
          logger.log(
            chalk`{bgBlue.white.bold @${wim.workitemToStage(item.id)} #${
              item.id
            }} ${item.description}`
          );
        }
        if (result.more) {
          // load linked stuff
          const comments = wim.getComments(item.id);
          if (comments.length) {
            logger.log(chalk`{bgBlack.yellowBright comments:}`);
            for (const comment of comments) {
              logger.log(
                chalk`${comment.content} {yellowBright.italic ${comment.who}}`
              );
            }
          }
        }
        if (item.tags) {
          logger.log();
          const tags = item.tags
            .map((t: string) => chalk`{bgWhite.black ${t}}`)
            .join(' ');
          logger.log(tags);
        }
        const footer = [];
        if (item.parent) {
          footer.push(chalk`child of: {bgBlue.white ${item.parent}}`);
        }
        if (item.child) {
          footer.push(
            `parent of: ${item.child
              .map((c: string) => chalk`{bgBlue.white ${c}}`)
              .join(' ')}`
          );
        }
        if (item.estimate) {
          footer.push(`est: ${item.estimate}`);
        }
        if (footer.length) {
          logger.log(footer.join('\n'));
        }
      } else {
        const logs = wim.show();
        const top = result.more || result.stage ? undefined : 3;
        logs.forEach((l, j) => {
          if (
            [null, undefined].includes(result.stage) ||
            l.stage === result.stage
          ) {
            logger.log(chalk`{bgBlueBright.yellowBright ${l.stage}}`);
            l.items.slice(0, top).forEach((i, k) => {
              logger.log(
                chalk`[${j.toString()}.${k.toString()}] {bold #${i.id}} ${
                  i.description
                }`
              );
            });
            if (top) {
              const x = l.items.length - top;
              if (x > 0) logger.log(` +${x} more...`);
            }
          }
        });
      }
    } else {
      logger.fail(
        ErrorCodes.NotInitialised,
        chalk`This directory is not a .workitem repository. Run workitem init to create a repository here.`
      );
    }
  }
  public constructor(git: IGit, fs: IHost) {
    super(git, fs);
  }
  public parse(argsRaw: string) {
    const show = token('show', 'show');
    const more = token('more', 'more');
    const item = token('item', /((\d+\.)+(\d+))|(#?([a-f0-9]{3,7}))/i);
    const stage = token('stage', /[\w_-]+/);

    let result: any = false;
    parse(argsRaw)(
      rule(
        optional(
          either(
            all(show, Command.ws, more),
            all(optional(show, Command.ws), '@', stage),
            show,
            more
          )
        ),
        optional(Command.ws, item),
        Command.EOL
      ).yields((r) => {
        result = {
          show: true,
          more: r.one('more')?.value === 'more',
          item: r.one('item')?.value,
          stage: r.one('stage')?.value
        };
      })
    );

    return result;
  }
}

Command.register(Show, '(default) shows the current workitems', [
  { example: 'show', info: 'show a truncated view of workitems', options: [] },
  { example: 'show more | more', info: 'shows all work items', options: [] },
  {
    example: 'show [more] <item>',
    info: 'shows an item in detail',
    options: [
      {
        label: 'more',
        description: 'includes more detail'
      },
      {
        label: 'item',
        description: 'the item id or index, e.g; #f08472a or 1.1'
      }
    ]
  }
]);
