from pathlib import Path

def find_unmatched(path):
    s = Path(path).read_text(encoding='utf-8')
    stack = []
    in_single = in_double = in_back = False
    in_line_comment = in_block_comment = False
    i = 0
    L = len(s)
    pairs = {')':'(', ']':'[', '}':'{'}
    opens = set(pairs.values())
    while i < L:
        ch = s[i]
        nxt = s[i+1] if i+1 < L else ''
        if in_line_comment:
            if ch == '\n': in_line_comment = False
            i += 1
            continue
        if in_block_comment:
            if ch == '*' and nxt == '/':
                in_block_comment = False
                i += 2
                continue
            i += 1
            continue
        if not (in_single or in_double or in_back):
            if ch == '/' and nxt == '/':
                in_line_comment = True; i += 2; continue
            if ch == '/' and nxt == '*':
                in_block_comment = True; i += 2; continue
        if ch == "'" and not (in_double or in_back) and not in_line_comment and not in_block_comment:
            in_single = not in_single
            i += 1; continue
        if ch == '"' and not (in_single or in_back) and not in_line_comment and not in_block_comment:
            in_double = not in_double
            i += 1; continue
        if ch == '`' and not (in_single or in_double) and not in_line_comment and not in_block_comment:
            in_back = not in_back
            i += 1; continue
        if not (in_single or in_double or in_back or in_line_comment or in_block_comment):
            if ch in opens:
                stack.append((ch, i))
            elif ch in pairs:
                if not stack or stack[-1][0] != pairs[ch]:
                    ln = s.count('\n', 0, i) + 1
                    col = i - s.rfind('\n', 0, i)
                    start = max(0, i-120); end = min(len(s), i+120)
                    print(f"Unmatched closing '{ch}' at line {ln} col {col}")
                    st = stack[-10:]
                    pretty = []
                    for ch,posi in st:
                        ln = s.count('\n',0,posi)+1
                        pretty.append((ch, ln))
                    print('Stack top (last 10) with line numbers:', pretty)
                    print('\nContext:\n' + s[start:end])
                    return
                stack.pop()
        i += 1
    if stack:
        ch,pos = stack[-1]
        ln = s.count('\n',0,pos)+1
        col = pos - s.rfind('\n',0,pos)
        print(f"Unclosed '{ch}' at line {ln} col {col}")
    else:
        print('All delimiters balanced')

if __name__ == '__main__':
    find_unmatched(r'C:\Users\ADMIN\OneDrive\Attachments\Desktop\AgriZip\Microfinance\frontend\src\pages\AdminDashboard.jsx')
