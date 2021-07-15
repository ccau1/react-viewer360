import React from 'react';
import { Meta, Story } from '@storybook/react';
import Viewer360 from '../src';
import { Viewer360Position, Viewer360Props } from '../src/Viewer360';
import '!style-loader!css-loader!../src/viewer360.css';

const meta: Meta = {
  title: 'Welcome',
  component: Viewer360,
  argTypes: {
    children: {
      control: {
        type: 'text',
      },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const Template: Story<Viewer360Props> = (args) => <Viewer360 {...args} />;

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

const positions: Viewer360Position[] = [
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
            <p className="text-white">A cool Item</p>
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
            <p className="text-white">A cool Item</p>
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
];

Default.args = {
  positions,
  autoRotate: false,
  dragSpeed: 0.5,
  style: { height: 700 },
};
