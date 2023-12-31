<template>
  <lume-chart-container
    :id="`lume-chart_${chartID}`"
    ref="chartContainer"
    :margins="allOptions.margins"
    :container-size="containerSize"
    :no-min-size="allOptions.noMinSize"
    :transparent-background="allOptions.transparentBackground"
    data-j-lume-chart
    @resize="updateSize"
    @click="emit('chart-click', $event)"
    @mouseenter="emit('chart-mouseenter', $event)"
    @mouseleave="handleMouseleave"
  >
    <template #header>
      <div class="lume-chart__header">
        <div class="lume-chart__header-section">
          <!-- chart title -->
          <h1
            v-if="title"
            class="lume-chart__title lume-chart-title lume-typography--display"
          >
            {{ title }}
          </h1>

          <!-- segmented control / filter -->
          <div class="lume-chart__controls">
            <slot name="controls" />
          </div>
        </div>

        <div class="lume-chart__header-section">
          <!-- y axis title -->
          <h3
            v-if="showYAxisTitle"
            class="lume-chart__axis-title lume-axis-title lume-typography--body"
          >
            {{ yAxisTitle }}
          </h3>

          <!-- chart legend -->
          <slot
            name="legend"
            :data="internalData"
          >
            <lume-chart-legend
              v-if="
                allOptions.withLegend !== false &&
                  allOptions.legendPosition !== 'bottom'
              "
              :data="internalData"
              class="lume-chart__legend"
              data-j-lume-chart__legend
              @click="emit('legend-click', $event)"
              @mouseenter="emit('legend-mouseenter', $event)"
              @mouseleave="emit('legend-mouseleave')"
            />
          </slot>
        </div>
      </div>
    </template>

    <template v-if="isReady">
      <!-- Negative values background -->
      <lume-bar
        v-if="hasNegativeValues"
        v-bind="negativeBarAttributes"
        class-list="lume-fill--negative"
        :transition="false"
        data-j-lume-chart__negative-values
      />

      <!-- Axes -->
      <slot
        v-if="allOptions.withAxes !== false"
        name="axes"
        :x-scale="computedXScale"
        :y-scale="computedYScale"
        :container-size="containerSize"
        :options="allOptions"
        :hovered-index="hoveredIndex"
      >
        <lume-axis
          type="x"
          :scale="computedXScale"
          :container-size="containerSize"
          :options="computedXAxisOptions"
          :hovered-index="hoveredIndex"
          :orientation="orientation"
          data-j-lume-chart__x-axis
          @click="handleAxisClick"
          @mouseenter="handleAxisMouseenter"
          @mouseleave="emit('axis-mouseleave')"
        />
        <lume-axis
          type="y"
          :scale="computedYScale"
          :container-size="containerSize"
          :options="computedYAxisOptions"
          :hovered-index="hoveredIndex"
          :orientation="orientation"
          data-j-lume-chart__y-axis
          @click="handleAxisClick"
          @mouseenter="handleAxisMouseenter"
          @mouseleave="emit('axis-mouseleave')"
        />
      </slot>

      <!-- Overlay bars -->
      <lume-overlay-group
        v-if="allOptions.withHover !== false"
        :data="internalData"
        :orientation="orientation"
        :x-scale="computedXScale"
        :y-scale="computedYScale"
        data-j-lume-chart__overlay-group
        @lume__internal--hover="handleInternalHover"
      />

      <!-- Tooltip anchors -->
      <g v-if="shouldGenerateTooltipAnchors">
        <circle
          v-for="(attrs, index) in tooltipAnchorAttributes"
          v-bind="attrs"
          ref="tooltipAnchor"
          :key="`anchor_${index}`"
          :r="tooltipAnchorRadius"
          class="lume-fill--transparent"
        />
      </g>

      <!-- Data groups -->
      <slot
        name="groups"
        :data="internalData"
        :labels="computedLabels"
        :options="allOptions"
        :orientation="orientation"
        :x-scale="computedXScale"
        :y-scale="computedYScale"
        :hovered-index="hoveredIndex"
        :container-size="containerSize"
        :transition="allOptions.withTransition !== false"
        :class-list="classList"
        @node-click="emit('node-click', $event)"
        @node-mouseenter="emit('node-mouseenter', $event)"
        @node-mouseleave="emit('node-mouseleave', $event)"
        @link-click="emit('link-click', $event)"
        @link-mouseenter="emit('link-mouseenter', $event)"
        @link-mouseleave="emit('link-mouseleave', $event)"
        @bar-click="emit('bar-click', $event)"
        @line-click="emit('line-click', $event)"
        @point-click="emit('point-click', $event)"
        @lume__internal--hover="handleInternalHover"
      />
    </template>

    <template #footer>
      <!-- x axis title -->
      <h3
        v-if="showXAxisTitle"
        class="lume-chart__axis-title lume-chart__axis-title--centered lume-axis-title"
      >
        {{ xAxisTitle }}
      </h3>

      <!-- bottom chart legend -->
      <lume-chart-legend
        v-if="
          allOptions.withLegend !== false &&
            allOptions.legendPosition == 'bottom'
        "
        :data="internalData"
        class="lume-chart__legend lume-chart__legend--bottom"
        data-j-lume-chart__legend
        @click="emit('legend-click', $event)"
        @mouseenter="emit('legend-mouseenter', $event)"
        @mouseleave="emit('legend-mouseleave')"
      />
    </template>

    <template #extra>
      <slot
        name="tooltip"
        v-bind="tooltipConfig"
        :data="internalData"
        :labels="computedLabels"
        :with-tooltip="allOptions.withTooltip !== false"
        :hovered-index="hoveredIndex"
        :options="allOptions.tooltipOptions"
      >
        <lume-tooltip
          v-if="isTooltipOpened"
          v-bind="tooltipConfig"
          :position="tooltipPosition"
          :title="computedLabels[hoveredIndex]"
          :items="getTooltipItems(hoveredIndex)"
          :options="allOptions.tooltipOptions"
          data-j-lume-chart__tooltip
          @opened="
            emit('tooltip-opened', {
              index: hoveredIndex,
              targetElement: $event,
            })
          "
          @moved="
            emit('tooltip-moved', {
              index: hoveredIndex,
              targetElement: $event,
            })
          "
          @closed="emit('tooltip-closed')"
        >
          <slot
            name="tooltip-content"
            :data="internalData"
            :labels="computedLabels"
            :hovered-index="hoveredIndex"
          />
        </lume-tooltip>
      </slot>
    </template>
  </lume-chart-container>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  PropType,
  provide,
  ref,
  toRefs,
  useSlots,
  watch,
} from 'vue';

