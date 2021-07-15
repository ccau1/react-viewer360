import * as THREE from 'three';
import { Position2D, Position3D, View360Point } from './types';

const minPolarAngle = 0;
const maxPolarAngle = Math.PI;
const PI_2 = Math.PI / 2;
export const rotateByAxis2D = (
  axis2D: Position2D,
  quaternion: THREE.Quaternion,
  speed: number = 0.001
) => {
  const euler = new THREE.Euler(0, 0, 0, 'YXZ');
  euler.setFromQuaternion(quaternion);

  euler.y += axis2D.x * speed;
  euler.x += axis2D.y * speed;

  euler.x = Math.max(
    PI_2 - maxPolarAngle,
    Math.min(PI_2 - minPolarAngle, euler.x)
  );

  return euler;
};

export const positionEquals = (p1: Position3D, p2: Position3D) => {
  return p1.x === p2.x && p1.y === p2.y && p1.z === p2.z;
};

export const distance = (p1: Position2D, p2: Position2D) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export const getPosition = (point: View360Point): Position3D => {
  return Array.isArray(point)
    ? { x: point[0], y: point[1], z: point[2] }
    : point;
};

export const distanceVector = (
  v1: Position3D | THREE.Vector3,
  v2: Position3D | THREE.Vector3
) => {
  var dx = v1.x - v2.x;
  var dy = v1.y - v2.y;
  var dz = v1.z - v2.z;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

export const toScreenPosition = (
  obj: THREE.Object3D,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer
) => {
  var vector = new THREE.Vector3();

  var widthHalf = 0.5 * renderer.getContext().canvas.width;
  var heightHalf = 0.5 * renderer.getContext().canvas.height;

  obj.updateMatrixWorld();
  vector.setFromMatrixPosition(obj.matrixWorld);
  vector.project(camera);

  vector.x = vector.x * widthHalf + widthHalf;
  vector.y = -(vector.y * heightHalf) + heightHalf;

  return {
    x: vector.x,
    y: vector.y,
  };
};

const rayCaster = new THREE.Raycaster();
let intersections: THREE.Intersection[] = [];

export const raycastIntersection = (
  position: Position2D,
  dimensions: { width: number; height: number },
  camera: THREE.Camera,
  objects: THREE.Object3D[]
) => {
  const x = (position.x / dimensions.width) * 2 - 1;
  const y = -(position.y / dimensions.height) * 2 + 1;
  rayCaster.setFromCamera({ x: x, y: y }, camera);
  intersections = rayCaster.intersectObjects(objects, true);
  return intersections;
};
