import { h, Component } from 'preact';
import { MatrixInput } from './matrix-input';
import solvehw4 from './hw4';

export class HW4 extends Component {
  constructor(props) {
    super(props);
    this.solve = this.solve.bind(this);

    this.state = { solution: null };
  }

  exampleMatrix() {
    return [
      [0, 1, 1, 1, 0, 0, 0],
      [1, 0, 1, 0, 1, 0, 1],
      [1, 1, 0, 1, 1, 1, 1],
      [1, 0, 1, 0, 1, 1, 1],
      [0, 1, 1, 1, 0, 1, 0],
      [0, 0, 1, 1, 1, 0, 1],
      [0, 1, 1, 1, 0, 1, 0]
    ];
  }

  solve(matrix) {
    this.setState({ solution: solvehw4(matrix) });
  }

  componentDidUpdate() {
    /* We need to typeset the solution after updating it */
    this.state.solution && MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
  }

  render() {
    /* HACK: remove all mathjax previews */
    const soultion = document.getElementById('solution');
    (typeof solution !== 'undefined') && solution.parentNode.removeChild(solution);

    return (
      <div>
        <h1>4. Планаризация графа</h1>
        <MatrixInput exampleMatrix={this.exampleMatrix()} onSubmit={this.solve} />
        <div id="solution">{this.state.solution}</div>
      </div>
    );
  }
}