import LumeAxis from '@/components/core/lume-axis';
import LumeBar from '@/components/core/lume-bar';
import LumeChartContainer from '@/components/core/lume-chart-container';
import LumeChartLegend from '@/components/core/lume-chart-legend';
import LumeTooltip from '@/components/core/lume-tooltip';
import LumeOverlayGroup from '@/components/groups/lume-overlay-group';

import { useBase } from '@/composables/base';
import { withChartProps } from '@/composables/props';
import { isScale, Scale, useBaseScales } from '@/composables/scales';
import { ChartOptions, useOptions } from '@/composables/options';
import {
  checkNegativeValues,
  useNegativeValues,
} from '@/composables/negative-values';
import {
  AnchorAttributes,
  useTooltip,
  useTooltipAnchors,
  useTooltipItems,
} from '@/composables/tooltip';

import { ORIENTATIONS, TOOLTIP_ANCHOR_RADIUS } from '@/utils/constants';
import { ChartType, Data } from '@/types/dataset';
import { ChartEmits } from '@/types/events';

const props = defineProps({
  ...withChartProps(),
  chartType: {
    type: String as PropType<ChartType>,
    default: null,
  },
});

const slots = useSlots();

// https://github.com/vuejs/core/issues/4294#issuecomment-1480392140
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Emits extends ChartEmits {}
const emit = defineEmits<Emits>();

const tooltipAnchorRadius = TOOLTIP_ANCHOR_RADIUS;

const { data, labels, color, options, orientation, chartType } = toRefs(props);

const hoveredIndex = ref<number>(-1);
const tooltipAnchor = ref<SVGCircleElement>(null);
const chartContainer = ref<InstanceType<typeof LumeChartContainer>>(null);
const tooltipAnchorAttributes = ref<Array<AnchorAttributes>>([]);

