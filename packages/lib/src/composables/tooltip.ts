import { computed, reactive, Ref, watch } from 'vue';

import { getXByIndex, Scale } from './scales';

import { NO_DATA, Orientation, ORIENTATIONS } from '@/utils/constants';
import { InternalData } from '@/types/dataset';
import { ChartOptions } from './options';

export interface AnchorAttributes {
  cx: number;
  cy: number;
}

type GetHighestValuesFunction = (data: InternalData) => Array<number>;

export interface TooltipConfig {
  opened: boolean;
  targetElement: Element | null;
}

function getHighestValues(data: InternalData) {
  return data.reduce((acc, curr) => {
    return curr.values.map((value, index) => {
      if (!acc[index]) return value.value ?? 0;
      return value.value > acc[index] ? value.value : acc[index];
    });
  }, [] as Array<number>);
}

function getStackedHighestValue(data: InternalData) {
  return data.reduce((acc, curr) => {
    return curr.values.map((value, index) => {
      if (!acc[index]) return value.value ?? 0;
      return value.value + acc[index]; // Instead of returning the highest value, sums them
    });
  }, [] as Array<number>);
}

const ANCHOR_CALCULATION_METHOD_MAP: {
  [type: string]: GetHighestValuesFunction;
} = {
  'stacked-bar': getStackedHighestValue,
};

export function useTooltipAnchors(
  anchorAttributeArray: Ref<Array<AnchorAttributes>>,
  options: Ref<ChartOptions>,
  xScale: Ref<Scale>,
  yScale: Ref<Scale>,
  orientation?: Ref<Orientation>,
  data?: Ref<InternalData>,
  chartType?: Ref<string>
) {
  const shouldGenerateTooltipAnchors = computed(
    () =>
      options.value.withTooltip !== false &&
      !options.value.tooltipOptions?.targetElement
  );

  function updateTooltipAnchorAttributes(renderedData: InternalData) {
    const highestValues =
      chartType?.value && ANCHOR_CALCULATION_METHOD_MAP[chartType.value]
        ? ANCHOR_CALCULATION_METHOD_MAP[chartType.value](renderedData)
        : getHighestValues(renderedData);

    anchorAttributeArray.value = highestValues.map((value, index) => ({
      cx:
        orientation?.value === ORIENTATIONS.HORIZONTAL
          ? xScale.value(value)
          : getXByIndex(xScale.value, index),
      cy:
        orientation?.value === ORIENTATIONS.HORIZONTAL
          ? getXByIndex(yScale.value, index)
          : yScale.value(value),
    }));
  }

  watch(
    [xScale, yScale],
    () => {
      if (
        xScale.value &&
        yScale.value &&
        data?.value &&
        shouldGenerateTooltipAnchors.value
      ) {
        updateTooltipAnchorAttributes(data.value);
      }
    },
    { immediate: true }
  );

  return { shouldGenerateTooltipAnchors, updateTooltipAnchorAttributes };
}

export function useTooltip() {
  const tooltipConfig = reactive<TooltipConfig>({
    opened: false,
    targetElement: null,
  });

  const showTooltip = (targetElement: Element | null) => {
    tooltipConfig.opened = true;
    tooltipConfig.targetElement = targetElement;
  };

  const hideTooltip = () => {
    tooltipConfig.opened = false;
    tooltipConfig.targetElement = null;
  };

  return { tooltipConfig, showTooltip, hideTooltip };
}

export function useTooltipItems(data: Ref<InternalData>) {
  const getTooltipItems = computed(
    () => (index: number) =>
      data.value.map(({ color, label, values }) => ({
        color: values[index]?.color || color,
        label,
        value: values[index]?.label ?? values[index]?.value ?? NO_DATA,
      }))
  );

  return { getTooltipItems };
}
