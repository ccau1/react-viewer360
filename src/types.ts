export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Position2D {
  x: number;
  y: number;
}

export type View360Point = Position3D | [number, number, number];

export interface Marker {
  point: View360Point;
  content: string | React.ReactNode;
  lineTo?: View360Point;
  sprite?: string;
  spriteScale?: number;
}

export interface Viewer360Position {
  point: View360Point;
  img: string;
  label?: string | React.ReactNode;
  markers?: Marker[];
  sprite?: string;
  spriteScale?: number;
}

export interface Viewer360Props {
  positions?: Viewer360Position[];
  img?: string;
  markers?: Marker[];
  dragSpeed?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  initialCameraRotation?: Position3D;
  pointMarkerSprite?: string;
  markerSprite?: string;
  pointMarkerSpriteScale?: number;
  markerSpriteScale?: number;
  styles?: Viewer360Styles;
  hideLabels?: boolean;
  enableZoom?: boolean;
}

export interface Viewer360Styles {
  container?: React.CSSProperties;
  pointMarkerLabel?: React.CSSProperties;
  pointMarkerLabelHover?: React.CSSProperties;
  pointMarkerLabelContent?: React.CSSProperties;
  markerLabel?: React.CSSProperties;
  markerLabelHover?: React.CSSProperties;
  markerLabelContent?: React.CSSProperties;
}
