# React-Viewer360

<p align="center" width="100%">
  <img width="75%" src="https://github.com/ccau1/react-viewer360/blob/master/example/sample1.gif">
</p>

This is a 360 viewer library inspired by google map's navigation. Using points for each 360 image, the 360 images are placed in a 3D world using XYZ coordinates and the POV travels to each position in transition.

## Why

- Transitions to other 360 images as though flying to it
- Each 360 image can hold their own markers
- Each marker can customize sprite, content (with html support) and line from marker to a position (can be used to illustrate pointing to an item)

<!-- > This TSDX setup is meant for developing React component libraries (not apps!) that can be published to NPM. If you’re looking to build a React-based app, you should use `create-react-app`, `razzle`, `nextjs`, `gatsby`, or `react-static`.

> If you’re new to TypeScript and React, checkout [this handy cheatsheet](https://github.com/sw-yx/react-typescript-cheatsheet/) -->

## Installation

```bash
npm install react-viewer360 # or yarn add react-viewer360
```

## Usage

Display one 360 image

```bash
import Viewer360 from "react-viewer360";

export const App = () => {
  return (
    <Viewer360
      img="./360_1.jpg"
    />
  )
}
```

Display one 360 image with markers

```bash
import Viewer360 from "react-viewer360";
import "react-viewer360/dist/viewer360.css";

export const App = () => {
  return (
    <Viewer360
      img="./360_1.jpg"
      markers={[
        {
          point: [2, 0, 3],
          content: (
            <div>
              An apple product
              <a href="www.apple.com">Apple Store</a>
            </div>
          )
        }
      ]}
    />
  )
}
```

Display multiple 360 images with markers

```bash
import Viewer360 from "react-viewer360";
import "react-viewer360/dist/viewer360.css";

export const App = () => {
  return (
    <Viewer360
      positions={[
        {
          point: { x: 0, y: 0, z: 0 },
          img: "./360_1.jpg",
          label: "Bedroom",
          markers: [
            {
              point: [2, 0, 3],
              content: (
                <div>
                  An apple product
                  <a href="www.apple.com">Apple Store</a>
                </div>
              )
            }
          ]
        },
        {
          point: [1, 0, 0],
          img: './360_2.jpg',
          label: 'Living Room',
          sprite: './sprite_1.png',
        },
        {
          point: [3, 0, 3],
          img: './360_3.jpg',
          label: 'Kitchen',
        },
      ]}
    />
  )
}
```

## Options

| Prop                   | Type                | Default | Description                                                                          |
| ---------------------- | ------------------- | ------- | ------------------------------------------------------------------------------------ |
| positions              | Viewer360Position[] | []      | Positions of each 360, along with each 360's settings such as its markers and sprite |
| img                    | string              |         | A 360 image. Use this if only displaying one image ever                              |
| markers                | Marker[]            | []      | A list of markers for the singular img (only applies to img prop)                    |
| dragSpeed              | number              | 1       | The speed when mouse drag screen (ev.movementX \* dragSpeed)                         |
| autoRotate             | boolean             | false   | Flag for whether screen will auto rotate                                             |
| autoRotateSpeed        | number              | 1       | If autoRotate true, the speed it'll move per frame                                   |
| initialCameraRotation  | View360Point        |         | The initial camera rotation (using XYZ) on first load                                |
| pointMarkerSprite      | string              |         | A marker image to indicate next travel point                                         |
| markerSprite           | string              |         | A marker image indicating a marker position                                          |
| pointMarkerSpriteScale | number              | 0.2     | Scale the point marker image                                                         |
| markerSpriteScale      | number              | 0.15    | Scale the marker image                                                               |
| styles                 | Viewer360Styles     | {}      | Styles for each part of the dom layer                                                |
| hideLabels             | boolean             | false   | Hide all labels (both markers and points)                                            |

## Structures

### Viewer360Position

```typescript
point: View360Point;
img: string;
label?: string | React.ReactNode;
markers?: Marker[];
sprite?: string;
spriteScale?: number;
```

### Marker

```typescript
point: View360Point;
content: string | React.ReactNode;
lineTo?: View360Point;
sprite?: string;
spriteScale?: string;
```

### View360Point

```typescript
{ x: number; y: number; z: number } | [ number, number, number ]
```

### Viewer360Styles

```typescript
container?: React.CSSProperties;
pointMarkerLabel?: React.CSSProperties;
pointMarkerLabelHover?: React.CSSProperties;
pointMarkerLabelContent?: React.CSSProperties;
markerLabel?: React.CSSProperties;
markerLabelHover?: React.CSSProperties;
markerLabelContent?: React.CSSProperties;
```

## Styling

Classes to override
| ClassName | Position |
| --------- | -------- |
| .viewer_360_marker_label | Marker's label |
| .viewer_360_marker_label_content | Marker's label content |
| .360_marker_label_hover | Marker's label hover area |
| .viewer_360_point_marker_label | Position's label |
| .viewer_360_point_marker_label_content | Position's label content |
| .viewer_360_point_marker_label_hover | Position's label hover area |

## TODO

---

- [x] Define sprite scales
- [x] Add js styling
- [ ] Define customized transitions

---
