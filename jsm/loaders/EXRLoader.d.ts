import {
    LoadingManager,
    DataTextureLoader,
    TextureDataType,
    PixelFormat
} from '../../../src/Three';

export interface EXR {
    header: object;
    width: number;
    height: number;
    data: Float32Array;
    format: PixelFormat;
    type: TextureDataType;
}

export class EXRLoader extends DataTextureLoader {
    constructor(manager?: LoadingManager);

    _parser(buffer: ArrayBuffer): EXR;
}
