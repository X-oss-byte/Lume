import { computed } from 'vue';
import {
  COLOR_CLASS_MAP,
  withSizeArgs,
  withSizeArgTypes,
} from '@/docs/storybook-helpers';
import DATASETS from '@/docs/storybook-data/sparkline-data';

import LumeSparkline from './lume-sparkline-chart.vue';

import { options as defaultOptions } from './defaults';

export default {
  title: 'Charts/Sparkline chart',
  component: LumeSparkline,
  argTypes: {
    ...withSizeArgTypes(),
    data: {
      control: 'object',
      description: 'Chart data.',
    },
    labels: {
      control: 'object',
      description: 'Chart labels.',
    },
    options: {
      control: 'object',
      description: 'Chart/axes options.',
    },
    color: {
      control: 'select',
      options: Object.keys(COLOR_CLASS_MAP),
      description: 'Line color',
    },
    areaColor: {
      control: 'select',
      options: Object.keys(COLOR_CLASS_MAP),
      description: 'Line color',
    },
  },
  args: {
    ...withSizeArgs(300, 80),
    options: defaultOptions,
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/r9fPqTXA4dlP6SIyfmGlDC/%F0%9F%8C%9D-Lume---Data-Visualization-Library?node-id=15%3A8141',
    },
  },
};

const Template = ({ args }) => {
  return {
    components: { LumeSparkline },
    setup() {
      const computedData = computed(() => {
        // eslint-disable-next-line no-undef
        const dataset = structuredClone(args.data); // Deep copy dataset array
        if (args.color) dataset[0].color = COLOR_CLASS_MAP[args.color];
        if (args.areaColor)
          dataset[0].areaColor = COLOR_CLASS_MAP[args.areaColor];
        return dataset;
      });

      return { args, computedData };
    },
    template: `
        <div :style="{ width: args.width + 'px', height: args.height + 'px' }">
            <lume-sparkline v-bind="args" :data="computedData" />
        </div>
    `,
  };
};

export const Basic = Template.bind({});
Basic.args = {
  ...DATASETS.Basic,
};

export const NegativeValues = Template.bind({});
NegativeValues.args = {
  ...DATASETS.NegativeValue,
};

export const NullValues = Template.bind({});
NullValues.args = {
  ...DATASETS.NullValues,
};
