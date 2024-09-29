export declare class AdjacencyGraph<V, E> {
    private readonly adjacencyList;
    constructor();
    addVertex(vertex: V): void;
    addEdge(vertex1: V, vertex2: V, edge: E): void;
    getEdges(vertex: V): Map<V, E>;
    transform<NewVertex, NewEdges>(resolveVertexFn: (vertex: V) => NewVertex, resolveEdgesFn: (edge: E, vertex: NewVertex, neighbor: NewVertex) => NewEdges): AdjacencyGraph<NewVertex, NewEdges>;
    forEach(callbackFn: (value: Map<V, E>, key: V, map: Map<V, Map<V, E>>) => void): void;
}
