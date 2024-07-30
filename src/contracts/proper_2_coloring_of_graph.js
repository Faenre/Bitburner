/*
Proper 2-Coloring of a Graph

You are given the following data, representing a graph:
[13,[[3,8],[7,9],[3,10],[5,10],[0,8],[2,10],[0,10],[1,4],[2,12],[8,12],[6,7],[0,11],[3,11],[4,6],[3,12],[0,4],[5,11],[9,11],[9,12],[1,10],[6,12],[2,7],[1,7],[3,7],[2,8],[3,4]]]

Note that "graph", as used here, refers to the field of graph theory, 
and has no relation to statistics or plotting. 
The first element of the data represents the number of vertices in the graph. 
Each vertex is a unique number between 0 and 12. 
The next element of the data represents the edges of the graph. 
Two vertices u,v in a graph are said to be adjacent if there exists an edge [u,v]. 
Note that an edge [u,v] is the same as an edge [v,u], as order does not matter. 

You must construct a 2-coloring of the graph, meaning that you have to assign each 
vertex in the graph a "color", either 0 or 1, such that no two adjacent vertices have 
the same color. 

Submit your answer in the form of an array, where element i represents the color of vertex i. 
If it is impossible to construct a 2-coloring of the given graph, instead submit an empty array.

Examples:

Input: [4, [[0, 2], [0, 3], [1, 2], [1, 3]]]
Output: [0, 0, 1, 1]

Input: [3, [[0, 1], [0, 2], [1, 2]]]
Output: []

*/

/** @param {NS} ns */
export async function main(ns) {
  const sample1 = [4, [[0, 2], [0, 3], [1, 2], [1, 3]]];
  const answer1 = [0, 0, 1, 1];

  const sample2 = [3, [[0, 1], [0, 2], [1, 2]]];
  const answer2 = [];

  ns.tail();
  ns.print(JSON.stringify(solve(sample1, ns)) === JSON.stringify(answer1));
  ns.print(JSON.stringify(solve(sample2, ns)) === JSON.stringify(answer2));
}

/**
 * Basic approach:
 * Populate an array with Vertex objects
 * Apply connections between them
 * Starting from index 0, set colors
 * If any index already has a color and it does not match, return [] immediately
 */

/**
 * @param {Array<Number, Array<Number>>}} inputData The given vertices 
 */
export default function solve(inputData, ns) {
  const newVertex = (i) => {
    const edges = [];
    let color = null;
    return { i, edges, color }
  }
  // Populate the array with Vertex objects
  const vertices = [];
  for (let i = 0; i < inputData[0]; i++) 
    vertices.push(newVertex(i));

  // Apply connections
  const addConnection = (a, b) => {
    vertices[a].edges.push(vertices[b]);
    vertices[b].edges.push(vertices[a]);
  }
  inputData[1].forEach(edge => addConnection(...edge));

  // Apply colors
  const opposite = (c) => c ? 0 : 1;
  let failure = false;
  const applyColors = (v, mem) => {
    if (mem.has(v.i)) return;
    mem.add(v.i);
    v.edges.forEach(e => {
      if (e.color === v.color) failure = true;
      e.color = opposite(v.color);
      applyColors(e, mem)
    })
  }
  vertices[0].color = 0;
  applyColors(vertices[0], new Set());
  
  return failure ? [] : vertices.map(v => v.color);
}
