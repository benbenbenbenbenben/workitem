import { Tibu } from 'tibu';
const { parse, rule, optional, token } = Tibu;
import { Command } from './command';
import type { ILogger } from '../ILogger';
import type { IGit } from '../IGit';
import type { IHost } from '../IHost';

export class Collate extends Command {
  public async run(argsraw: string, logger: ILogger): Promise<void> {
    throw new Error('Method not implemented.');
  }
  public constructor(git: IGit, fs: IHost) {
    super(git, fs);
  }
  public parse(argsraw: string): boolean | any {
    const collate = token('collate', 'collate');
    const auto = token('auto', 'auto');

    let result: any = false;
    parse(argsraw)(
      rule(collate, optional(Command.ws, auto), Command.EOL).yields((r) => {
        result = {
          collate: true,
          auto: r.one('auto')?.value === 'auto'
        };
      })
    );
  }
}
Command.register(Collate, 'collates workitems across local branches', [
  {
    example: 'collate [auto]',
    info: 'collates all work items together in the current branch',
    options: [
      {
        label: 'auto',
        description:
          "doesn't prompt for user interaction and assumes default options"
      }
    ]
  }
]);
