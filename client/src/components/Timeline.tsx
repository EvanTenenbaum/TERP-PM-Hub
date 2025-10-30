import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface TimelineProps {
  items: Array<{
    id: number;
    itemId: string;
    type: string;
    title: string;
    status: string;
    related?: string[] | null;
    metadata?: any;
  }>;
}

const statusColors = {
  inbox: '#6b7280',
  backlog: '#3b82f6',
  planned: '#8b5cf6',
  'in-progress': '#eab308',
  completed: '#22c55e',
  'on-hold': '#f97316',
  archived: '#9ca3af',
};

export default function Timeline({ items }: TimelineProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Group items by status
    const statusGroups: Record<string, typeof items> = {};
    items.forEach((item) => {
      if (!statusGroups[item.status]) {
        statusGroups[item.status] = [];
      }
      statusGroups[item.status].push(item);
    });

    // Create nodes for each item
    const statuses = ['inbox', 'backlog', 'planned', 'in-progress', 'completed'];
    let yOffset = 0;

    statuses.forEach((status, statusIndex) => {
      const itemsInStatus = statusGroups[status] || [];
      const xOffset = statusIndex * 300;

      itemsInStatus.forEach((item, index) => {
        nodes.push({
          id: item.itemId,
          type: 'default',
          position: { x: xOffset, y: yOffset + index * 100 },
          data: {
            label: (
              <div className="text-xs">
                <div className="font-semibold truncate max-w-[200px]">{item.title}</div>
                <div className="text-gray-500">{item.itemId}</div>
              </div>
            ),
          },
          style: {
            background: statusColors[status as keyof typeof statusColors] || '#gray',
            color: 'white',
            border: '1px solid #222',
            borderRadius: '8px',
            padding: '10px',
            width: 220,
          },
        });

        // Create edges for dependencies
        if (item.related && Array.isArray(item.related)) {
          item.related.forEach((relatedId: string) => {
            edges.push({
              id: `${item.itemId}-${relatedId}`,
              source: relatedId,
              target: item.itemId,
              type: 'smoothstep',
              animated: true,
              markerEnd: {
                type: MarkerType.ArrowClosed,
              },
            });
          });
        }
      });

      yOffset += (itemsInStatus.length + 1) * 100;
    });

    return { nodes, edges };
  }, [items]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-full h-[600px] border rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
