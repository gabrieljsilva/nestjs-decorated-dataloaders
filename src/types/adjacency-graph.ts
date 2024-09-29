export class AdjacencyGraph<V, E> {
	private readonly adjacencyList: Map<V, Map<V, E>>;

	constructor() {
		this.adjacencyList = new Map();
	}

	addVertex(vertex: V) {
		if (!this.adjacencyList.has(vertex)) {
			this.adjacencyList.set(vertex, new Map());
		}
	}

	addEdge(vertex1: V, vertex2: V, edge: E) {
		if (!this.adjacencyList.has(vertex1)) {
			this.addVertex(vertex1);
		}

		if (!this.adjacencyList.has(vertex2)) {
			this.addVertex(vertex2);
		}
		this.adjacencyList.get(vertex1)?.set(vertex2, edge);
	}

	getEdges(vertex: V) {
		return this.adjacencyList.get(vertex);
	}

	transform<NewVertex, NewEdges>(
		resolveVertexFn: (vertex: V) => NewVertex,
		resolveEdgesFn: (edge: E, vertex: NewVertex, neighbor: NewVertex) => NewEdges,
	) {
		const newGraph = new AdjacencyGraph<NewVertex, NewEdges>();
		for (const [vertex, edges] of this.adjacencyList) {
			const resolvedVertex = resolveVertexFn(vertex);
			newGraph.addVertex(resolvedVertex);
			for (const [neighbor, value] of edges) {
				const resolvedNeighbor = resolveVertexFn(neighbor);
				newGraph.addEdge(resolvedVertex, resolvedNeighbor, resolveEdgesFn(value, resolvedVertex, resolvedNeighbor));
			}
		}
		return newGraph;
	}

	forEach(callbackFn: (value: Map<V, E>, key: V, map: Map<V, Map<V, E>>) => void) {
		this.adjacencyList.forEach(callbackFn);
	}
}
