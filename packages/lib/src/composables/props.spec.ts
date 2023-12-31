import { mount } from '@vue/test-utils';

import { withChartProps } from './props';

import { DataValidator } from '@/composables/base';

const getMixin = (dataValidator?: DataValidator) => {
  let mixin = null;
  mount({
    template: '<div></div>',
    setup() {
      mixin = withChartProps(dataValidator);
      return mixin;
    },
  });

  return mixin;
};

describe('props.ts', () => {
  test('should return expected object', () => {
    const mixin = getMixin();

    expect(mixin).toHaveProperty('data');
    expect(mixin.data).toHaveProperty('required');
    expect(mixin.data.required).toBe(true);
    expect(mixin.data).toHaveProperty('type');
    expect(mixin.data.type).toEqual(Array);
    expect(mixin.data).toHaveProperty('validator');
    expect(mixin.data.validator).toEqual(undefined);

    expect(mixin).toHaveProperty('labels');
    expect(mixin.labels).toHaveProperty('type');
    expect(mixin.labels.type).toEqual(Array);
    expect(mixin.labels).toHaveProperty('default');
    expect(mixin.labels.default).toBe(undefined);

    expect(mixin).toHaveProperty('options');
    expect(mixin.options).toHaveProperty('default');
    expect(mixin.options.default()).toEqual({});
    expect(mixin.options).toHaveProperty('type');
    expect(mixin.options.type).toEqual(Object);

    expect(mixin).toHaveProperty('orientation');
    expect(mixin.orientation).toHaveProperty('default');
    expect(mixin.orientation.default).toBe('vertical');
    expect(mixin.orientation).toHaveProperty('type');
    expect(mixin.orientation.type).toEqual(String);
    expect(mixin.orientation).toHaveProperty('validator');
    expect(mixin.orientation.validator('vertical')).toBe(true);
    expect(mixin.orientation.validator('horizontal')).toBe(true);
    expect(mixin.orientation.validator('nonsense')).toBe(false);

    expect(mixin).toHaveProperty('title');
    expect(mixin.title).toHaveProperty('default');
    expect(mixin.title.default).toBe(null);
    expect(mixin.title).toHaveProperty('type');
    expect(mixin.title.type).toEqual(String);

    expect(mixin).toHaveProperty('xScale');
    expect(mixin.xScale).toHaveProperty('default');
    expect(mixin.xScale.default).toBe(null);
    expect(mixin.xScale).toHaveProperty('type');
    expect(mixin.xScale.type).toEqual(Function);

    expect(mixin).toHaveProperty('yScale');
    expect(mixin.yScale).toHaveProperty('default');
    expect(mixin.yScale.default).toBe(null);
    expect(mixin.yScale).toHaveProperty('type');
    expect(mixin.yScale.type).toEqual(Function);
  });

  test('should return expected object with custom dataValidator', () => {
    const sampleString = 'sample-string';
    const dataValidator: DataValidator = (value) =>
      !!value && value.values[0] === sampleString;
    const mixin = getMixin(dataValidator);

    expect(mixin.data.validator).not.toEqual(undefined);
    expect(mixin.data.validator({ values: [sampleString] })).toEqual(true);
    expect(mixin.data.validator({ values: ['bogus'] })).toEqual(false);
  });
});
