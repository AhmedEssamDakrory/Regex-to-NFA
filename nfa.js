const splitExpressions = require('./parse');
const fs = require('fs');

let id = 0; 

function Node(expression) {
    this.expression = expression;
    this.next = [];
    this.pre = [];
    this.id = id++; 
}

const decompose = (node) => {
    const {blocks, op} = splitExpressions(node.expression);
    // OR operation
    if (op === 1) {
        const newNodes = [];
        for (let block of blocks) {
            newNodes.push(new Node(block));
        }

        const startNode = new Node("");
        const endNode = new Node("");
        startNode.next = [...newNodes];
        startNode.pre = [...node.pre];
        endNode.pre = [...newNodes];
        endNode.next = node.next;

        for (let nd of newNodes) {
            nd.next.push(endNode);
            nd.pre.push(startNode);
        }
        
        for (let next of node.next) {
            for (let i = 0; i < next.pre.length; ++i) {
                if (next.pre[i] === node) {
                    next.pre[i] = endNode;
                    break;
                }
            }
        }

        for (let pre of node.pre) {
            for (let i = 0; i < pre.next.length; ++i) {
                if (pre.next[i] === node) {
                    pre.next[i] = startNode;
                    break;
                }
            }
        }

        return {
            newNodes,
            startNode
        };
    } else if (op === 2) { // Concatination
        const newNodes = [new Node("")];

        for (let block of blocks) {
            newNodes.push(new Node(block));
        }

        newNodes.push(new Node(""));

        for (let i = 0; i < newNodes.length-1; ++i) {
            newNodes[i].next.push(newNodes[i+1]);
        }

        for (let i = 1; i < newNodes.length; ++i) {
            newNodes[i].pre.push(newNodes[i-1]);
        }

        const startNode = newNodes[0];
        const endNode = newNodes[newNodes.length-1];

        endNode.next = node.next;
        startNode.pre = node.pre;

        for (let next of node.next) {
            for (let i = 0; i < next.pre.length; ++i) {
                if (next.pre[i] === node) {
                    next.pre[i] = endNode;
                    break;
                }
            }
        }

        for (let pre of node.pre) {
            for (let i = 0; i < pre.next.length; ++i) {
                if (pre.next[i] === node) {
                    pre.next[i] = startNode;
                    break;
                }
            }
        }

        newNodes.pop();
        newNodes.shift();
        
        return {
            newNodes,
            startNode
        };
    } else if (op === 0) { // Star *
        startNode = new Node("");
        newNode = new Node(blocks[0]);
        endNode = new Node("");
        startNode.next = [newNode, endNode];
        startNode.pre = [...node.pre, newNode];
        newNode.next = [endNode, startNode];
        newNode.pre = [startNode];
        endNode.next = node.next;
        endNode.pre = [startNode, newNode];

        for (let next of node.next) {
            for (let i = 0; i < next.pre.length; ++i) {
                if (next.pre[i] === node) {
                    next.pre[i] = endNode;
                    break;
                }
            }
        }

        for (let pre of node.pre) {
            for (let i = 0; i < pre.next.length; ++i) {
                if (pre.next[i] === node) {
                    pre.next[i] = startNode;
                    break;
                }
            }
        }

        return {
            newNodes:[newNode],
            startNode
        };
    }

    return {
        newNodes: [],
        startNode: null
    };
}


const generateNFA = (RE) => {
    const queue = [];
    queue.push(new Node(RE));

    let {newNodes, startNode} = decompose(queue[0]);
    const root = startNode;
    queue.pop();
    
    for (let node of newNodes) {
        queue.push(node);
    }

    while (queue.length > 0) {
        const node = queue.pop();
        ({newNodes, startNode} = decompose(node));

        for (let nd of newNodes) {
            queue.push(nd);
        }
    }

    return root;
}

const printNFA = (root) => {
    const vis = Array.from({length: 1e5});
    vis.fill(0);

    function dfs(root) {
        if (vis[root.id]) {
            return;
        }

        vis[root.id] = 1;
        console.log(root);

        for (let node of root.next) {
            dfs(node);
        }
    }

    dfs(root);
}


const toJson = (root) => {
    const vis = Array.from({length: 1e5});
    vis.fill(0);
    const states = {};
    let state = 0;
    states.startingState = state;

    function nameStates(root) {
        if(vis[root.id]) {
            return;
        }

        vis[root.id] = 1;
        root.state = state++;

        for (let node of root.next) {
            nameStates(node);
        }
    }

    nameStates(root);
    vis.fill(0);

    function dfs (root) {
        if(vis[root.id]){
            return;
        }

        vis[root.id] = 1;
        states[root.state] = {};
        const currentState = states[root.state];
        let isTerminatingState = true;
        
        for (let node of root.next) {
            isTerminatingState = false;
            let input = node.expression; 
            if (input === "") {
                input = "epsilon";
            }

            if (!(input in currentState)) {
                currentState[input] = [];
            }

            currentState[input].push(node.state);
        }

        currentState.isTerminatingState = isTerminatingState;

        for (let node of root.next) {
            dfs(node);
        }
    }

    dfs(root);

    let nfa = JSON.stringify(states);
    fs.writeFileSync('nfa.json', nfa);
}



module.exports = {
    Node,
    decompose,
    generateNFA,
    printNFA,
    toJson
};