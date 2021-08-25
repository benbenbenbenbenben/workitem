import { Input, Result, Tibu } from 'tibu';
const { parse, rule, optional, many, either, token } = Tibu;
import { WorkitemManager } from '../WorkitemManager';
import { Command, Example } from './command';
import { IHost } from '../IHost';
import { ILogger } from '../ILogger';
import { IGit } from '../IGit';
import { ErrorCodes } from '../ErrorCodes';
import chalk from 'chalk';

export class Move extends Command {
  public async run(argsraw: string, logger: ILogger): Promise<void> {
    const result = this.parse(argsraw);
    const wim = new WorkitemManager(this.git, this.fs);
    if (result === false) {
      logger.fail(
        ErrorCodes.UnknownCommand,
        chalk`{bgGreen.white move} could not proceed`
      );
    }
    const workitem = wim.idToWorkitem(result.item);
    if (!workitem.success) {
      logger.fail(ErrorCodes.UnknownIdentifier, workitem.error!);
    }
    const fromstage = wim.workitemToStage(workitem.value.id);
    const fullid = workitem.value.id;
    const moveresult: any = wim.move(result.item, result.stage, result.force);
    if (moveresult.success === false) {
      logger.fail(ErrorCodes.UnknownCommand, chalk`${moveresult.error}`);
    }
    logger.log(
      chalk`{bgGreen.white move} moved {bold #${fullid}} from {bold ${fromstage}} to {bold ${result.stage}}`
    );
  }
  public constructor(git: IGit, fs: IHost) {
    super(git, fs);
  }
  public parse(argsraw: string) {
    const move = token('move', 'move');
    const item = token('item', /((\d+\.)+(\d+))|(\#?([a-f0-9]{3,7}))/i);
    const stage = token('stage', /\w+/);
    const force = token('force', /\+force/);

    let result: any = false;
    parse(argsraw)(
      rule(
        move,
        Command.ws,
        item,
        Command.ws,
        optional(/to\s+/),
        stage,
        optional(/\s+/, force),
        Command.EOL
      ).yields((r, c) => {
        result = {
          item: r.one('item')?.value,
          stage: r.one('stage')?.value,
          force: r.one('force')?.value !== null
        };
      })
    );
    return result;
  }
}
Command.register(Move, 'moves a workitem', [
  {
    example: 'move <item> [to] <stage> [+force]',
    info: 'moves an item to another stage',
    options: [
      {
        label: 'item',
        description: 'the workitem id or index, e.g; #f08472a or 1.1'
      },
      {
        label: 'stage',
        description: 'the name of the stage to move the workitem to'
      },
      {
        label: '+force',
        description:
          'moves the workitem even when the move is not a valid transition'
      }
    ]
  }
]);
