export default class GraphQLNearImage {
  private certainty?: number;
  private distance?: number;
  private image?: string;
  private imageBlob: any;
  private source: any;

  constructor(nearImageObj: any) {
    this.source = nearImageObj;
  }

  toString(wrap = true) {
    this.parse();
    this.validate();

    let args: any[] = [];

    if (this.image) {
      let img = this.image
      if (img.startsWith('data:')) {
        const base64part = ';base64,';
        img = img.substring(img.indexOf(base64part) + base64part.length)
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
      return `${args.join(",")}`;
    }
    return `{${args.join(",")}}`;
  }

  validate() {
    if (!this.image && !this.imageBlob) {
      throw new Error("nearImage filter: image or imageBlob must be present");
    }
  }

  parse() {
    for (let key in this.source) {
      switch (key) {
        case "image":
          this.parseImage(this.source[key]);
          break;
        case "certainty":
          this.parseCertainty(this.source[key]);
          break;
        case "distance":
          this.parseDistance(this.source[key]);
          break;
        default:
          throw new Error("nearImage filter: unrecognized key '" + key + "'");
      }
    }
  }

  parseImage(image: string) {
    if (typeof image !== "string") {
      throw new Error("nearImage filter: image must be a string");
    }

    this.image = image;
  }

  parseCertainty(cert: number) {
    if (typeof cert !== "number") {
      throw new Error("nearImage filter: certainty must be a number");
    }

    this.certainty = cert;
  }

  parseDistance(dist: number) {
    if (typeof dist !== "number") {
      throw new Error("nearImage filter: distance must be a number");
    }

    this.distance = dist;
  }
}
