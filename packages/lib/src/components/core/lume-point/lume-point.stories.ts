import { computed } from 'vue';

import { Colors } from '@/utils/constants';

import LumePoint from './lume-point.vue';

export default {
  title: 'Core/Point',
  component: LumePoint,
  argTypes: {
    x: { control: { type: 'number', step: 10 } },
    y: { control: { type: 'number', step: 10 } },
    color: {
      control: 'select',
      options: Object.keys(Colors),
      description: 'Point color.',
    },
    radius: { control: 'number' },
  },
  args: {
    x: 150,
    y: 150,
    color: 'Darkteal',
    radius: 4,
  },
};

const Template = ({ args }) => ({
  components: { LumePoint },
  setup() {
    const computedColor = computed(() => Colors[args.color]);

    return { args, computedColor };
  },
  template: `
    <svg width="300" height="300">
      <lume-point v-bind="args" :color="computedColor" active />
    </svg>
  `,
});

export const Basic = Template.bind({});
