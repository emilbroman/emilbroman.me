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

        case "$":
          expressions.push(this.#parseVariable());
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

    const variables: ShellScript.VariableTerm[] = [];
    const literals: string[] = [];
    let accumulator = "";
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

      if (quoteContext != null || /[\w.,@\-_\/=]/.test(this.#script[0])) {
        sawNothing = false;
        accumulator += this.#script[0];
        this.#script = this.#script.slice(1);
        continue;
      }

      if (quoteContext !== "'" && this.#script[0] === "$") {
        literals.push(accumulator);
        accumulator = "";
        variables.push(this.#parseVariable());
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

    literals.push(accumulator);

    return new ShellScript.StringTerm(literals, variables);
  }

  #parseVariable(): ShellScript.VariableTerm {
    if (this.#script[0] !== "$") {
      throw new Error("shell: expected `$`");
    }
    this.#script = this.#script.slice(1);
    let name = "";
    while (this.#script.length > 0 && /[\w_]/.test(this.#script[0])) {
      name += this.#script[0];
      this.#script = this.#script.slice(1);
    }
    if (name === "") {
      throw new Error("shell: expected variable name");
    }
    return new ShellScript.VariableTerm(name);
  }
}
