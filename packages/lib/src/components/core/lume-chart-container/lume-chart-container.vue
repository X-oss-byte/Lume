<template>
  <div
    ref="resizeRef"
    class="lume-chart-container"
    :class="{
      'lume-chart-container--minimum': !noMinSize,
    }"
    data-j-chart-container
  >
    <slot name="header" />

    <svg
      ref="root"
      class="lume-chart-container__svg"
      :class="{
        'lume-chart-container__svg--transparent': transparentBackground,
      }"
      :height="svgHeight"
      data-j-chart-container__root
      @click="emit('click', $event)"
      @mouseenter="emit('mouseenter', $event)"
      @mouseleave="emit('mouseleave', $event)"
    >
      <g
        :transform="`translate(${computedMargins.left}, ${computedMargins.top})`"
        class="lume-chart-container__group"
        data-j-chart-container__group
      >
        <slot />
      </g>
    </svg>

    <slot name="footer" />

    <slot name="extra" />
  </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, PropType, ref, toRefs, watchEffect } from 'vue';

import { useResizeObserver } from '@/composables/resize';
import { Margins } from '@/utils/constants';
import { ContainerSize } from '@/types/size';

const BASE_MARGINS = {
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};

const props = defineProps({
  margins: {
    type: Object as PropType<Margins>,
    default: () => ({}),
  },
  containerSize: {
    type: Object as PropType<ContainerSize>,
    default: () => ({ width: 0, height: 0 }),
  },
  transparentBackground: {
    type: Boolean,
    default: false,
  },
  noMinSize: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: 'click', p: PointerEvent): void;
  (e: 'mouseenter' | 'mouseleave', p: MouseEvent): void;
  (e: 'resize', value: ContainerSize): void;
}>();

const { margins, containerSize } = toRefs(props);

const root = ref<SVGElement>(null);
const { resizeRef, resizeState } = useResizeObserver();

const computedMargins: ComputedRef<Margins> = computed(() => ({
  ...BASE_MARGINS, // Default values
  ...margins.value, // Prop overrides
}));

// Required for horizontal charts
const svgHeight = computed(
  () =>
    containerSize.value.height +
    computedMargins.value.top +
    computedMargins.value.bottom
);

watchEffect(() => {
  if (!root.value) return;

  const { width } = resizeState.dimensions;
  const { height } = root.value.getBoundingClientRect();

  if (!width || !height) return;

  const contentWidth =
    width - computedMargins.value.left - computedMargins.value.right;
  const contentHeight =
    height - computedMargins.value.top - computedMargins.value.bottom;

  const _containerSize = {
    width: contentWidth > 0 ? contentWidth : 0,
    height: contentHeight > 0 ? contentHeight : 0,
    outerWidth: width,
    outerHeight: height,
  };

  emit('resize', _containerSize);
});
</script>

<style lang="scss" scoped>
@use './styles';
</style>
