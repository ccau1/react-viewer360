import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Viewer360 from '../src/Viewer360';
import { useState } from 'react';
import '../src/viewer360.css';
import { Viewer360Position } from '../src/types';

const Viewer360Page = () => {
  const [positions, setPositions] = useState<Viewer360Position[]>([
    {
      point: { x: 0, y: 0, z: 0 },
      img: 'https://c7.alamy.com/360/R90C9K/bedroom-R90C9K.jpg',
      label: 'Bedroom',
      markers: [
        {
          point: [2, 0, 3],
          content: (
            <div
              style={{
                padding: 10,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderRadius: 10,
              }}
            >
              <div className="text-white">A cool Item</div>
              <br />
              <a
                className="text-white underline"
                href="https://www.apple.com/hk/en/"
                target="_blank"
              >
                Click here to buy now
              </a>
            </div>
          ),
        },
        {
          point: [2, 0, -2],
          content: (
            <div
              style={{
                padding: 10,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderRadius: 10,
              }}
            >
              <div className="text-white">A cool Item</div>
              <br />
              <a
                className="text-white underline"
                href="https://www.apple.com/hk/en/"
                target="_blank"
              >
                Click here to buy now
              </a>
            </div>
          ),
          lineTo: [2.5, -0.2, -2],
          sprite:
            'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/i/a9415ff0-40cb-44e8-b941-f9e3563c4238/dacdsww-bcf47063-9278-4b5a-8f79-6ca1c0257118.png',
        },
      ],
    },
    {
      point: [1, 0, 0],
      img: 'https://l13.alamy.com/360/PN03X3/living-room-hdr-PN03X3.jpg',
      label: 'Living Room',
      sprite: 'https://image.flaticon.com/icons/png/512/1499/1499993.png',
    },
    {
      point: [3, 0, 3],
      img:
        'https://c7.alamy.com/360/2EAK5WN/360-degree-panorama-of-a-kitchen-showroom-with-modern-built-in-appliances-and-white-cabinets-on-display-in-a-furniture-store-2EAK5WN.jpg',
      label: 'Kitchen',
    },
  ]);

  // useEffect(() => {
  //   setTimeout(
  //     () =>
  //       setPositions([
  //         ...positions,
  //         {
  //           point: {
  //             x:
  //               (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 10),
  //             y: 0,
  //             z:
  //               (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 10),
  //           },
  //           img: "https://c7.alamy.com/360/R90C9K/bedroom-R90C9K.jpg",
  //           label: "Randomized " + positions.length,
  //         },
  //       ]),
  //     5000
  //   );
  // }, [positions]);
  return (
    <Viewer360
      autoRotate={true}
      positions={positions}
      dragSpeed={0.5}
      autoRotateSpeed={1}
      initialCameraRotation={{ x: 0, y: 180, z: 0 }}
      markerSprite="https://image.flaticon.com/icons/png/512/2101/2101266.png"
      pointMarkerSprite="https://cdn3.iconfinder.com/data/icons/one-piece-flat/48/Cartoons__Anime_One_Piece_Artboard_37-512.png"
      // hideLabels
    />
  );
};

export default Viewer360Page;

const App = () => {
  return <Viewer360Page />;
};

ReactDOM.render(<App />, document.getElementById('root'));
