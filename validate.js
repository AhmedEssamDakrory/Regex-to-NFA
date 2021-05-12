const check_brackets = (s) => {
    // check brackets
    const st = [];
    for (let x of s) {
        if (x === '(') {
            st.push(x);
        } else if (x === ')') {
            if (st.length === 0) {
                return false;
            } else {
                st.pop();
            }
        }
    }

    if (st.length !== 0) {
        return false;
    }

    return true;
}

const validate_regex = (s) => {
    if (!check_brackets(s)) {
        return false;
    }

    // '|a', '+a', '*a'
    if (s[0] === '|' || s[0] === '+' || s[0] === '*') {
        return false;
    }

    // 'a|', 'a+'
    if (s[s.length-1] === '|' || s[s.length-1] === '+') {
        return false;
    }
    
    for (let i = 1; i < s.length; ++i) {
        // '++', '+|', '||'
        if ( (s[i] === '+' || s[i] === '|' ) && (s[i-1] === '+' || s[i] === '|')) {
            return false;
        }

        // '**'
        if (s[i] === '*' && s[i-1] === '*') {
            return false;
        }

        // 'a+*b', 'a|*b'
        if (s[i] === '*' && (s[i-1] === '+' || s[i-1] === '|')) {
            return false;
        }
    }

    return true;
}

module.exports = {
    validate_regex
}