import { computed, PropType, ref } from '@vue/composition-api';
import { ORIENTATIONS } from '@/constants';
import { Dataset } from '@/types/dataset';

export const withBase = () => ({
  data: {
    type: Array as PropType<Dataset>,
    required: true,
  },
  labels: {
    type: Array as PropType<Array<string>>,
    default: (): Array<string> | null => null,
  },
});

export function useBase(
  data: Dataset,
  labels: Array<string>,
  orientation = ORIENTATIONS.VERTICAL
) {
  const width = ref(0);
  const height = ref(0);

  const containerSize = computed(() => ({ width, height }));

  const domain = computed(() => labels || data.map((_, i: number) => i));

  const isHorizontal = computed(() => orientation === ORIENTATIONS.HORIZONTAL);

  return { width, height, containerSize, domain, isHorizontal };
}
