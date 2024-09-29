"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdjacencyGraph = void 0;
class AdjacencyGraph {
    constructor() {
        this.adjacencyList = new Map();
    }
    addVertex(vertex) {
        if (!this.adjacencyList.has(vertex)) {
            this.adjacencyList.set(vertex, new Map());
        }
    }
    addEdge(vertex1, vertex2, edge) {
        var _a;
        if (!this.adjacencyList.has(vertex1)) {
            this.addVertex(vertex1);
        }
        if (!this.adjacencyList.has(vertex2)) {
            this.addVertex(vertex2);
        }
        (_a = this.adjacencyList.get(vertex1)) === null || _a === void 0 ? void 0 : _a.set(vertex2, edge);
    }
    getEdges(vertex) {
        return this.adjacencyList.get(vertex);
    }
    transform(resolveVertexFn, resolveEdgesFn) {
        const newGraph = new AdjacencyGraph();
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
    forEach(callbackFn) {
        this.adjacencyList.forEach(callbackFn);
    }
}
exports.AdjacencyGraph = AdjacencyGraph;
//# sourceMappingURL=adjacency-graph.js.map