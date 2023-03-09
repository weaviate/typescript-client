export default class GraphQLNearText {
  constructor(nearTextObj) {
    this.source = nearTextObj;
  }

  toString(wrap = true) {
    this.parse();
    this.validate();

    let args = [`concepts:${JSON.stringify(this.concepts)}`]; // concepts must always be set

    if (this.certainty) {
      args = [...args, `certainty:${this.certainty}`];
    }

    if (this.distance) {
      args = [...args, `distance:${this.distance}`];
    }

    if (this.moveTo) {
      let moveToArgs = []
      if (this.moveToConcepts) {
        moveToArgs = [...moveToArgs, `concepts:${JSON.stringify(this.moveToConcepts)}`];
      }
      if (this.moveToObjects) {
        moveToArgs = [...moveToArgs, `objects:${this.moveToObjects}`];
      }
      if (this.moveToForce) {
        moveToArgs = [...moveToArgs, `force:${this.moveToForce}`];
      }
      args = [...args, `moveTo:{${moveToArgs.join(",")}}`];
    }

    if (this.moveAwayFrom) {
      let moveAwayFromArgs = [];
      if (this.moveAwayFromConcepts) {
        moveAwayFromArgs = [...moveAwayFromArgs, `concepts:${JSON.stringify(this.moveAwayFromConcepts)}`];
      }
      if (this.moveAwayFromObjects) {
        moveAwayFromArgs = [...moveAwayFromArgs, `objects:${this.moveAwayFromObjects}`];
      }
      if (this.moveAwayFromForce) {
        moveAwayFromArgs = [
          ...moveAwayFromArgs,
          `force:${this.moveAwayFromForce}`,
        ];
      }
      args = [...args, `moveAwayFrom:{${moveAwayFromArgs.join(",")}}`];
    }

    if (this.autocorrect !== undefined) {
      args = [...args, `autocorrect:${this.autocorrect}`];
    }

    if (!wrap) {
      return `${args.join(",")}`;
    }
    return `{${args.join(",")}}`;
  }

  validate() {
    if (!this.concepts) {
      throw new Error("nearText filter: concepts cannot be empty");
    }

    if (this.moveTo) {
      if (!this.moveToForce || (!this.moveToConcepts && !this.moveToObjects)) {
        throw new Error(
          "nearText filter: moveTo must have fields 'concepts' or 'objects' and 'force'"
        );
      }
    }

    if (this.moveAwayFrom) {
      if (!this.moveAwayFromForce || (!this.moveAwayFromConcepts && !this.moveAwayFromObjects)) {
        throw new Error(
          "nearText filter: moveAwayFrom must have fields 'concepts' or 'objects' and 'force'"
        );
      }
    }
  }

  parse() {
    for (let key in this.source) {
      switch (key) {
        case "concepts":
          this.parseConcepts(this.source[key]);
          break;
        case "certainty":
          this.parseCertainty(this.source[key]);
          break;
        case "distance":
          this.parseDistance(this.source[key]);
          break;
        case "moveTo":
          this.parseMoveTo(this.source[key]);
          break;
        case "moveAwayFrom":
          this.parseMoveAwayFrom(this.source[key]);
          break;
        case "autocorrect":
          this.parseAutocorrect(this.source[key]);
          break;
        default:
          throw new Error("nearText filter: unrecognized key '" + key + "'");
      }
    }
  }

  parseConcepts(concepts) {
    if (!Array.isArray(concepts)) {
      throw new Error("nearText filter: concepts must be an array");
    }

    this.concepts = concepts;
  }

  parseCertainty(cert) {
    if (typeof cert !== "number") {
      throw new Error("nearText filter: certainty must be a number");
    }

    this.certainty = cert;
  }

  parseDistance(dist) {
    if (typeof dist !== "number") {
      throw new Error("nearText filter: distance must be a number");
    }

    this.distance = dist;
  }

  parseMoveTo(target) {
    if (typeof target !== "object") {
      throw new Error("nearText filter: moveTo must be object");
    }

    if (!target.concepts && !target.objects) {
      throw new Error("nearText filter: moveTo.concepts or moveTo.objects must be present");
    }

    if (target.concepts && !Array.isArray(target.concepts)) {
      throw new Error("nearText filter: moveTo.concepts must be an array");
    }

    if (target.objects && !Array.isArray(target.objects)) {
      throw new Error("nearText filter: moveTo.objects must be an array");
    }

    if (target.force && typeof target.force != "number") {
      throw new Error("nearText filter: moveTo.force must be a number");
    }

    this.moveTo = true;
    this.moveToConcepts = target.concepts;
    this.moveToForce = target.force;
    if (target.objects) {
      this.moveToObjects = this.parseMoveObjects("moveTo", target.objects);
    }
  }

  parseMoveAwayFrom(target) {
    if (typeof target !== "object") {
      throw new Error("nearText filter: moveAwayFrom must be object");
    }

    if (!target.concepts && !target.objects) {
      throw new Error("nearText filter: moveAwayFrom.concepts or moveAwayFrom.objects must be present");
    }

    if (target.concepts && !Array.isArray(target.concepts)) {
      throw new Error(
        "nearText filter: moveAwayFrom.concepts must be an array"
      );
    }

    if (target.objects && !Array.isArray(target.objects)) {
      throw new Error("nearText filter: moveAwayFrom.objects must be an array");
    }

    if (target.force && typeof target.force != "number") {
      throw new Error("nearText filter: moveAwayFrom.force must be a number");
    }

    this.moveAwayFrom = true;
    this.moveAwayFromConcepts = target.concepts;
    this.moveAwayFromForce = target.force;
    if (target.objects) {
      this.moveAwayFromObjects = this.parseMoveObjects("moveAwayFrom", target.objects);
    }
  }

  parseAutocorrect(autocorrect) {
    if (typeof autocorrect !== "boolean") {
      throw new Error("nearText filter: autocorrect must be a boolean");
    }

    this.autocorrect = autocorrect;
  }

  parseMoveObjects(move, objects) {
    let moveObjects = [];
    let errors = [];
    for (var i in objects) {
      if (!objects[i].id && !objects[i].beacon) {
        errors.push(`${move}.objects[${i}].id or ${move}.objects[${i}].beacon must be present`)
      } else if (objects[i].id && typeof objects[i].id !== "string") {
        errors.push(`${move}.objects[${i}].id must be string`)
      } else if (objects[i].beacon && typeof objects[i].beacon !== "string") {
        errors.push(`${move}.objects[${i}].beacon must be string`)
      } else {
        var objs = []
        if (objects[i].id) {
          objs.push(`id:"${objects[i].id}"`);
        }
        if (objects[i].beacon) {
          objs.push(`beacon:"${objects[i].beacon}"`);
        }
        moveObjects.push(`{${objs.join(",")}}`)
      }
    }
    if (errors.length > 0) {
      throw new Error(`nearText filter: ${errors.join(", ")}`);
    }
    return `[${moveObjects.join(",")}]`
  }
}
