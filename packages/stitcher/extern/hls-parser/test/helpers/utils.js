const HLS = require('../..');

HLS.setOptions({strictMode: true});

function parsePass(t, text) {
  let obj;
  try {
    obj = HLS.parse(text);
  } catch (err) {
    t.fail(err.stack);
  }
  t.truthy(obj);
  return obj;
}

function stringifyPass(t, obj) {
  let text;
  try {
    text = HLS.stringify(obj);
  } catch (err) {
    t.fail(err.stack);
  }
  t.truthy(text);
  return text;
}

function bothPass(t, text) {
  const obj = parsePass(t, text);
  return stringifyPass(t, obj);
}

function parseFail(t, text) {
  try {
    HLS.parse(text);
  } catch (err) {
    return t.truthy(err);
  }
  t.fail('HLS.parse() did not fail');
}

function stringifyFail(t, obj) {
  try {
    HLS.stringify(obj);
  } catch (err) {
    return t.truthy(err);
  }
  t.fail('HLS.stringify() did not fail');
}

function stripSpaces(text) {
  const chars = [];
  let insideDoubleQuotes = false;
  for (const ch of text) {
    if (ch === '"') {
      insideDoubleQuotes = !insideDoubleQuotes;
    } else if (ch === ' ') {
      if (!insideDoubleQuotes) {
        continue;
      }
    }
    chars.push(ch);
  }
  return chars.join('');
}

function stripCommentsAndEmptyLines(text) {
  const lines = [];
  for (const l of text.split('\n')) {
    const line = l.trim();
    if (!line) {
      // empty line
      continue;
    }
    if (line.startsWith('#')) {
      if (line.startsWith('#EXT')) {
        // tag
        lines.push(stripSpaces(line));
      }
      // comment
      continue;
    }
    // uri
    lines.push(line);
  }
  return lines.join('\n');
}

module.exports = {
  parsePass,
  stringifyPass,
  bothPass,
  parseFail,
  stringifyFail,
  stripCommentsAndEmptyLines
};
