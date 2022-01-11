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
      const [commandName, ...args] = this.expressions.map((e) => e.expand(env));
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

  export type Term = StringTerm | VariableTerm;

  export class StringTerm {
    constructor(
      readonly literals: string[],
      readonly variables: VariableTerm[]
    ) {
      if (literals.length !== variables.length + 1) {
        throw new Error(
          "invalid string term (interpolated variables don't match surrounding literals)"
        );
      }
    }

    expand(env: Environment): string {
      let result = this.literals[0];
      for (let i = 0; i < this.variables.length; i++) {
        result += this.variables[i].expand(env);
        result += this.literals[i + 1];
      }
      return result;
    }
  }

  export class VariableTerm {
    constructor(readonly name: string) {}

    expand(env: Environment): string {
      return env.variables.get(this.name) ?? "";
    }
  }
}
