export interface NearTextArgs {
  autocorrect?: boolean;
  certainty?: number;
  concepts: string[];
  distance?: number;
  moveAwayFrom?: Move;
  moveTo?: Move;
}

export interface Move {
  objects?: MoveObject[];
  concepts?: string[];
  force?: number;
}

export interface MoveObject {
  beacon?: string;
  id?: string;
}

export default class GraphQLNearText {
  private autocorrect?: boolean;
  private certainty?: number;
  private concepts: string[];
  private distance?: number;
  private moveAwayFrom?: any;
  private moveTo?: any;

  constructor(args: NearTextArgs) {
    this.autocorrect = args.autocorrect;
    this.certainty = args.certainty;
    this.concepts = args.concepts;
    this.distance = args.distance;
    this.moveAwayFrom = args.moveAwayFrom;
    this.moveTo = args.moveTo;
  }

  toString(): string {
    this.validate();

    let args = [`concepts:${JSON.stringify(this.concepts)}`];

    if (this.certainty) {
      args = [...args, `certainty:${this.certainty}`];
    }

    if (this.distance) {
      args = [...args, `distance:${this.distance}`];
    }

    if (this.moveTo) {
      let moveToArgs: string[] = [];
      if (this.moveTo.concepts) {
        moveToArgs = [...moveToArgs, `concepts:${JSON.stringify(this.moveTo.concepts)}`];
      }
      if (this.moveTo.objects) {
        moveToArgs = [...moveToArgs, `objects:${this.parseMoveObjects('moveTo', this.moveTo.objects)}`];
      }
      if (this.moveTo.force) {
        moveToArgs = [...moveToArgs, `force:${this.moveTo.force}`];
      }
      args = [...args, `moveTo:{${moveToArgs.join(',')}}`];
    }

    if (this.moveAwayFrom) {
      let moveAwayFromArgs: string[] = [];
      if (this.moveAwayFrom.concepts) {
        moveAwayFromArgs = [...moveAwayFromArgs, `concepts:${JSON.stringify(this.moveAwayFrom.concepts)}`];
      }
      if (this.moveAwayFrom.objects) {
        moveAwayFromArgs = [
          ...moveAwayFromArgs,
          `objects:${this.parseMoveObjects('moveAwayFrom', this.moveAwayFrom.objects)}`,
        ];
      }
      if (this.moveAwayFrom.force) {
        moveAwayFromArgs = [...moveAwayFromArgs, `force:${this.moveAwayFrom.force}`];
      }
      args = [...args, `moveAwayFrom:{${moveAwayFromArgs.join(',')}}`];
    }

    if (this.autocorrect !== undefined) {
      args = [...args, `autocorrect:${this.autocorrect}`];
    }

    return `{${args.join(',')}}`;
  }

  validate() {
    if (this.moveTo) {
      if (!this.moveTo.concepts && !this.moveTo.objects) {
        throw new Error('nearText filter: moveTo.concepts or moveTo.objects must be present');
      }
      if (!this.moveTo.force || (!this.moveTo.concepts && !this.moveTo.objects)) {
        throw new Error("nearText filter: moveTo must have fields 'concepts' or 'objects' and 'force'");
      }
    }

    if (this.moveAwayFrom) {
      if (!this.moveAwayFrom.concepts && !this.moveAwayFrom.objects) {
        throw new Error('nearText filter: moveAwayFrom.concepts or moveAwayFrom.objects must be present');
      }
      if (!this.moveAwayFrom.force || (!this.moveAwayFrom.concepts && !this.moveAwayFrom.objects)) {
        throw new Error("nearText filter: moveAwayFrom must have fields 'concepts' or 'objects' and 'force'");
      }
    }
  }

  parseMoveObjects(move: MoveType, objects: MoveObject[]): string {
    const moveObjects: string[] = [];
    for (const i in objects) {
      if (!objects[i].id && !objects[i].beacon) {
        throw new Error(`nearText: ${move}.objects[${i}].id or ${move}.objects[${i}].beacon must be present`);
      }
      const objs = [];
      if (objects[i].id) {
        objs.push(`id:"${objects[i].id}"`);
      }
      if (objects[i].beacon) {
        objs.push(`beacon:"${objects[i].beacon}"`);
      }
      moveObjects.push(`{${objs.join(',')}}`);
    }
    return `[${moveObjects.join(',')}]`;
  }
}

type MoveType = 'moveTo' | 'moveAwayFrom';
