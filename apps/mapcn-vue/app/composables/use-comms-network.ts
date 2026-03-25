import type {
  CommNode,
  CommLink,
  NodeType,
  LinkStatus,
  CommNodeTypeConfig,
  CommNetworkStats,
} from '~/types/defense-comms';

const NODE_TYPES: CommNodeTypeConfig[] = [
  {
    type: 'hq',
    label: 'HQ',
    icon: 'lucide:building-2',
    color: [255, 200, 0],
    defaultRange: 30,
  },
  {
    type: 'relay',
    label: 'Relay',
    icon: 'lucide:radio-tower',
    color: [0, 200, 150],
    defaultRange: 20,
  },
  {
    type: 'field',
    label: 'Field Unit',
    icon: 'lucide:user',
    color: [80, 160, 255],
    defaultRange: 8,
  },
];

const INITIAL_NODES: CommNode[] = [
  // HQ (2)
  {
    id: 'TAC-HQ-1',
    type: 'hq',
    label: 'TAC-HQ-1',
    position: [93.4, 27.5],
    range: 30,
    color: [255, 200, 0],
  },
  {
    id: 'TAC-HQ-2',
    type: 'hq',
    label: 'TAC-HQ-2',
    position: [93.65, 27.5],
    range: 30,
    color: [255, 200, 0],
  },
  // Relay (4)
  {
    id: 'RELAY-1',
    type: 'relay',
    label: 'RELAY-1',
    position: [93.45, 27.55],
    range: 20,
    color: [0, 200, 150],
  },
  {
    id: 'RELAY-2',
    type: 'relay',
    label: 'RELAY-2',
    position: [93.52, 27.45],
    range: 20,
    color: [0, 200, 150],
  },
  {
    id: 'RELAY-3',
    type: 'relay',
    label: 'RELAY-3',
    position: [93.58, 27.53],
    range: 20,
    color: [0, 200, 150],
  },
  {
    id: 'RELAY-4',
    type: 'relay',
    label: 'RELAY-4',
    position: [93.5, 27.48],
    range: 20,
    color: [0, 200, 150],
  },
  // Field (6)
  {
    id: 'FLD-1',
    type: 'field',
    label: 'FLD-1',
    position: [93.38, 27.54],
    range: 8,
    color: [80, 160, 255],
  },
  {
    id: 'FLD-2',
    type: 'field',
    label: 'FLD-2',
    position: [93.42, 27.58],
    range: 8,
    color: [80, 160, 255],
  },
  {
    id: 'FLD-3',
    type: 'field',
    label: 'FLD-3',
    position: [93.48, 27.42],
    range: 8,
    color: [80, 160, 255],
  },
  {
    id: 'FLD-4',
    type: 'field',
    label: 'FLD-4',
    position: [93.55, 27.57],
    range: 8,
    color: [80, 160, 255],
  },
  {
    id: 'FLD-5',
    type: 'field',
    label: 'FLD-5',
    position: [93.62, 27.46],
    range: 8,
    color: [80, 160, 255],
  },
  {
    id: 'FLD-6',
    type: 'field',
    label: 'FLD-6',
    position: [93.68, 27.54],
    range: 8,
    color: [80, 160, 255],
  },
];

function haversineDistance(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[1] - a[1]) * Math.PI) / 180;
  const dLon = ((b[0] - a[0]) * Math.PI) / 180;
  const lat1 = (a[1] * Math.PI) / 180;
  const lat2 = (b[1] * Math.PI) / 180;
  const sinHalf =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(sinHalf), Math.sqrt(1 - sinHalf));
}

function statusFromSignal(signal: number): LinkStatus {
  if (signal >= 80) return 'strong';
  if (signal >= 50) return 'degraded';
  if (signal >= 20) return 'weak';
  return 'down';
}

function generateLinks(nodes: CommNode[]): CommLink[] {
  const links: CommLink[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const nodeA = nodes[i]!;
      const nodeB = nodes[j]!;
      const dist = haversineDistance(nodeA.position, nodeB.position);
      const maxRange = Math.min(nodeA.range, nodeB.range);
      if (dist <= maxRange) {
        const signal = Math.max(20, Math.round(100 - (dist / maxRange) * 80));
        links.push({
          id: `link-${nodeA.id}-${nodeB.id}`,
          source: nodeA.id,
          target: nodeB.id,
          status: statusFromSignal(signal),
          signalStrength: signal,
        });
      }
    }
  }
  return links;
}

export function useCommsNetwork() {
  const nodes = ref<CommNode[]>(structuredClone(INITIAL_NODES));
  const links = ref<CommLink[]>(generateLinks(INITIAL_NODES));
  const activeNodeTypes = ref<Set<NodeType>>(new Set(['hq', 'relay', 'field']));

  let simulationTimer: ReturnType<typeof setInterval> | null = null;

  const filteredNodes = computed(() =>
    nodes.value.filter((n) => activeNodeTypes.value.has(n.type)),
  );

  const filteredLinks = computed(() => {
    const activeIds = new Set(filteredNodes.value.map((n) => n.id));
    return links.value.filter(
      (l) => activeIds.has(l.source) && activeIds.has(l.target),
    );
  });

  const stats = computed<CommNetworkStats>(() => {
    const fl = filteredLinks.value;
    const active = fl.filter((l) => l.status !== 'down');
    const avgSignal =
      fl.length > 0
        ? Math.round(
            fl.reduce((sum, l) => sum + l.signalStrength, 0) / fl.length,
          )
        : 0;
    return {
      totalNodes: filteredNodes.value.length,
      activeLinks: active.length,
      avgSignal,
      downLinks: fl.length - active.length,
    };
  });

  function toggleNodeType(type: NodeType): void {
    const next = new Set(activeNodeTypes.value);
    if (next.has(type)) {
      next.delete(type);
    } else {
      next.add(type);
    }
    activeNodeTypes.value = next;
  }

  function degradeLinks(): void {
    const count = 1 + Math.floor(Math.random() * 2);
    const updated = [...links.value];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * updated.length);
      const link = updated[idx];
      if (!link) continue;
      const delta = Math.floor(Math.random() * 40) - 15;
      const newSignal = Math.max(0, Math.min(100, link.signalStrength + delta));
      updated[idx] = {
        ...link,
        signalStrength: newSignal,
        status: statusFromSignal(newSignal),
      };
    }
    links.value = updated;
  }

  function startSimulation(): void {
    simulationTimer = setInterval(degradeLinks, 2000 + Math.random() * 1000);
  }

  function cleanup(): void {
    if (simulationTimer !== null) {
      clearInterval(simulationTimer);
      simulationTimer = null;
    }
  }

  return {
    nodes: filteredNodes,
    links: filteredLinks,
    activeNodeTypes,
    stats,
    nodeTypes: NODE_TYPES,
    toggleNodeType,
    startSimulation,
    cleanup,
  };
}
