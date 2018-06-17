import { h } from 'preact';

/* Rendering helpers */

export function rlog(log) {
  return (<p class="multiline">{log.join('\n')}</p>);
}

export function rmatrix(matrix) {
  return (
    <table class="matrix-display">
      {matrix.map((row) => (<tr>{row.map((cell) => (<td>{cell}</td>))}</tr>))}
    </table>
  );
}

export function rmatrixHeadered(matrix, headings) {
  return (
    <table class="matrix-display">
      <thead>
        <th>{/* skip the first column, it's occupied by row headers */}</th>
        {headings.map((heading) => (<th>{heading}</th>))}
      </thead>
      {matrix.map((row, i) => (<tr><th>{headings[i]}</th>{row.map((cell) => (<td>{cell}</td>))}</tr>))}
    </table>
  );
}
