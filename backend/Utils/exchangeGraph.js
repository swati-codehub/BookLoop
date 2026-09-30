const buildExchangeGraph = (exchanges) => {
    const graph = {};

    exchanges.forEach(exchange => {
        const requester = exchange.requester.toString();
        const owner = exchange.owner.toString();

        if (!graph[requester]) {
            graph[requester] = [];
        }

        graph[requester].push(owner);
    });

    return graph;
};

const findExchangeCycles = (graph) => {
    const cycles = [];
    const visited = new Set();

    const dfs = (current, path) => {
        if (path.includes(current)) {
            const cycleStart = path.indexOf(current);
            const cycle = path.slice(cycleStart);

            cycles.push([...cycle, current]);
            return;
        }

        if (visited.has(current)) {
            return;
        }

        visited.add(current);

        const neighbors = graph[current] || [];

        for (const neighbor of neighbors) {
            dfs(neighbor, [...path, current]);
        }
    };

    for (const user of Object.keys(graph)) {
        dfs(user, []);
    }

    return cycles;
};

module.exports = {
    buildExchangeGraph,
    findExchangeCycles
};