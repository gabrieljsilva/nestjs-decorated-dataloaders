import { AdjacencyGraph } from "./adjacency-graph";

describe("AdjacencyGraph", () => {
	it("should be defined", () => {
		const graph = new AdjacencyGraph<string, number>();
		expect(graph).toBeDefined();
	});

	it("should add vertices correctly", () => {
		const graph = new AdjacencyGraph<string, number>();
		graph.addVertex("A");
		graph.addVertex("B");

		const edgesA = graph.getEdges("A");
		const edgesB = graph.getEdges("B");

		expect(edgesA).toBeDefined();
		expect(edgesA?.size).toBe(0);
		expect(edgesB).toBeDefined();
		expect(edgesB?.size).toBe(0);
	});

	it("should add edges correctly", () => {
		const graph = new AdjacencyGraph<string, number>();
		graph.addEdge("A", "B", 5);

		const edgesA = graph.getEdges("A");
		const edgesB = graph.getEdges("B");

		expect(edgesA).toBeDefined();
		expect(edgesA?.get("B")).toBe(5);
		expect(edgesB?.size).toBe(0); // B should not have outgoing edges
	});

	it("should retrieve edges correctly", () => {
		const graph = new AdjacencyGraph<string, number>();
		graph.addEdge("A", "B", 5);
		graph.addEdge("A", "C", 10);

		const edges = graph.getEdges("A");

		expect(edges).toBeDefined();
		expect(edges?.size).toBe(2);
		expect(edges?.get("B")).toBe(5);
		expect(edges?.get("C")).toBe(10);
	});

	it("should transform the graph correctly", () => {
		const graph = new AdjacencyGraph<string, number>();
		graph.addEdge("A", "B", 2);
		graph.addEdge("B", "C", 3);

		const transformedGraph = graph.transform(
			(vertex) => vertex.toLowerCase(),
			(edge, vertex, neighbor) => edge * 2,
		);

		const transformedEdgesA = transformedGraph.getEdges("a");
		const transformedEdgesB = transformedGraph.getEdges("b");

		expect(transformedEdgesA).toBeDefined();
		expect(transformedEdgesA?.get("b")).toBe(4); // 2 * 2
		expect(transformedEdgesB).toBeDefined();
		expect(transformedEdgesB?.get("c")).toBe(6); // 3 * 2
	});

	it("should execute the callback on each vertex correctly", () => {
		const graph = new AdjacencyGraph<string, number>();
		graph.addEdge("A", "B", 1);
		graph.addEdge("A", "C", 2);
		graph.addEdge("B", "C", 3);

		const visitedVertices: string[] = [];
		graph.forEach((edges, vertex) => {
			visitedVertices.push(vertex);
		});

		expect(visitedVertices).toContain("A");
		expect(visitedVertices).toContain("B");
		expect(visitedVertices).toContain("C");
	});

	it("should return undefined for non-existent vertices", () => {
		const graph = new AdjacencyGraph<string, number>();

		const edges = graph.getEdges("NonExistentVertex");

		expect(edges).toBeUndefined();
	});

	it("should automatically add vertices when adding edges", () => {
		const graph = new AdjacencyGraph<string, number>();
		graph.addEdge("A", "B", 3); // A and B should be automatically added

		const edgesA = graph.getEdges("A");
		const edgesB = graph.getEdges("B");

		expect(edgesA).toBeDefined();
		expect(edgesA?.get("B")).toBe(3);
		expect(edgesB).toBeDefined();
		expect(edgesB?.size).toBe(0); // B should not have any outgoing edges
	});
});
