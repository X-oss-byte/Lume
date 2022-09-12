import { computed, ComputedRef, ref, Ref } from 'vue';
import { sankey, SankeyLink, SankeyNode } from 'd3-sankey';

import { ContainerSize } from '@/types/size';
import {
  AlluvialDataset,
  SankeyLinkAdditionalProperties,
  SankeyNodeAdditionalProperties,
} from '@/types/alluvial';

const BASE_INSTANCE = {
  highlightedLink: null,
  highlightedNode: null,
  leftExtent: 0,
  rightExtent: 0,
  topExtent: 0,
  bottomExtent: 0,
  nodeBlocks: [],
  linkPaths: [],
};

export function useAlluvialBlocks(
  alluvialProps: Ref<AlluvialDataset>,
  containerSize: ContainerSize
) {
  const alluvialInstance = ref({ ...BASE_INSTANCE, containerSize });
  const nodes: ComputedRef<
    SankeyNode<SankeyNodeAdditionalProperties, SankeyLinkAdditionalProperties>[]
  > = computed(() => {
    return alluvialProps.value.values.map(({ label, color, value }) => ({
      label,
      color,
      id: value,
    }));
  });

  const links: ComputedRef<
    SankeyLink<SankeyNodeAdditionalProperties, SankeyLinkAdditionalProperties>[]
  > = computed(() => {
    return alluvialProps.value.values
      .map((source) =>
        source.targets?.map(({ node: target, value, color }) => ({
          source: source.value ?? source.label,
          color,
          target,
          value,
        }))
      )
      .filter(Boolean)
      .reduce((aggregatedLinks, links) => [...aggregatedLinks, ...links], []);
  });

  const layout = computed(() => {
    const { leftExtent, rightExtent, topExtent, bottomExtent, containerSize } =
      alluvialInstance.value;
    return sankey<
      SankeyNodeAdditionalProperties,
      SankeyLinkAdditionalProperties
    >()
      .nodeId(nodeId)
      .nodeWidth(alluvialProps.value.nodeWidth)
      .nodeSort(alluvialProps.value.nodeSort)
      .nodePadding(20)
      .nodeAlign(alluvialProps.value.nodeAlign)
      .extent([
        [leftExtent, topExtent],
        [rightExtent, containerSize.height - bottomExtent],
      ]);
  });

  const graph = computed(() => {
    return layout.value({
      nodes: nodes.value.map((node) => ({ ...node })),
      links: links.value.map((link) => ({ ...link })),
    });
  });

  function nodeId(
    node: SankeyNode<
      SankeyNodeAdditionalProperties,
      SankeyLinkAdditionalProperties
    >
  ): number | string {
    return node.id ?? node.label;
  }

  return {
    nodes,
    links,
    graph,
    nodeId,
    alluvialInstance,
  };
}

export function useDefaultData(alluvial, defaultAlluvial: AlluvialDataset) {
  const data: AlluvialDataset = {
    ...defaultAlluvial,
    ...alluvial,
  };
  return ref(data);
}