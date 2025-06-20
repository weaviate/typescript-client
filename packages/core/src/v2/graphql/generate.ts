export interface GenerateArgs {
  groupedTask?: string;
  groupedProperties?: string[];
  singlePrompt?: string;
}

export interface GenerateParts {
  singleResult?: string;
  groupedResult?: string;
  results: string[];
}

export class GraphQLGenerate {
  private groupedTask?: string;
  private groupedProperties?: string[];
  private singlePrompt?: string;

  constructor(args: GenerateArgs) {
    this.groupedTask = args.groupedTask;
    this.groupedProperties = args.groupedProperties;
    this.singlePrompt = args.singlePrompt;
  }

  toString(): string {
    this.validate();

    let str = 'generate(';
    const results = ['error'];
    if (this.singlePrompt) {
      str += `singleResult:{prompt:"${this.singlePrompt.replace(/[\n\r]+/g, '')}"}`;
      results.push('singleResult');
    }
    if (this.groupedTask || (this.groupedProperties !== undefined && this.groupedProperties.length > 0)) {
      const args: string[] = [];
      if (this.groupedTask) {
        args.push(`task:"${this.groupedTask.replace(/[\n\r]+/g, '')}"`);
      }
      if (this.groupedProperties !== undefined && this.groupedProperties.length > 0) {
        args.push(`properties:${JSON.stringify(this.groupedProperties)}`);
      }
      str += `groupedResult:{${args.join(',')}}`;
      results.push('groupedResult');
    }
    str += `){${results.join(' ')}}`;
    return str;
  }

  private validate() {
    if (!this.groupedTask && !this.singlePrompt) {
      throw new Error('must provide at least one of `singlePrompt` or `groupTask`');
    }
    if (this.groupedTask !== undefined && this.groupedTask == '') {
      throw new Error('groupedTask must not be empty');
    }
    if (this.singlePrompt !== undefined && this.singlePrompt == '') {
      throw new Error('singlePrompt must not be empty');
    }
  }
}
