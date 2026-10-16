// Split trusted highlight.js output without losing multiline token styling.
// Each line is balanced HTML; entities and whitespace remain untouched.
export function highlightLines(html) {
  const lines = [], open = [];
  let line = '', offset = 0;
  for (const match of html.matchAll(/<span\b[^>]*>|<\/span>|\n/g)) {
    line += html.slice(offset, match.index);
    const token = match[0];
    if (token === '\n') {
      lines.push(line + '</span>'.repeat(open.length));
      line = open.join('');
    } else {
      line += token;
      if (token === '</span>') open.pop(); else open.push(token);
    }
    offset = match.index + token.length;
  }
  lines.push(line + html.slice(offset));
  return lines;
}
