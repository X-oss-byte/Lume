import {
  computed,
  ComputedRef,
  PropType,
  reactive,
  Ref,
  set,
} from 'vue';
import { BAR_HEIGHT, Orientation, ORIENTATIONS, NUMBER_OF_COLORS } from '@/constants';
import { getEmptyArrayFromData, isDatasetValueObject } from '@/utils/helpers';
import { Data, DatasetValueObject } from '@/types/dataset';
import { Color } from '@/types/colors';
import { ContainerSize } from '@/types/size';

export type DataValidator = (value: Data) => boolean;

export const withBase = (
  dataValidator: DataValidator = null,
  isLabelsRequired = true
) => ({
  data: {
    type: Array as PropType<Data>,
    required: true,
    validator: dataValidator || undefined,
  },
  labels: {
    type: Array as PropType<Array<string>>,
    required: isLabelsRequired,
    default: isLabelsRequired ? undefined : (): Array<string> | null => null,
  },
});

export function useBase(
  data: Ref<Data>,
  labels?: Ref<Array<string>>,
  orientation?: Ref<Orientation>
) {
  const containerSize = reactive({
    width: 0,
    height: 0,
  });

  const computedData: ComputedRef<Data<DatasetValueObject>> = computed(() => {
    return data.value?.map((dataset, index) => {
      return {
        ...dataset,
        values: dataset.values.map((value) => {
          // If value is not a DatasetValueObject, convert it into one
          return isDatasetValueObject(value)
            ? value
            : ({ value } as DatasetValueObject);
        }),
        color: dataset.color || (`0${1 + (index % NUMBER_OF_COLORS)}` as Color)
      };
    });
  });

  function updateSize(size: ContainerSize) {
    const height = (orientation?.value === ORIENTATIONS.HORIZONTAL)
      ? getEmptyArrayFromData(data).length * (BAR_HEIGHT * 2)
      : size.height;

    set(containerSize, 'width', size.width);
    set(containerSize, 'height', height);
  }

  return {
    computedData,
    containerSize,
    updateSize,
  };
}
