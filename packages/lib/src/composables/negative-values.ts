import { computed, Ref } from 'vue';

import { flatValues } from '@/utils/helpers';

import { Orientation, ORIENTATIONS } from '@/utils/constants';
import { InternalData } from '@/types/dataset';
import { ContainerSize } from '@/types/size';
import { Scale } from './scales';

export function checkNegativeValues(data: Ref<InternalData>) {
  const hasNegativeValues = computed(() =>
    flatValues(data.value).some((v) => v < 0)
  );
  return { hasNegativeValues };
}

export function useNegativeValues(
  containerSize?: ContainerSize,
  xScale?: Ref<Scale>,
  yScale?: Ref<Scale>,
  orientation?: Ref<Orientation>
) {
  const isHorizontal = computed(
    () => orientation.value === ORIENTATIONS.HORIZONTAL
  );

  const negativeHeight = computed(
    () =>
      containerSize.height - (isHorizontal?.value ? 0 : yScale.value?.(0) || 0)
  );

  const negativeWidth = computed(() =>
    isHorizontal?.value ? xScale.value?.(0) || 0 : containerSize.width
  );

  const negativeTransform = computed(() =>
    isHorizontal?.value
      ? `translate(0, 0)`
      : `translate(0, ${yScale.value?.(0) || 0})`
  );

  const negativeBarAttributes = computed(() => ({
    width: negativeWidth.value,
    height: negativeHeight.value,
    transform: negativeTransform.value,
  }));

  return { negativeBarAttributes };
}
