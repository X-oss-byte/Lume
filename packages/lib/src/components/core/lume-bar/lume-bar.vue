<template>
  <rect
    ref="root"
    class="lume-bar"
    :class="[
      {
        'lume-fill--faded': isFaded,
        'lume-bar--negative': isNegative,
        'lume-bar--transition-width': shouldTransitionWidth,
        'lume-bar--transition-height': shouldTransitionHeight,
      },
      ...computedClasses,
    ]"
    :style="{ transformOrigin: transformOrigin }"
    :x="computedX"
    :y="computedY"
    :width="computedWidth"
    :height="computedHeight"
    data-j-bar
    @click="emit('click', $event)"
    @mouseover="emit('mouseover', $event)"
    @mouseleave="emit('mouseleave', $event)"
  />
</template>

<script lang="ts">
type BarTransitionProperty = 'width' | 'height';
</script>

<script setup lang="ts">
import { computed, onMounted, PropType, ref, toRefs } from 'vue';

import { useBarSizing } from './composables/bar-sizing';
import { useBarTransition } from './composables/bar-transition';

import { svgCheck } from '@/utils/svg-check';

const props = defineProps({
  x: {
    type: Number,
    default: 0,
  },
  y: {
    type: Number,
    default: 0,
  },
  width: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  classList: {
    type: [String, Array] as PropType<string | Array<string>>,
    default: '',
  },
  isFaded: {
    type: Boolean,
    default: false,
  },
  isNegative: {
    type: Boolean,
    default: false,
  },
  transition: {
    type: [String, Boolean] as PropType<BarTransitionProperty | false>,
    default: false,
  },
});

const emit = defineEmits<{
  (e: 'click' | 'mouseover' | 'mouseleave', value: MouseEvent): void;
}>();

const { x, y, width, height, transition, classList } = toRefs(props);
const root = ref<SVGRectElement>(null);

const computedClasses = computed(() =>
  typeof classList.value === 'string' ? [classList.value] : classList.value
);

const shouldTransitionWidth = computed(() => transition.value === 'width');
const shouldTransitionHeight = computed(() => transition.value === 'height');

const transitionProps = useBarTransition(x, y, width, height);

const { computedX, computedY, shouldHaveMinWidth, shouldHaveMinHeight } =
  useBarSizing(x, y, width, height);

const computedWidth = computed(() => {
  if (shouldHaveMinWidth.value) return 1;

  return (shouldTransitionWidth.value ? transitionProps.computedWidth : width)
    .value;
});

const computedHeight = computed(() => {
  if (shouldHaveMinHeight.value) return 1;

  return (
    shouldTransitionHeight.value ? transitionProps.computedHeight : height
  ).value;
});

const transformOrigin =
  shouldTransitionWidth.value || shouldTransitionHeight.value
    ? transitionProps.transformOrigin
    : null;

onMounted(() => svgCheck(root.value));
</script>

<style lang="scss" scoped>
@use './styles';
</style>
