var graph = require('./crawls/graph1.json');

for(var i in graph.iplinks) {
	console.log(graph.iplinks[i].source)
}
console.log("---")
for(var i in graph.iplinks) {
	console.log(graph.iplinks[i].target)
}