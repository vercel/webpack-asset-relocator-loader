const { encode, decode } = require('sourcemap-codec');

function traceSegment (map, mappings, line, column, name) {
  const segments = mappings[line];
  if (!segments) return null;

  // binary search through segments for the given column
  let i = 0;
  let j = segments.length - 1;

  while (i <= j) {
    const m = (i + j) >> 1;
    const segment = segments[m];
    if (segment[0] === column) {
      return {
        source: segment[1],
        line: segment[2],
        column: segment[3],
        name: map.names[segment[4]] || name
      };
    }
    if (segment[0] > column)
      j = m - 1;
    else
      i = m + 1;
  }

  return null;
}

module.exports = function (baseMap, extendMap) {
  const sources = [];
  const sourcesContent = [];
  const names = [];
  const mappings = [];

  const baseMapMappings = decode(baseMap.mappings);

  for (const line of decode(extendMap.mappings)) {
    const tracedLine = [];

    for (const segment of line) {
      const traced = traceSegment(baseMap, baseMapMappings, segment[2], segment[3], extendMap.names[segment[4]]);
      if (traced) {
        const source = baseMap.sources[traced.source];
        let sourceIndex = sources.lastIndexOf(source);
        if (sourceIndex === -1) {
          sourceIndex = sources.length;
          sources.push(source);
          sourcesContent[sourceIndex] = baseMap.sourcesContent[traced.source];
        }
        else if (sourcesContent[sourceIndex] == null) {
          sourcesContent[sourceIndex] = baseMap.sourcesContent[traced.source];
        }
        const tracedSegment = [segment[0], sourceIndex, traced.line, traced.column];
        if (traced.name) {
          let nameIndex = names.indexOf(traced.name);
          if (nameIndex === -1) {
            nameIndex = names.length;
            names.push(traced.name);
          }
          tracedSegment[4] = nameIndex;
        }
        tracedLine.push(tracedSegment);
      }
    }

    mappings.push(tracedLine);
  }

  return {
    version: 3,
    file: null,
    sources,
    mappings: encode(mappings),
    names,
    sourcesContent
  };
};
