import { Input, Result, Tibu } from 'tibu';
const { parse, rule, optional, many, either, token, all } = Tibu;
import { WorkitemManager } from '../WorkitemManager';
import { Command, ICommand, Example } from './command';
import { ErrorCodes } from '../ErrorCodes';
import chalk from 'chalk';
import { ILogger } from '../ILogger';
import { IGit } from '../IGit';
import { IHost } from '../IHost';

export class Add extends Command {
  public async run(argsRaw: string, logger: ILogger): Promise<void> {
    const result = this.parse(argsRaw);
    const wim = new WorkitemManager(this.git, this.fs);
    if (result === false) {
      logger.fail(
        ErrorCodes.UnknownCommand,
        chalk`{bgGreen.white add} could not proceed`
      );
    }
    if (result === true) {
      logger.fail(ErrorCodes.NotImplemented, chalk`wizard not implemented`);
    }
    const id = wim.add(result);
    logger.log(
      chalk`{bgGreen.white add} added {bold #${id}} ${result.description}`
    );
  }
  public constructor(git: IGit, fs: IHost) {
    super(git, fs);
  }
  public parse(argsRaw: string): boolean | any {
    const add = token('add', /^add/i);
    const type = token('type', /\w+/);
    const xats = rule(Command.ws, token('xats', /\@\w+/));
    const xtags = rule(Command.ws, token('xtags', /\#\w+/));
    const xest = rule(Command.ws, token('xest', /\~\w+/));
    const xplus = token('xplus', /\+\w+/);
    const xmin = token('xmin', /\-\w+/);
    const xbigger = rule(Command.ws, /\>\s*/, token('xbigger', /w+/));
    const xsmaller = rule(Command.ws, /\<\s*/, token('xsmaller', /\w+/));

    let result: any = false;
    parse(argsRaw)(
      rule(
        either(
          rule(
            add,
            Command.ws,
            either(all(type, Command.ws, Command.msg), Command.msg),
            many(xtags),
            optional(xats),
            optional(xest),
            optional(either(xbigger, xsmaller)),
            Command.EOL
          ).yields((r, c) => {
            result = {
              description: r.one('msg')?.value,
              tags: r.get('xtags')?.map(x => x.value),
              type: r.one('type')?.value,
              location: r.one('xats')?.value,
              estimate: r.one('xest')?.value,
              child: r.one('xbigger')?.value,
              parent: r.one('xsmaller')?.value
            };
          }),
          rule(add, Command.EOL).yields(() => {
            result = true;
          })
        )
      )
    );
    return result;
  }
}
Command.register(Add, 'adds a workitem', [
  {
    example:
      'add [type] "description of item" [#tag, ...] [@location] [~estimate] [> child] [< parent]',
    info: 'intialises a workitem repository in the current directory',
    options: [
      {
        label: 'type',
        description:
          'specifies an arbitrary workitem type e.g; task, story, defect'
      },
      { label: '#tag', description: 'adds a tag' },
      {
        label: '@location',
        description:
          'specifies the workitem will start in the specified non-default stage e.g; @doing'
      },
      {
        label: '~estimate',
        description:
          'specifies an arbitrary estimate for the workitem e.g; 10, 5pts, 2hrs, xxl'
      },
      {
        label: '> child',
        description:
          'specifies a child workitem where child is a workitem index or id'
      },
      {
        label: '< parent',
        description:
          'specifies a parent workitem where parent is a workitem index or id'
      }
    ]
  }
]);
