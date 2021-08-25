import { Tibu } from 'tibu';
const { parse, rule, either, flat, token } = Tibu;
import { WorkitemManager } from '../WorkitemManager';
import { Command } from './command';
import type { IHost } from '../IHost';
import type { ILogger } from '../ILogger';
import type { IGit } from '../IGit';
import { ErrorCodes } from '../ErrorCodes';
import chalk from 'chalk';
import type { IWorkitem } from '../Workitem';

export class Search extends Command {
  public async run(argsRaw: string, logger: ILogger): Promise<void> {
    const result = this.parse(argsRaw);
    const wim = new WorkitemManager(this.git, this.fs);
    if (result === false) {
      logger.fail(
        ErrorCodes.UnknownCommand,
        chalk`{bgGreen.white search} could not proceed`
      );
    }
    logger.log(
      chalk`{bgGreen.white search} ${argsRaw.split(' ').slice(1).join(' ')}`
    );
    const items = wim.search(result);
    items.forEach((stage) => {
      logger.log(chalk`{bgBlueBright.yellowBright ${stage.stage}}`);
      if (stage.items.length > 0) {
        stage.items.forEach((item) => {
          logger.log(
            chalk`{white.bold #${item.id}} ${item.description} ` +
              (item.tags
                ? item.tags.map((tag) => chalk`{yellow ${tag}}`).join(' ')
                : '')
          );
        });
      } else {
        logger.log(chalk`{grey <no results>}`);
      }
    });
  }
  public constructor(git: IGit, fs: IHost) {
    super(git, fs);
  }
  public parse(argsRaw: string) {
    const wim = new WorkitemManager(this.git, this.fs);
    const search = token('search', /search|find|\?/);
    const operator = rule(
      either(
        rule(token('and', /and|&/)).yields(
          (_) =>
            (l: (i: IWorkitem) => boolean, r: (i: IWorkitem) => boolean) =>
            (item: IWorkitem) =>
              l(item) && r(item)
        ),
        rule(token('or', /or|\|/)).yields(
          (_) =>
            (l: (i: IWorkitem) => boolean, r: (i: IWorkitem) => boolean) =>
            (item: IWorkitem) =>
              l(item) || r(item)
        )
      )
    );
    const term = rule(
      either(
        rule(token('tag', /#[\w_-]+/i)).yields(
          (x) => (item: IWorkitem) =>
            item.tags && item.tags.find((tag) => tag === x.one('tag')?.value)
        ),
        rule(token('word', /[\w_-]+/i)).yields(
          (x) => (item: IWorkitem) =>
            (item.description &&
              item.description.indexOf(x.raw('word').raw.trim()) >= 0) ||
            wim
              .getComments(item.id)
              .find(
                (content) =>
                  content.content.indexOf(x.raw('word').raw.trim()) >= 0
              )
        )
      )
    );
    const query = rule(
      either(
        rule(term, Command.ws, operator, Command.ws, () => query).yields(
          (t, c) => {
            const [l, o, r] = flat(c);
            const f = o(l, r);
            //f.toString = () => o + "(" + l + ", " + r + ")"
            return f;
          }
        ),
        rule(term, Command.ws, () => query).yields((t, c) => {
          const [l, r] = flat(c);
          return (item: IWorkitem) => l(item) && r(item);
        }),
        rule(term)
      )
    );

    let result: any = false;
    parse(argsRaw)(
      rule(search, Command.ws, query, Command.EOL).yields((r, c) => {
        result = flat(c).filter((x) => x)[0];
      })
    );

    return result;
  }
}

Command.register(Search, 'searches a workitem', [
  {
    example: 'search #bug [and] #defect [and] word',
    info: 'searches for items with tag #bug and #defect and containing "word"',
    options: [
      { label: 'tag', description: 'a tag to search for' },
      { label: 'word', description: 'a word to search for' },
      {
        label: 'and',
        description:
          'forces left and right hand side to be found; e.g. search #bug [and] ui'
      },
      {
        label: 'or',
        description:
          'allows either left or right to be found; e.g. search crash or freeze'
      }
    ]
  }
]);
