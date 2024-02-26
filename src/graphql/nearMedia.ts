export interface NearMediaBase {
  certainty?: number;
  distance?: number;
  targetVectors?: string[];
}
export interface NearMediaArgs extends NearMediaBase {
  media: string;
  type: NearMediaType;
}
export interface NearImageArgs extends NearMediaBase {
  image: string;
}
export interface NearAudioArgs extends NearMediaBase {
  audio: string;
}
export interface NearVideoArgs extends NearMediaBase {
  video: string;
}
export interface NearThermalArgs extends NearMediaBase {
  thermal: string;
}
export interface NearDepthArgs extends NearMediaBase {
  depth: string;
}
export interface NearIMUArgs extends NearMediaBase {
  imu: string;
}

export enum NearMediaType {
  Image = 'Image',
  Audio = 'Audio',
  Video = 'Video',
  Thermal = 'Thermal',
  Depth = 'Depth',
  IMU = 'IMU',
}

export default class GraphQLNearMedia {
  private certainty?: number;
  private distance?: number;
  private media: string;
  private type: NearMediaType;
  private targetVectors?: string[];

  constructor(args: NearMediaArgs) {
    this.certainty = args.certainty;
    this.distance = args.distance;
    this.media = args.media;
    this.type = args.type;
    this.targetVectors = args.targetVectors;
  }

  toString(wrap = true) {
    let args: string[] = [];

    if (this.media.startsWith('data:')) {
      const base64part = ';base64,';
      this.media = this.media.substring(this.media.indexOf(base64part) + base64part.length);
    }
    args = [...args, `${this.type.toLowerCase()}:${JSON.stringify(this.media)}`];

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
}
