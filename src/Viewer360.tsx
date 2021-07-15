import React, { useEffect, useRef } from 'react';
import { useState } from 'react';
import { View360Manager } from './View360Manager';
import eventVars from './eventVars';
import { Viewer360Props } from './types';

const Viewer360 = ({
  positions,
  img,
  markers,
  dragSpeed = 1,
  autoRotate,
  autoRotateSpeed = 1,
  initialCameraRotation,
  pointMarkerSprite = 'https://img.icons8.com/plasticine/2x/marker.png',
  markerSprite = 'http://www.telestream.net/wirecast-go/images/icon_512x512-2x.png',
  pointMarkerSpriteScale,
  markerSpriteScale,
  styles,
  hideLabels,
}: Viewer360Props) => {
  const divRef = useRef<HTMLDivElement>(null);
  const instantiated = useRef(false);
  const view360ManagerRef = useRef<View360Manager | undefined>();
  const view360Manager: View360Manager | undefined = view360ManagerRef.current;

  useEffect(() => {
    view360ManagerRef.current = new View360Manager();
  }, []);

  // @ts-ignore
  const [_lastUpdate, forceUpdate] = useState(new Date());

  // attach renderer to dom and instantiate
  useEffect(() => {
    if (instantiated.current || !divRef.current || !view360Manager?.renderer)
      return;
    instantiated.current = true;

    divRef.current.appendChild(view360Manager.renderer.domElement);

    !view360Manager.isDrawing && view360Manager.startDrawing();
    view360Manager.moveToPointByIndex(view360Manager.activeIndex, 0);
    view360Manager.events.addListener(eventVars.ON_LABELS_CHANGE, () => {
      forceUpdate(new Date());
    });
    initialCameraRotation &&
      view360Manager.camera.rotation.set(
        initialCameraRotation.x,
        initialCameraRotation.y,
        initialCameraRotation.z
      );
  }, [divRef.current, view360Manager, instantiated.current]);

  // update styles
  useEffect(() => {
    if (!view360Manager) return;
    view360Manager.styles = styles || {};
  }, [view360Manager, styles]);

  // update size
  useEffect(() => {
    if (!divRef.current) return;
    const resizeHandler = () => {
      if (!view360Manager || !divRef.current) return;
      view360Manager.setSize(
        divRef.current.offsetWidth,
        divRef.current.offsetHeight
      );
    };
    resizeHandler();
    window.addEventListener('resize', resizeHandler);
    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, [divRef.current, view360Manager]);

  // update settings
  useEffect(() => {
    if (!view360Manager) return;
    view360Manager.enableAutoRotate = !!autoRotate;
    view360Manager.autoRotateSpeed = autoRotateSpeed;
  }, [view360Manager, autoRotate, autoRotateSpeed]);

  // set points whenever positions/img changes
  useEffect(() => {
    view360Manager?.setPoints(
      img
        ? [{ point: { x: 0, y: 0, z: 0 }, img, markers: markers || [] }]
        : positions || []
    );
    forceUpdate(new Date());
  }, [positions, img, markers, view360Manager]);

  // update sprites
  useEffect(() => {
    if (!view360Manager) return;
    view360Manager.markerSpriteScale = markerSpriteScale;
    view360Manager.pointMarkerSpriteScale = pointMarkerSpriteScale;
    view360Manager.pointMarkerSprite = pointMarkerSprite;
    view360Manager.markerSprite = markerSprite;
  }, [
    pointMarkerSprite,
    markerSprite,
    pointMarkerSpriteScale,
    markerSpriteScale,
  ]);

  // set mouse interaction
  useEffect(() => {
    if (!divRef.current || !view360Manager) return;

    // Handle mouse movement
    let restartAutoRotateTimeout: NodeJS.Timeout | null = null;
    divRef.current.onwheel = (ev) => {
      view360Manager.setFOVDelta(ev.deltaY * 0.05);
    };

    // divRef.current.ondblclick = () => {
    // };

    divRef.current.onmousedown = () => {
      // mouseDownPos
      restartAutoRotateTimeout && clearTimeout(restartAutoRotateTimeout);
      view360Manager.shouldAutoRotate = false;

      const dragGesture = (ev: MouseEvent) => {
        view360Manager.moveCamera2DDelta({
          x: ev.movementX * dragSpeed,
          y: ev.movementY * dragSpeed,
        });
      };

      divRef.current?.addEventListener('mousemove', dragGesture);
      document.addEventListener('mouseup', () => {
        divRef.current?.removeEventListener('mousemove', dragGesture);
        restartAutoRotateTimeout && clearTimeout(restartAutoRotateTimeout);
        restartAutoRotateTimeout = setTimeout(() => {
          view360Manager.shouldAutoRotate = !!autoRotate;
        }, 1000);
      });
    };
  }, [divRef.current, view360Manager, autoRotate, dragSpeed]);

  return (
    <div
      ref={divRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        userSelect: 'none',
        ...styles?.container,
      }}
    >
      {!hideLabels && view360Manager?.labels}
    </div>
  );
};

export default Viewer360;
