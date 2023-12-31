<template>
  <g
    v-if="scale"
    ref="root"
    class="axis"
    :transform="axisTransform"
    data-j-axis
    @mouseleave="emit('mouseleave', $event)"
  >
    <defs v-if="computedType === 'x'">
      <linearGradient id="lume-tick-gradient">
        <stop
          offset="0%"
          stop-color="rgba(255,255,255,0)"
        />
        <stop
          offset="10%"
          stop-color="var(--lume-chart-background-color)"
        />
        <stop
          offset="90%"
          stop-color="var(--lume-chart-background-color)"
        />
        <stop
          offset="100%"
          stop-color="rgba(255,255,255,0)"
        />
      </linearGradient>
    </defs>

    <lume-tick
      v-for="(tick, index) in ticksWithAttributes"
      :key="`${tick.value}_${index}`"
      ref="tickRefs"
      v-bind="tick"
      :is-hidden="allOptions.skip && !showTick(index)"
      :with-gridlines="allOptions.gridLines"
      @mouseenter="handleTickMouseenter(index, tick.value, $event)"
      @click="handleTickClick(index, tick.value, $event)"
    />

    <!-- Hovered tick -->
    <!-- Has to be copied over to after all other ticks so that it shows on top. (z-index doesn't work for SVG) -->
    <lume-tick
      v-if="isHovering"
      v-bind="ticksWithAttributes[hoveredIndex]"
      :with-gridlines="false"
      is-hovered
      @click="
        handleTickClick(
          hoveredIndex,
          ticksWithAttributes[hoveredIndex].value,
          $event
        )
      "
    />
  </g>
</template>

<script lang="ts">
enum SCALE_MIXIN_MAP {
  bandScale = 'band-scale-axis',
  linearScale = 'linear-scale-axis',
}
enum POSITIONS {
  left = 'left',
  bottom = 'bottom',
}
enum TYPES {
  x = POSITIONS.bottom,
  y = POSITIONS.left,
}
</script>

<script setup lang="ts">
import {
  computed,
  onMounted,
  PropType,
  reactive,
  ref,
  toRefs,
  watch,
} from 'vue';
import { ticks as d3TickGenerator } from 'd3';
import { ScaleBand } from 'd3';

import LumeTick from './components/lume-tick';

import { useFormat } from '@/composables/format';
import { AxisOptions, useOptions, withOptions } from '@/composables/options';
import { ComputedScaleBand, Scale } from '@/composables/scales';
import { useSkip } from './composables/lume-skip';

import { Orientation, ORIENTATIONS } from '@/utils/constants';
import { isBandScale } from '@/utils/helpers';
import { svgCheck } from '@/utils/svg-check';
import { ContainerSize } from '@/types/size';
import { xOptions, yOptions } from './defaults';
import { AxisMixin, AxisMixinFunction, TickAttributes } from './types';

import mixinTypes from './composables/';

const props = defineProps({
  scale: {
    type: Function as PropType<Scale>,
    required: true,
  },
  type: {
    type: String,
    default: undefined,
    validator: (value: string) => value in TYPES,
  },
  position: {
    type: String as PropType<POSITIONS>,
    default: undefined,
    validator: (value: string) => value in POSITIONS,
  },
  containerSize: {
    type: Object as PropType<ContainerSize>,
    default: () => ({ width: 0, height: 0 }),
  },
  hoveredIndex: {
    type: Number,
    default: -1,
  },
  orientation: {
    type: String as PropType<Orientation>,
    default: ORIENTATIONS.VERTICAL,
  },
  ...withOptions<AxisOptions>(),
});

const emit = defineEmits<{
  (
    e: 'mouseenter' | 'click',
    p: { index?: number; value: string | number; event: MouseEvent }
  ): void;
  (e: 'mouseleave', p: MouseEvent): void;
}>();

const { scale, containerSize, hoveredIndex, options, orientation } =
  toRefs(props); // Needs to be cast as any to avoid it being cast to never by default

const mixins = reactive<Record<string, AxisMixinFunction>>({});
const tickRefs = ref<Array<{ ref: SVGTextElement }>>(null);
const root = ref<SVGGElement>(null);
const ticksWithAttributes = ref<Array<TickAttributes>>(null);

const computedPosition = computed(() =>
  props.type ? TYPES[props.type] : props.position
);

const computedType = computed(
  () => props.type || (computedPosition.value === 'left' ? 'y' : 'x')
);

const shouldHover = computed(
  () =>
    (computedType.value === 'x' &&
      orientation.value === ORIENTATIONS.VERTICAL) ||
    (computedType.value === 'y' &&
      orientation.value === ORIENTATIONS.HORIZONTAL)
);

const { allOptions } = useOptions<AxisOptions>(
  options,
  computedType.value === 'x' ? xOptions : yOptions
);

const { showTick } = useSkip(scale, tickRefs, allOptions.value.skip);

const axisTransform = computed(
  () =>
    `translate(0, ${
      computedType.value === 'x' ? containerSize.value?.height : 0
    })`
);

const ticks = computed(() => {
  // For band scales, return the full labels array (domain)
  if (isBandScale(scale.value)) {
    return (scale.value as ComputedScaleBand).labels || scale.value.domain();
  }

  const { tickCount } = allOptions.value;
  const [start, end] = scale.value.domain() as number[];

  return d3TickGenerator(start, end, tickCount);
});

const tickFormatter = computed(() => {
  const { tickFormat } = allOptions.value;
  return useFormat(tickFormat);
});

const isHovering = computed(
  () =>
    allOptions.value.withHover && shouldHover.value && hoveredIndex.value > -1
);

function formatTick(tick: number | string) {
  const { showTicks } = allOptions.value;

  // Hides ticks without hiding `gridLines`
  if (showTicks === false) return '';

  return tickFormatter.value(tick);
}

function handleTickMouseenter(
  index: number,
  value: string | number,
  event: MouseEvent
) {
  emit('mouseenter', { index: shouldHover.value ? index : null, value, event });
}

function handleTickClick(
  index: number | null,
  value: string | number,
  event: MouseEvent
) {
  emit('click', { index, value, event });
}

function getTextNode(index: number) {
  if (!tickRefs.value || !tickRefs.value.length) return;
  return tickRefs.value[index].ref;
}

function setTicks() {
  ticksWithAttributes.value = ticks.value.map(
    (tick: string | number, index: number) => {
      return {
        value: formatTick(tick),
        group: mixins.getTickGroupAttributes(tick, index),
        ghost: mixins.getTickGhostAttributes(getTextNode(index)),
        label: mixins.getTickLabelAttributes(),
        gridline: mixins.getGridLinesAttributes(),
      };
    }
  );
}

function init() {
  const scaleType = (scale.value as ScaleBand<string | number>).step
    ? 'bandScale'
    : 'linearScale';

  // Get mixin generator based on the scale type
  const mixin: AxisMixin =
    mixinTypes[`${computedType.value}-${SCALE_MIXIN_MAP[scaleType]}`];

  // Push all mixin functions into the `mixins` reactive object
  Object.entries(mixin(scale, containerSize, allOptions) || []).forEach(
    ([fnName, fn]) => {
      mixins[fnName] = fn;
    }
  );
}

// Setup watcher to get new mixins if scale changes (i.e. vertical to horizontal)
watch(scale, init, { flush: 'sync', immediate: true });

// Re-render after scale changes (new containerSize, new balebs, scale override, etc.)
watch(scale, setTicks, { immediate: true });
// Re-render after `tickRefs` is defined (to grab text width)
watch(tickRefs, setTicks);

onMounted(() => svgCheck(root.value));
</script>
