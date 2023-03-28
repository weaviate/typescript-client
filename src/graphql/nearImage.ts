export interface NearImageArgs {
  certainty?: number;
  distance?: number;
  image?: string;
}

export default class GraphQLNearImage {
  private certainty?: number;
  private distance?: number;
  private image?: string;

  constructor(args: NearImageArgs) {
    this.certainty = args.certainty;
    this.distance = args.distance;
    this.image = args.image;
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
