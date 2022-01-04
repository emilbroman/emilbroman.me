import { ShellScript } from "./ShellScript";

export class ShellScriptParser {
  #script: string;

  constructor(script: string) {
    this.#script = script;
  }

  parse(): ShellScript.Script {
    const statements: ShellScript.Statement[] = [];
    while (this.#script.length > 0) {
      statements.push(this.#parseStatement());
    }
    return new ShellScript.Script(statements);
  }

  #parseStatement(): ShellScript.Statement {
    const expressions: ShellScript.Expression[] = [];
    expressions: while (true) {
      switch (this.#script[0]) {
        case undefined:
          break expressions;

        case ";":
          this.#script = this.#script.slice(1);
          break expressions;

        case " ":
        case "\t":
          this.#script = this.#script.slice(1);
          break;

        default:
          expressions.push(this.#parseExpression());
          break;
      }
    }
    return new ShellScript.Statement(expressions);
  }

  #parseExpression(): ShellScript.Expression {
    return this.#parseTerm();
  }

  #parseTerm(): ShellScript.Term {
    return this.#parseString();
  }

  #parseString(): ShellScript.StringTerm {
    let quoteContext: '"' | "'" | undefined;

    let sawNothing = true;

    let result = "";
    while (true) {
      if (this.#script.length === 0) {
        break;
      }

      if (quoteContext != null && this.#script[0] === quoteContext) {
        sawNothing = false;
        quoteContext = undefined;
        this.#script = this.#script.slice(1);
        continue;
      }

      if (
        quoteContext == null &&
        (this.#script[0] === "'" || this.#script[0] === '"')
      ) {
        sawNothing = false;
        quoteContext = this.#script[0];
        this.#script = this.#script.slice(1);
        continue;
      }

      if (quoteContext != null || /[\w.,@\-_]/.test(this.#script[0])) {
        sawNothing = false;
        result += this.#script[0];
        this.#script = this.#script.slice(1);
        continue;
      }

      break;
    }

    if (sawNothing) {
      throw new Error("shell: expected term");
    }

    if (quoteContext != null) {
      throw new Error(`shell: expected closing ${quoteContext}`);
    }

    return new ShellScript.StringTerm(result);
  }
}
