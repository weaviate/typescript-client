import { NearMediaBase } from './nearMedia';

export interface NearImageArgs extends NearMediaBase {
  image?: string;
  targetVectors?: string[];
}

export default class GraphQLNearImage {
  private certainty?: number;
  private distance?: number;
  private image?: string;
  private targetVectors?: string[];

  constructor(args: NearImageArgs) {
    this.certainty = args.certainty;
    this.distance = args.distance;
    this.image = args.image;
    this.targetVectors = args.targetVectors;
  }

  toString(wrap = true) {
    this.validate();

    let args: string[] = [];

    if (this.image) {
      let img = this.image;
      if (img.startsWith('data:')) {
        const base64part = ';base64,';
        img = img.substring(img.indexOf(base64part) + base64part.length);
      }
      args = [...args, `image:${JSON.stringify(img)}`];
    }

    if (this.certainty) {
      args = [...args, `certainty:${this.certainty}`];
    }

    if (this.distance) {
      args = [...args, `distance:${this.distance}`];
    }

    if (this.targetVectors && this.targetVectors.length > 0) {
      args = [...args, `targetVectors:${JSON.stringify(this.targetVectors)}`];
    }

    if (!wrap) {
      return `${args.join(',')}`;
    }
    return `{${args.join(',')}}`;
  }

  validate() {
    if (!this.image) {
      throw new Error('nearImage filter: image field must be present');
    }
  }
}
