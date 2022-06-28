import {computed, ComputedRef, onMounted, ref, Ref, watch} from '@vue/composition-api';
import {
    Alluvial,
    AlluvialInstance,
    AlluvialNode, NodeBlock,
    SankeyElements,
    SankeyLink,
    SankeyNode
} from "@/types/alluvial";
import { select } from 'd3-selection';
import { sankeyLinkHorizontal } from 'd3-sankey';
import {defaultChartColor, nodeToLabelGap, transitionDuration} from "@/charts/alluvial-chart/defaults";

export function drawPlot(
    alluvialInstance: Ref<AlluvialInstance>,
    alluvialProps: Ref<Alluvial>,
    nodes: Ref<AlluvialNode[]> | Ref<Map<number | string, number | string>>,
    links: Ref<Array<SankeyLink>> | Ref<Array<unknown>>,
    chartContainer: Ref<HTMLElement>,
    nodeId: (node: (AlluvialNode | SankeyNode)) => string | number,
    graph: Ref<SankeyElements>,
) {
    const drawingBoard = ref(null);
    const nodeIdRef = ref(nodeId);

    onMounted(() => {
        drawingBoard.value = select(chartContainer.value);
    });

    function nodeMaxLength({ label, value }): number {
        return Math.max(label.length, alluvialProps.value.valueFormatter(value).length);
    }

    function byMaxNodeLength(nodeA, nodeB): number {
        return nodeMaxLength(nodeB) - nodeMaxLength(nodeA);
    }

    function getNodeLabelBBoxByNodeId(node): SVGRect {
        return drawingBoard.value?.select(`#node-block-${nodeIdRef.value?.(node)} .node__label`)?.node()?.getBBox()
    }

    const leftMostNodeLabelWidth: ComputedRef<number> = computed(() => {
        const longestFirstLevelNode = graph.value.nodes?.filter(({ depth }) => depth === 0)
            .sort(byMaxNodeLength)?.[0];
        if (longestFirstLevelNode == null) return 0;
        return getNodeLabelBBoxByNodeId(longestFirstLevelNode)?.width;
    });

    const maxDepth = computed(() => {
        return Math.max(...graph.value.nodes.map(({ depth }) => depth));
    });

    const rightMostNodeLabelWidth = computed(() => {
        const maxX1 = getNodesMaximum('x1');
        const longestLastLevelNode = graph.value.nodes?.filter(({ x1 }) => x1 === maxX1)
            .sort(byMaxNodeLength)?.[0];
        if (longestLastLevelNode == null) return 0;
        return getNodeLabelBBoxByNodeId(longestLastLevelNode)?.width;
    });

    const topMostNodeLabelExtraHeight = computed(() => {
        const minY0 = graph.value?.nodes?.reduce((acc, { y0 }) => Math.min(acc, y0), Infinity);
        const highestLabelNode = graph.value?.nodes?.find(({ y0 }) => y0 === minY0);
        if (highestLabelNode == null) return 0;
        return Math.abs(getNodeLabelBBoxByNodeId(highestLabelNode)?.y ?? 0);
    });

    const bottomMostNodeLabelExtraHeight = computed(() => {
        const maxY1 = getNodesMaximum('y1');
        const lowestLabelNode = graph.value?.nodes?.find(({ y1 }) => y1 === maxY1);
        if (lowestLabelNode == null) return 0;
        return Math.abs(getNodeLabelBBoxByNodeId(lowestLabelNode)?.y ?? 0);
    });

    const highlightedElements: ComputedRef<{ links?: any[], nodes?: Map<unknown, unknown> }> = computed(() => {
        if (alluvialInstance.value.highlightedLink == null && alluvialInstance.value.highlightedNode == null) return {};
        if (alluvialProps.value.getHighlightedElements != null) {
            return alluvialProps.value.getHighlightedElements({
                link: alluvialInstance.value.highlightedLink,
                node: alluvialInstance.value.highlightedNode,
                links: graph.value.links,
            });
        }
        if (alluvialInstance.value.highlightedNode) {
            const links = [...alluvialInstance.value.highlightedNode.sourceLinks, ...alluvialInstance.value.highlightedNode.targetLinks];
            return {
                links,
                nodes: new Map(
                    links
                        .reduce((acc, { source, target, value }) => {
                            if (source === alluvialInstance.value.highlightedNode) {
                                return [...acc, [nodeIdRef.value(target), value]];
                            }
                            return [...acc, [nodeIdRef.value(source), value]];
                        }, [])
                ),
            };
        }
        return {
            links: [alluvialInstance.value.highlightedLink],
            nodes: new Map([[nodeIdRef.value(alluvialInstance.value.highlightedLink.target), alluvialInstance.value.highlightedLink.value]]),
        };
    });

    function highlightLinks(highlightedLinks: SankeyLink[] = graph.value.links, isEntering: boolean = false) {
        const links = new Set(highlightedLinks);
        const nodes = new Set(highlightedLinks.reduce((acc, { source, target }) => [...acc, source, target], []));
        drawingBoard.value?.selectAll('.path-group path')
            .filter(link => !links.has(link))
            .classed('path-group__link--out', isEntering);
        drawingBoard.value?.selectAll('.node')
            .filter(node => !nodes.has(node))
            .classed('node--out', isEntering);
    }

    function getNodesMaximum(coordinate: string) {
        return graph.value?.nodes?.reduce((acc, currentNode) => Math.max(acc, currentNode[coordinate]), -Infinity);
    }

    /**
     * Generates an interpolator from `start` to `end`, this is equivalent to d3-interpolate interpolateRound function.
     * @param start {number}
     * @param end {number}
     * @todo Use interpolateRound if we ever add d3-interpolate to the modules
     */
    function interpolateRound(start: number, end: number) {
        return t => Math.round(start * (1 - t) + end * t);
    }

    function updateNode(id: number | string, currentNumber: number, targetNumber: number) {
        const startTime = Date.now();
        const node = drawingBoard.value?.selectAll(`.node[id="node-block-${id}"] tspan.node__label__value`);
        const interpolator = interpolateRound(currentNumber, targetNumber);

        const performNextUpdate = () => {
            const now = Date.now();
            let iteration = (now - startTime) / transitionDuration;
            if (iteration > 1) {
                iteration = 1;
            }
            node.text(alluvialProps.value.valueFormatter(interpolator(iteration)));
            if (iteration < 1) {
                requestAnimationFrame(performNextUpdate);
            }
        };
        requestAnimationFrame(performNextUpdate);
    }

    function updateNodes({
        values,
        updatingNodes = [],
        isEntering = false,
    }) {
        const nodes = new Set(updatingNodes);
        const getStartNumber = node => {
            if (isEntering) return node.value;
            return values.get(nodeIdRef.value(node));
        };
        const getEndNumber = node => {
            if (isEntering) return values.get(nodeIdRef.value(node));
            return node.value;
        };
        graph.value.nodes.filter(node => nodes.has(node))
            .forEach(node => {
                updateNode(nodeIdRef.value(node), getStartNumber(node), getEndNumber(node));
            });
    }

    function computeLinkPaths(links) {
        return links.map(link => ({
            id: `link_${nodeIdRef.value(link.source)}:${nodeIdRef.value(link.target)}`,
            d: sankeyLinkHorizontal(),
            color: `path-group__link--${link.color || link.source?.color || defaultChartColor}`,
            strokeWidth: Math.max(1, link.width),
            link
        }));
    }

    function computeNodeBlocks(nodes): Array<NodeBlock> {
        return nodes.map(node => ({
            id: `node-block-${nodeIdRef.value(node)}`,
            rect: {
                cssClass: ({ color = defaultChartColor }) => `node__block--${color}`,
                width: node.x1 - node.x0,
                height: node.y1 - node.y0
            },
            textTransform: {
                x: node.depth > 0 ? node.x1 + nodeToLabelGap : node.x0 - nodeToLabelGap,
                y: (node.y1 + node.y0) / 2
            },
            node
        }))
    }

    function drawLinkPaths(links) {
        drawingBoard.value?.selectAll('.path-group')
            .data(links, sankeyLinkHorizontal())
            .join(enter => {
                const groups = enter.append('g')
                    .attr('class', 'path-group');

                groups.append('g')
                    .style('mix-blend-mode', 'multiply')
                    .append('path')
                    .attr('id', d => `link_${nodeIdRef.value(d.source)}:${nodeIdRef.value(d.target)}`)
                    .attr('d', sankeyLinkHorizontal())
                    .attr('class', ({ source: { color: nodeColor = defaultChartColor }, color = nodeColor }) => `path-group__link--${color}`)
                    .classed('path-group__link', true)
                    .attr('stroke-width', d => Math.max(1, d.width))
                    .on('mouseover', (event, link) => {
                        alluvialInstance.value.highlightedLink = link;
                    })
                    .on('mouseout', () => {
                        alluvialInstance.value.highlightedLink = null;
                    });

                return groups;
            })
            .append('g');
    }
    function drawNodeBlocks(nodes) {
        drawingBoard.value?.selectAll('.node')
            .data(nodes, ({ x0, x1, y0, y1 }) => `${x0},${x1},${y0},${y1}`)
            .join(enter => {
                const g = enter.append('g')
                    .attr('class', 'node')
                    .attr('id', d => `node-block-${nodeIdRef.value(d)}`);

                g.append('rect')
                    .attr('transform', ({ x0, y0 }) => `translate(${x0}, ${y0})`)
                    .attr('height', d => d.y1 - d.y0)
                    .attr('width', d => d.x1 - d.x0)
                    .attr('class', ({ color = defaultChartColor }) => `node__block--${color}`)
                    .on('mouseover', (event, node) => {
                        alluvialInstance.value.highlightedNode = node;
                    })
                    .on('mouseout', () => {
                        alluvialInstance.value.highlightedNode = null;
                    });

                const text = g.append('text')
                    .attr('class', 'node__label')
                    .attr('transform', ({ depth, x0, x1, y0, y1 }) => {
                        const x = (depth > 0 ? x1 + nodeToLabelGap : x0 - nodeToLabelGap);
                        const y = (y1 + y0) / 2;
                        return `translate(${x}, ${y})`;
                    })
                    .classed('node__label--right', ({ depth }) => depth === 0)
                    .classed('node__label--color', ({ depth }) => depth === maxDepth);

                text.append('tspan')
                    .attr('class', 'node__label__title')
                    .text(d => d.label);

                text.append('tspan')
                    .attr('class', 'node__label__value')
                    .attr('x', 0)
                    .attr('dy', '1.2em')
                    .text(({ value }) => alluvialProps.value.valueFormatter(value));
                return g;
            });
    }

    function renderChart({ nodes, links }) {
        if (nodes == null || links == null) {
            return;
        }
        console.log('NODES: ', nodes, ' LINKS: ', links);
        alluvialInstance.value.nodeBlocks = computeNodeBlocks(nodes);
        alluvialInstance.value.linkPaths = computeLinkPaths(links);

        // drawNodeBlocks(nodes);
        // drawLinkPaths(links);
    }

    return { leftMostNodeLabelWidth, rightMostNodeLabelWidth, topMostNodeLabelExtraHeight, bottomMostNodeLabelExtraHeight, highlightedElements, highlightLinks, updateNodes, renderChart, maxDepth };
}