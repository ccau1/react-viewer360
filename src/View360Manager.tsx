import React from 'react';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import {
  distanceVector,
  getPosition,
  positionEquals,
  raycastIntersection,
  rotateByAxis2D,
  toScreenPosition,
} from './utils';
import Events from './Events';
import eventVars from './eventVars';
import {
  Viewer360Position,
  Viewer360Styles,
  Marker,
  View360Point,
  Position3D,
  Position2D,
} from './types';

export class View360Manager {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    75,
    1,
    0.1,
    1000
  );
  width: number = 0;
  height: number = 0;
  points: Viewer360Position[] = [];
  pointMeshes: Array<{
    sphere: THREE.Mesh | null;
    pointMarker: THREE.Sprite | null;
    markers: THREE.Sprite[];
  }> = [];
  _pointLabels: React.ReactNode[] = [];
  activeIndex: number = 0;
  sphereRadius = 5;
  markerRadius = 0.1;
  isNavigating = false;
  shouldAutoRotate = true;
  autoRotateSpeed = 1;
  isDrawing = false;
  _markerLabels: React.ReactNode[] = [];
  events: Events = new Events();
  createdAt: Date = new Date();
  _pointMarkerSprite: string =
    'https://img.icons8.com/plasticine/2x/marker.png';
  _markerSprite: string =
    'http://www.telestream.net/wirecast-go/images/icon_512x512-2x.png';
  pointMarkerSpriteSize: number = 35;
  markerSpriteSize: number = 40;
  pointMarkerSpriteScale?: number;
  markerSpriteScale?: number;
  styles: Viewer360Styles = {};

  constructor(opts?: { webgl?: THREE.WebGLRenderer }) {
    this.renderer = opts?.webgl || new THREE.WebGLRenderer();
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
    this.scene.add(hemisphereLight);
    const directionalLight = new THREE.DirectionalLight(0xff0000, 1);
    directionalLight.position.set(100, 100, 100);
    this.scene.add(directionalLight);
  }

  get labels() {
    return [...this._pointLabels, ...this._markerLabels];
  }

  get pointLabels() {
    return this._pointLabels;
  }

  get markerLabels() {
    return this._markerLabels;
  }

  get markerSprite() {
    return this._markerSprite;
  }

  get pointMarkerSprite() {
    return this._pointMarkerSprite;
  }

  set markerSprite(sprite: string) {
    if (this._markerSprite === sprite) return;
    this._markerSprite = sprite;
    this.setMarkers();
  }

  set pointMarkerSprite(sprite: string) {
    if (this._pointMarkerSprite === sprite) return;
    this._pointMarkerSprite = sprite;
    this.points.forEach((p, pIndex) => {
      this.addPointMarkerByIndex(pIndex, p);
    });
  }

  draw() {
    requestAnimationFrame((time) => {
      if (this.shouldAutoRotate) {
        const newEuler = rotateByAxis2D(
          { x: 1, y: 0 },
          this.camera.quaternion,
          0.001 * this.autoRotateSpeed
        );
        this.camera.quaternion.setFromEuler(newEuler);
        this.updatePointMarkerLabelPositions();
        this.updateMarkerLabelPositions();
      }
      TWEEN.update(time);
      this.renderer.render(this.scene, this.camera);
      if (this.isDrawing) this.draw();
    });
  }

  startDrawing() {
    this.isDrawing = true;
    this.draw();
  }

  stopDrawing() {
    this.isDrawing = false;
  }

  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  isPointEqual(p1: Viewer360Position, p2: Viewer360Position) {
    return (
      p1 &&
      p2 &&
      p1.img === p2.img &&
      positionEquals(getPosition(p1.point), getPosition(p2.point))
    );
  }

  moveToPointByIndex(index: number, duration: number = 1000) {
    this.isNavigating = true;
    if (!this.points[index]) return;

    // helper variables
    const point = getPosition(this.points[index].point);
    const originalPoint = getPosition(this.camera.position);
    const distance = distanceVector(point, originalPoint);
    const delta = {
      x: point.x - originalPoint.x,
      y: point.y - originalPoint.y,
      z: point.z - originalPoint.z,
    };

    // hide markers
    this.points.forEach((_pos, pIndex) => {
      if (this.pointMeshes[pIndex].pointMarker) {
        this.pointMeshes[pIndex].pointMarker!.visible = false;
      }
      const label = document.getElementById(`360_point_marker_label_${pIndex}`);
      if (label) label.style.display = 'none';
    });

    // if duration is 0, short circuit the animation
    // and just set the result
    if (duration === 0) {
      this.points.forEach((point, pointIndex) => {
        if (!this.pointMeshes[index].sphere) return;
        if (index === pointIndex) {
          (this.pointMeshes[index].sphere!
            .material as THREE.MeshBasicMaterial).opacity = 1;
          const position = getPosition(point.point);
          this.pointMeshes[index].sphere!.position.set(
            position.x,
            position.y,
            position.z
          );
          this.pointMeshes[index].sphere!.scale.set(1, 1, 1);
          this.camera.position.set(position.x, position.y, position.z);
          this.camera.updateProjectionMatrix();
        } else {
          (this.pointMeshes[pointIndex].sphere!
            .material as THREE.MeshBasicMaterial).opacity = 0;

          this.pointMeshes[pointIndex].sphere!.position.set(
            -1000,
            -1000,
            -1000
          );
          this.pointMeshes[pointIndex].sphere!.scale.set(1, 1, 1);
        }
      });
    } else {
      // handle stretch and fade out of prev index
      (this.pointMeshes[this.activeIndex].sphere!
        .material as THREE.MeshBasicMaterial).transparent = true;
      new TWEEN.Tween({ opacity: 1, position: { ...originalPoint }, scale: 1 })
        .to(
          {
            opacity: 0.2,
            position: {
              x: originalPoint.x - delta.x * 4,
              y: originalPoint.y - delta.y * 4,
              z: originalPoint.z - delta.z * 4,
            },
            scale: distance,
          },
          duration
        )
        .onUpdate(({ opacity, position, scale }) => {
          (this.pointMeshes[this.activeIndex].sphere!
            .material as THREE.MeshBasicMaterial).opacity = opacity;
          this.pointMeshes[this.activeIndex].sphere!.position.set(
            position.x,
            position.y,
            position.z
          );
          this.pointMeshes[this.activeIndex].sphere!.scale.set(
            scale,
            scale,
            scale
          );
        })
        .onComplete(() => {
          this.pointMeshes[this.activeIndex].sphere!.position.set(
            -1000,
            -1000,
            -1000
          );
          this.pointMeshes[this.activeIndex].sphere!.scale.set(1, 1, 1);
          (this.pointMeshes[this.activeIndex].sphere!
            .material as THREE.MeshBasicMaterial).transparent = false;
        })
        .start();

      // position new index item to camera + small delta closer to target
      // move new target to its position
      new TWEEN.Tween({
        opacity: 0.3,
        position: {
          x: point.x + delta.x * 2,
          y: point.y + delta.y * 2,
          z: point.z + delta.z * 2,
        },
        scale: distance,
      })
        .to({ opacity: 1, position: point, scale: 1 }, duration)
        .onUpdate(({ opacity, position, scale }) => {
          (this.pointMeshes[index].sphere!
            .material as THREE.MeshBasicMaterial).opacity = opacity;
          this.pointMeshes[index].sphere!.position.set(
            position.x,
            position.y,
            position.z
          );
          this.pointMeshes[index].sphere!.scale.set(scale, scale, scale);
        })
        .start();

      // move camera to new position
      new TWEEN.Tween(this.camera.position)
        .to(point, duration)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate((val) => {
          this.camera.position.set(val.x, val.y, val.z);

          this.camera.updateProjectionMatrix();
        })
        .start();
    }

    // set current active position index to new one
    setTimeout(() => {
      // reposition markers all around camera
      this.points.forEach((pos, pIndex) => {
        if (this.pointMeshes[pIndex].pointMarker === null) return;
        if (pIndex === index) {
          this.pointMeshes[pIndex].pointMarker!.visible = false;
          return;
        }
        const thisPoint = getPosition(pos.point);
        const distanceFromCamera =
          distanceVector(this.camera.position, thisPoint) || 0.0001;
        const scale = (this.sphereRadius * 0.9) / distanceFromCamera;

        this.pointMeshes[pIndex].pointMarker!.position.set(
          point.x + (thisPoint.x - point.x) * scale,
          point.y + (thisPoint.y - point.y) * scale,
          point.z + (thisPoint.z - point.z) * scale
        );
        this.pointMeshes[pIndex].pointMarker!.lookAt(this.camera.position);
        this.pointMeshes[pIndex].pointMarker!.visible = true;
        this.pointMeshes[pIndex].pointMarker!.updateMatrixWorld();
      });
      // set index as current index
      this.activeIndex = index;
      // set markers
      this.setMarkers(this.points[this.activeIndex].markers || []);
      // update labels
      this.updatePointMarkerLabelPositions();
      // set isNavigating to false to allow clicking again
      this.isNavigating = false;
    }, duration + 100);
  }

  setPoints(points: Viewer360Position[]) {
    // remove elements from existing
    for (let i = this.points.length - 1; i >= 0; i--) {
      if (points.every((p) => !this.isPointEqual(p, this.points[i]))) {
        // new set of points doesn't contain this, remove it
        this.removePointByIndex(i);
      }
    }
    // go through each new point, and add or update them
    points.forEach((point, pIndex) => {
      const existingPointIndex = this.points.findIndex((p) =>
        this.isPointEqual(p, point)
      );
      if (existingPointIndex < 0) {
        // can't find existing, create it
        this.addPoint(point);
      } else {
        // has existing, update this
        this.points[existingPointIndex] = point;
      }
      this.activeIndex === pIndex && this.setMarkers();
      this.setLabelByIndex(existingPointIndex, point.label);
    });

    this.updatePointMarkerLabelPositions();
    this.updateMarkerLabelPositions();
    this.moveToPointByIndex(this.activeIndex, 0);
  }

  clearMarkers() {
    this.scene.remove(
      ...this.scene.children.filter((c) => /^marker_/.test(c.name))
    );
    this._markerLabels = [];
    this.events.dispatch(eventVars.ON_LABELS_CHANGE, { labels: [] });
  }

  setMarkers(markers: Marker[] = []) {
    // remove all previous markers
    this.clearMarkers();
    // add markers to scene
    this.pointMeshes[this.activeIndex].markers = [];
    for (const [mIndex, m] of markers.entries()) {
      const position = getPosition(m.point);

      m.lineTo &&
        this.setMarkerLine(position, m.lineTo, `marker_line_${mIndex}`);

      const map = new THREE.TextureLoader().load(m.sprite || this.markerSprite);
      const material = new THREE.SpriteMaterial({
        map: map,
        // sizeAttenuation: false,
      });

      const sprite = new THREE.Sprite(material);
      sprite.name = `marker_${mIndex}`;
      sprite.userData.isMarker = true;
      sprite.userData.index = mIndex;
      sprite.userData.markerType = 'marker';
      sprite.position.set(
        this.camera.position.x + position.x,
        this.camera.position.y + position.y,
        this.camera.position.z + position.z
      );
      sprite.scale.set(
        m.spriteScale || this.markerSpriteScale || 0.15,
        m.spriteScale || this.markerSpriteScale || 0.15,
        1
      );
      this.scene.add(sprite);

      this.pointMeshes[this.activeIndex].markers.push(sprite);

      this.setMarkerLabelByIndex(mIndex, m.content);
    }
    this.updateMarkerLabelPositions();
  }

  setMarkerLine(from: View360Point, to: View360Point, name: string) {
    const existingMarkerLine = this.scene.getObjectByName(name);
    existingMarkerLine && this.scene.remove(existingMarkerLine);

    const fromPos = getPosition(from);
    const toPos = getPosition(to);

    const material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 2,
    });

    const points = [];
    points.push(new THREE.Vector3(fromPos.x, fromPos.y, fromPos.z));
    points.push(new THREE.Vector3(toPos.x, toPos.y, toPos.z));

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const line = new THREE.Line(geometry, material);
    line.name = name;
    this.scene.add(line);
  }

  setLabelByIndex(index: number, label: string | React.ReactNode) {
    // create html label
    const labelDiv = React.createElement('div', {
      key: `360_point_marker_label_${index}`,
      id: `360_point_marker_label_${index}`,
      className: 'viewer_360_point_marker_label',
      style: {
        position: 'absolute',
        display: 'none',
        zIndex: 10,
        top: 0,
        left: 0,
        flexDirection: 'column',
        alignItems: 'center',
        transform: 'translate(-1000px, -1000px)',
        ...this.styles.pointMarkerLabel,
      },
      children: [
        React.createElement('a', {
          style: {
            width: this.pointMarkerSpriteSize,
            height: this.pointMarkerSpriteSize,
            cursor: 'pointer',
            ...this.styles.pointMarkerLabelHover,
          },
          key: `360_point_marker_label_${index}_hover`,
          className: 'viewer_360_point_marker_label_hover',
          onClick: () => this.moveToPointByIndex(index),
        }),
        typeof label === 'string' ? (
          <div
            style={{
              padding: 10,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              borderRadius: 10,
              color: 'white',
              cursor: 'pointer',
              ...this.styles.pointMarkerLabelContent,
            }}
            className="viewer_360_point_marker_label_content"
            key={`360_point_marker_label_${index}_content`}
            onClick={() => this.moveToPointByIndex(index)}
          >
            {label}
          </div>
        ) : (
          label
        ),
      ],
    });
    this._pointLabels[index] = labelDiv;
  }

  setMarkerLabelByIndex(index: number, label: string | React.ReactNode) {
    // create html label
    const labelDiv = React.createElement('div', {
      key: `360_marker_label_${index}`,
      id: `360_marker_label_${index}`,
      className: 'viewer_360_marker_label',
      style: {
        position: 'absolute',
        display: 'none',
        zIndex: 10,
        top: 0,
        left: 0,
        flexDirection: 'column',
        alignItems: 'center',
        transform: 'translate(-1000px, -1000px)',
        ...this.styles.markerLabel,
      },
      children: [
        React.createElement('div', {
          style: {
            width: this.markerSpriteSize,
            height: this.markerSpriteSize,
            cursor: 'pointer',
            ...this.styles.markerLabelHover,
          },
          key: `360_marker_label_${index}_hover`,
          className: '360_marker_label_hover',
        }),
        React.createElement('div', {
          className: 'viewer_360_marker_label_content',
          key: `360_marker_label_${index}_content`,
          style: {
            ...this.styles.markerLabelContent,
          },
          children:
            typeof label === 'string' ? (
              <div
                style={{
                  padding: 10,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  borderRadius: 10,
                  color: 'white',
                }}
              >
                {label}
              </div>
            ) : (
              label
            ),
        }),
      ],
    });
    this._markerLabels[index] = labelDiv;
    this.events.dispatch(eventVars.ON_LABELS_CHANGE, {
      labels: this._markerLabels,
    });
  }

  addImageSphere(index: number, img: string, _point: Position3D) {
    // create geometry
    const sphereGeometry = new THREE.SphereGeometry(this.sphereRadius, 60, 40);
    sphereGeometry.scale(-1, 1, 1);

    // create texture
    const loader = new THREE.TextureLoader();
    const texture = loader.load(img);

    const sphereMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      // transparent: true,
      blending: THREE.NormalBlending,
      // depthFunc: THREE.NeverDepth,
      depthWrite: false,
    });

    // create sphere
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.name = `img_sphere_${index}`;

    sphere.position.set(-1000, -1000, -1000);

    // add scene
    this.scene.add(sphere);

    // add to point meshes
    if (!this.pointMeshes[index])
      this.pointMeshes[index] = {
        pointMarker: null,
        markers: [],
        sphere: null,
      };
    this.pointMeshes[index].sphere = sphere;
  }

  updatePointMarkerLabelPositions() {
    let isMissingWidths = false;
    this.pointMeshes.forEach((pos, pIndex) => {
      const label = document.getElementById(`360_point_marker_label_${pIndex}`);
      if (!label) return;
      if (pIndex === this.activeIndex) {
        label.style.display = 'none';
        return;
      }
      const frustum = new THREE.Frustum();
      frustum.setFromProjectionMatrix(
        new THREE.Matrix4().multiplyMatrices(
          this.camera.projectionMatrix,
          this.camera.matrixWorldInverse
        )
      );

      if (!pos.pointMarker) return;

      const screenPos = toScreenPosition(
        pos.pointMarker,
        this.camera,
        this.renderer
      );

      // if out of bound, skip this
      if (
        label &&
        frustum.containsPoint(pos.pointMarker.position) &&
        screenPos.x < this.width &&
        screenPos.x > 0 &&
        screenPos.y < this.height &&
        screenPos.y > 0
      ) {
        // if we have label width, set to user data,
        // else flag missing widths true
        if (label.offsetWidth > 0)
          pos.pointMarker.userData.width = label.offsetWidth;
        else isMissingWidths = true;

        // inside screen, draw label
        label.style.transform = `translate(${
          screenPos.x -
          (label.offsetWidth || pos.pointMarker.userData.width) / 2
        }px, ${screenPos.y - this.markerSpriteSize / 2}px)`;

        // label.style.left = `${screenPos.x - label.offsetWidth / 2}px`;
        // timeout so label doesn't flash in old position
        if (label.style.display !== 'flex')
          setTimeout(() => (label.style.display = 'flex'), 100);
      } else {
        // outside screen, hide it
        label.style.display = 'none';
      }
    });
    if (isMissingWidths)
      setTimeout(() => this.updatePointMarkerLabelPositions(), 100);
  }

  updateMarkerLabelPositions() {
    let isMissingWidths = false;
    (this.pointMeshes[this.activeIndex].markers as THREE.Sprite[])?.forEach(
      (marker, mIndex) => {
        const label = document.getElementById(`360_marker_label_${mIndex}`);
        if (!label) return;
        const frustum = new THREE.Frustum();
        frustum.setFromProjectionMatrix(
          new THREE.Matrix4().multiplyMatrices(
            this.camera.projectionMatrix,
            this.camera.matrixWorldInverse
          )
        );

        const screenPos = toScreenPosition(marker, this.camera, this.renderer);

        // if out of bound, skip this
        if (
          label &&
          frustum.containsPoint(marker.position) &&
          screenPos.x < this.width &&
          screenPos.x > 0 &&
          screenPos.y < this.height &&
          screenPos.y > 0
        ) {
          // if we have label width, set to user data,
          // else flag missing widths true
          if (label.offsetWidth > 0) marker.userData.width = label.offsetWidth;
          else isMissingWidths = true;

          // inside screen, draw label
          label.style.transform = `translate(${
            screenPos.x -
            (label.offsetWidth || marker.userData.width || 100) / 2
          }px, ${screenPos.y - this.pointMarkerSpriteSize / 2}px)`;
          // timeout so label doesn't flash in old position
          if (label.style.display !== 'flex')
            setTimeout(() => (label.style.display = 'flex'), 100);
        } else {
          // outside screen, hide it
          label.style.display = 'none';
        }
      }
    );

    if (isMissingWidths)
      setTimeout(() => this.updateMarkerLabelPositions(), 100);
  }

  setFOVDelta(deltaFOV: number) {
    this.camera.fov += deltaFOV;
    if (this.camera.fov > 120) this.camera.fov = 120;
    if (this.camera.fov < 10) this.camera.fov = 10;
    this.camera.updateProjectionMatrix();
    this.updatePointMarkerLabelPositions();
    this.updateMarkerLabelPositions();
  }

  moveCamera2DDelta(delta: Position2D, speed: number = 1) {
    const newEuler = rotateByAxis2D(
      { x: delta.x, y: delta.y },
      this.camera.quaternion,
      speed * 0.001
    );
    this.camera.quaternion.setFromEuler(newEuler);

    // update labels
    this.updatePointMarkerLabelPositions();
    this.updateMarkerLabelPositions();
  }

  getRaycastIntersection(position: Position2D) {
    return raycastIntersection(
      position,
      { width: this.width, height: this.height },
      this.camera,
      this.scene.children
    );
  }

  addPoint(point: Viewer360Position, index?: number) {
    const idx = index || this.points.length;
    const position = getPosition(point.point);
    // add point marker
    this.addPointMarkerByIndex(idx, point);
    // add markers
    this.setMarkers(point.markers);
    // add sphere
    this.addImageSphere(idx, point.img, position);
    // add label
    this.setLabelByIndex(idx, point.label);
    // add point to list
    this.points[idx] = point;
  }

  addPointMarkerByIndex(index: number, point: Viewer360Position) {
    const position = getPosition(point.point);

    const map = new THREE.TextureLoader().load(
      point.sprite || this.pointMarkerSprite
    );
    const material = new THREE.SpriteMaterial({
      map: map,
      // sizeAttenuation: false,
    });

    const sprite = new THREE.Sprite(material);
    sprite.name = `point_marker_${index}`;
    sprite.userData.isMarker = true;
    sprite.userData.markerType = 'point';
    sprite.userData.index = index;
    sprite.scale.set(
      point.spriteScale || this.pointMarkerSpriteScale || 0.2,
      point.spriteScale || this.pointMarkerSpriteScale || 0.2,
      1
    );
    sprite.position.set(position.x, position.y, position.z);
    this.scene.add(sprite);

    if (!this.pointMeshes[index])
      this.pointMeshes[index] = {
        pointMarker: null,
        markers: [],
        sphere: null,
      };
    this.pointMeshes[index].pointMarker = sprite;
  }

  removePointByIndex(index: number) {
    // remove meshes
    this.scene.remove(
      this.pointMeshes[index].sphere as THREE.Mesh,
      this.pointMeshes[index].pointMarker as THREE.Sprite
    );
    // remove label
    delete this._pointLabels[index];
    // remove point
    delete this.points[index];
  }

  onDrag() {}
}
