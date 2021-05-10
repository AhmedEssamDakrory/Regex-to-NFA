const splitExpressions = (s) => {
    if (s.length === 1) {
        return {
            blocks: [s],
            op: -1 // empty
        };
    } 
    
    if (s.length === 2 && s[1] === '*') {
        return { 
            blocks: [s[0]],
            op: 0 // Star 
        };
    }
    
    if (s[0] == '(' && s[s.length-2] === ')' && s[s.length-1] === '*') {
        let st = []
        let i = 0;
        for (; i < s.length; ++i) {
            if (s[i] === '(') {
                st.push(i)
            } else if (s[i] == ')') {
                st.pop()
            }

            if (st.length === 0) {
                break;
            }
        }

        if (i === s.length-2) {
            return {
                blocks: [s.slice(1, s.length-2)],
                op: 0 // star 
            };
        }
    }

    let limits = [-1], st = [], op = 1;
    for (let i = 0; i < s.length; ++i) {
        if(s[i] === '(') {
            st.push(i);
        } else if (s[i] === ')') {
            st.pop();
        } else if (s[i] === '+' || s[i] === '|') {
            if (st.length === 0) {
                limits.push(i);
            }
        }
    }

    if (limits.length === 1) {
        limits[0] = 0
        op = 2;
        for (let i = 0; i < s.length; ++i) {
            if (s[i] == '(') {
                st.push(i);
            } else if (s[i] == ')') {
                st.pop();
            } else if (s[i] !== '*' && st.length === 0) {
                limits.push(i);
            } 
        }  
    }

    limits.push(s.length);
    blocks = [];

    for (let i = 0; i < limits.length-1; ++i) {
        let b;
        if (op === 1) {
            b = s.slice(limits[i]+1, limits[i+1]);
        } else {
            b = s.slice(limits[i], limits[i+1]);
        }
        
        if(b[0] == '(' && b[b.length-1] == ')') {
            b = b.slice(1, b.length-1);
        }
        
        if (b === "") {
            continue;
        }

        blocks.push(b);
    }

    return {
        blocks: blocks,
        op: op // or = 1, concat = '2'
    }; 
    
}

module.exports = splitExpressions