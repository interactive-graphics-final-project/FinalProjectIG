import {
    LoadingManager,
    ShapePath,
    BufferGeometry,
    Vector3
} from '../../../src/Three';

export interface SVGResult {
    paths: ShapePath[];
    xml: XMLDocument;
}

export interface StrokeStyle {
    strokeColor: string;
    strokeWidth: number;
    strokeLineJoin: string;
    strokeLineCap: string;
    strokeMiterLimit: number;
}

export class SVGLoader {
    manager: LoadingManager;
    path: string;

    constructor(manager?: LoadingManager);

    static getStrokeStyle(width: number, color: string, opacity: number, lineJoin: string, lineCap: string, miterLimit: number): StrokeStyle;

    static pointsToStroke(points: Vector3[], style: StrokeStyle, arcDivisions: number, minDistance: number): BufferGeometry;

    static pointsToStrokeWithBuffers(points: Vector3[], style: StrokeStyle, arcDivisions: number, minDistance: number, vertices: number[], normals: number[], uvs: number[], vertexOffset: number): number;

    load(url: string, onLoad: (data: SVGResult) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;

    setPath(path: string): this;

    parse(text: string): SVGResult;
}
