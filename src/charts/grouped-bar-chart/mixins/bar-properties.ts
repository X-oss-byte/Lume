import { computed, ComputedRef } from '@vue/composition-api';
import { scaleBand } from 'd3-scale';
import { Data } from '@/types/dataset';

export function useBarProperties(
  data: ComputedRef<Data<number>>,
  isHorizontal: ComputedRef<boolean>,
  xScale,
  yScale
) {
  const xSubgroup = computed(() => {
    return scaleBand()
      .domain(data.value.map((_, index) => index.toString()))
      .range([0, xScale.value.bandwidth()])
      .padding(0);
  });

  const ySubgroup = computed(() => {
    return scaleBand()
      .domain(data.value.map((_, index) => index.toString()))
      .range([0, yScale.value.bandwidth()])
      .padding(0);
  });

  function getBarTranslateX(value: number, index: number, barIndex: number) {
    if (isHorizontal.value) {
      return value >= 0 ? xScale.value(0) : xScale.value(value);
    }
    const domain = xScale.value.domain();
    return xScale.value(domain[index]) + xSubgroup.value(barIndex.toString());
  }

  function getBarTranslateY(value: number, index: number, barIndex: number) {
    if (isHorizontal.value) {
      const domain = yScale.value.domain();
      return yScale.value(domain[index]) + ySubgroup.value(barIndex.toString());
    }
    return value < 0 ? yScale.value(0) : yScale.value(value);
  }

  function getBarWidth(value: number) {
    if (isHorizontal.value) {
      return value < 0
        ? xScale.value(0) - xScale.value(value)
        : xScale.value(value) - xScale.value(0);
    }
    return xSubgroup.value.bandwidth();
  }

  function getBarHeight(value: number) {
    if (isHorizontal.value) {
      return ySubgroup.value.bandwidth();
    }
    return value < 0
      ? yScale.value(value) - yScale.value(0)
      : yScale.value(0) - yScale.value(value);
  }

  return { getBarTranslateX, getBarTranslateY, getBarWidth, getBarHeight };
}
