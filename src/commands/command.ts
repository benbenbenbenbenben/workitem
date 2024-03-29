import { IRule, Tibu, Input, Result } from 'tibu';
import type { ILogger } from '../ILogger';
import type { IGit } from '../IGit';
import type { IHost } from '../IHost';
import chalk from 'chalk';
const { rule, token, either, all, many, optional } = Tibu;

export type ICommand = {
  parse(argsraw: string): boolean | any;
  run(argsraw: string, logger: ILogger): Promise<void>;
};

export type Example = {
  example: string;
  info: string;
  options: { label: string; description: string }[];
};

export abstract class Command {
  private static registry: {
    name: string;
    ctor: new (git: IGit, fs: IHost) => Command;
    help: string;
    explain: Example[];
  }[];
  public git: IGit;
  public fs: IHost;
  public constructor(git: IGit, fs: IHost) {
    this.git = git;
    this.fs = fs;
  }
  public abstract parse(argsraw: string): boolean | any;
  public abstract run(argsraw: string, logger: ILogger): Promise<void>;
  public static ws: IRule = rule(/\s*/);
  public static msg: IRule = rule(
    either(
      rule("'", token('msg', /[^']*/), "'"),
      rule('"', token('msg', /[^"]*/), '"'),
      rule(token('msg', /[^\s~+<>+\-@#][\w]*/))
    )
  );
  public static EOL: any = (input: Input): Result =>
    input.location === input.source.length
      ? Result.pass(input)
      : Result.fault(input);
  public static register<T extends Command>(
    c: new (git: IGit, fs: IHost) => T,
    help = '',
    explain: Example[] = []
  ): void {
    if (Command.registry === undefined) {
      Command.registry = [];
    }
    if (Command.registry.find((x) => x.name === c.name) === undefined) {
      Command.registry.push({
        name: c.name,
        ctor: c,
        help,
        explain
      });
    }
  }
  public static async run(
    git: IGit,
    fs: IHost,
    logger: ILogger,
    argsraw: string
  ): Promise<boolean> {
    let parseok = false;
    for (const reg of Command.registry) {
      const cmd = new reg.ctor(git, fs);
      if (cmd.parse(argsraw)) {
        parseok = true;
        await cmd.run(argsraw, logger);
        break;
      }
    }
    return parseok;
  }
  public static printhelp(logger: ILogger, command?: string): void {
    if (command) {
      const cmd = Command.registry.find(
        (c) => c.name.toLowerCase() === command.toLowerCase()
      );
      if (cmd) {
        cmd.explain.forEach((example) => {
          logger.log(
            chalk`{bgRgb(237, 237, 237).black example:} ${example.example}`
          );
          logger.log(chalk`         ${example.info}`);
          logger.log(
            chalk`{bgRgb(180, 180, 180).black options:} ${example.options
              .map(
                (o) =>
                  `${(o.label + '          ').substr(
                    0,
                    example.options
                      .map((o) => o.label.length + 1)
                      .reduce((a, b) => (a > b ? a : b))
                  )}: ${o.description}`
              )
              .join('\n         ')}`
          );
        });
      }
    } else {
      for (const reg of Command.registry) {
        logger.log(
          chalk`{bgGreen.white ${reg.name.toLowerCase()}}\t${reg.help}`
        );
      }
    }
  }
}
