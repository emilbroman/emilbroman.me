import { Command, Environment } from "../Commands/Command";
import { Color } from "../Display/Display";

export namespace ShellScript {
  export class Script {
    constructor(readonly statements: Statement[]) {}

    async execute(env: Environment, commands: Map<string, Command>) {
      for (const statement of this.statements) {
        await statement.execute(env, commands);
      }
    }
  }

  export class Statement {
    constructor(readonly expressions: Expression[]) {}

    async execute(env: Environment, commands: Map<string, Command>) {
      const [commandName, ...args] = this.expressions.flatMap((e) =>
        e.expand()
      );
      const command = commands.get(commandName);
      if (command == null) {
        env.display.write([
          {
            color: Color.Red,
          },
          `command not found: ${commandName}`,
          {
            color: Color.White,
          },
        ]);
        env.display.breakLine();
      } else {
        await command.execute(env, ...args);
      }
    }
  }

  export type Expression = Term;

  export type Term = StringTerm;

  export class StringTerm {
    constructor(readonly string: string) {}

    expand(): string[] {
      return [this.string];
    }
  }
}