const { allOptions } = useOptions<ChartOptions>(options);

const { internalData, computedLabels, containerSize, updateSize, chartID } =
  useBase(data, labels, color, allOptions, orientation);

const { xScale, yScale } = useBaseScales(
  internalData,
  computedLabels,
  containerSize,
  orientation,
  allOptions
);

const computedXScale = computed<Scale>(() => {
  if (!props.xScale) return xScale.value;
  return isScale(props.xScale)
    ? props.xScale
    : props.xScale?.(internalData.value, labels.value, containerSize);
});

const computedYScale = computed<Scale>(() => {
  if (!props.yScale) return yScale.value;
  return isScale(props.yScale)
    ? props.yScale
    : props.yScale?.(internalData.value, labels.value, containerSize);
});

const computedXAxisOptions = computed(() => ({
  ...allOptions.value.xAxisOptions,
  withHover: orientation.value === ORIENTATIONS.VERTICAL,
}));

const computedYAxisOptions = computed(() => ({
  ...allOptions.value.yAxisOptions,
  withHover: orientation.value === ORIENTATIONS.HORIZONTAL,
}));

const xAxisTitle = computed(() => {
  return allOptions.value.xAxisOptions?.title;
});

const yAxisTitle = computed(() => {
  return allOptions.value.yAxisOptions?.title;
});

const showXAxisTitle = computed(() => {
  return allOptions.value.xAxisOptions?.withTitle !== false && xAxisTitle.value;
});

const showYAxisTitle = computed(() => {
  return allOptions.value.yAxisOptions?.withTitle !== false && yAxisTitle.value;
});

const isReady = computed(() => {
  const conditions: Array<() => boolean> = [];

  const { noBaseScales } = allOptions.value;

  if (!noBaseScales) {
    conditions.push(() => !!(computedXScale.value && computedYScale.value));
  }

  return conditions.every((c) => c() === true);
});

const { hasNegativeValues } = checkNegativeValues(internalData);
const { negativeBarAttributes } = useNegativeValues(
  containerSize,
  computedXScale,
  computedYScale,
  orientation
);

const { shouldGenerateTooltipAnchors } = useTooltipAnchors(
  tooltipAnchorAttributes,
  allOptions,
  computedXScale,
  computedYScale,
  orientation,
  internalData,
  chartType
);

const { tooltipConfig, showTooltip, hideTooltip } = useTooltip();

const { getTooltipItems } = useTooltipItems(internalData);

const isTooltipOpened = computed(
  () => allOptions.value.withTooltip !== false && tooltipConfig.opened
);

const tooltipPosition = computed(
  () => allOptions.value.tooltipOptions?.position || 'top'
);

function handleInternalHover(index: number) {
  // Skip the rest if the index didn't change
  if (index === hoveredIndex.value) return;

  // Update hoveredIndex
  allOptions.value.withHover !== false && (hoveredIndex.value = index);

  if (allOptions.value.withTooltip !== false) {
    // Show/update tooltip
    const targetElement = !allOptions.value.tooltipOptions?.targetElement
      ? tooltipAnchor.value[index]
      : allOptions.value.tooltipOptions.targetElement === 'self'
        ? chartContainer.value.$el
        : allOptions.value.tooltipOptions.targetElement;

    showTooltip(targetElement);
  }
}

function handleMouseleave() {
  hideTooltip();
  hoveredIndex.value = -1;
  emit('chart-mouseleave');
}

function handleAxisMouseenter({ index, value, event }) {
  if (index !== null) handleInternalHover(index);
  emit('axis-mouseenter', { index, value, event });
}

function handleAxisClick({ index, value, event }) {
  emit('axis-click', { index, value, event });
}

watch(data, (newValue: Data, oldValue: Data | null) =>
  emit('data-changed', { newValue, oldValue })
);

watch(labels, (newValue: string[], oldValue: string[] | null) =>
  emit('labels-changed', { newValue, oldValue })
);

onMounted(() => {
  emit('rendered');
  if (!slots.groups) {
    console.error('"groups" `<slot>` must have content.');
  }
});

provide('chartID', chartID);
provide('tooltipAnchorAttributes', tooltipAnchorAttributes); // provide anchors to re-compute in some cases
</script>

<style lang="scss" scoped>
@use './styles';
</style>
