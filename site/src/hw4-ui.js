import { h, Component } from 'preact';
import solvehw4 from './hw4';

export class HW4 extends Component {
  constructor(props) {
    super(props);
    this.solve = this.solve.bind(this);

    this.state = { storedMatrix: this.loadStoredMatrix(), solution: null };
  }

  loadStoredMatrix() {
    const matrix = localStorage.getItem('hw-matrix');
    if (matrix !== null) {
      return JSON.parse(matrix);
    }
    else return [];
  }

  solve(matrix) {
    this.setState({ storedMatrix: matrix, solution: solvehw4(matrix) });
    localStorage.setItem('hw-matrix', JSON.stringify(matrix));
  }

  componentDidUpdate() {
    /* We need to typeset the solution after updating it */
    this.state.solution && MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
  }

  render() {
    /* HACK: remove all mathjax previews */
    const soultion = document.getElementById('solution');
    (typeof solution !== 'undefined') && solution.parentNode.removeChild(solution);

    const vertexNum = (this.state.storedMatrix.length > 0) ? this.state.storedMatrix.length : 7;

    return (
      <div>
        <h1>4. Планаризация графа</h1>
        <MatrixInput vertexNum={vertexNum} defaultMatrix={this.state.storedMatrix} onSubmit={this.solve} />
        <div id="solution">{this.state.solution}</div>
      </div>
    );
  }
}

function run(matrix) {
  console.log(matrix);
}

class MatrixInput extends Component {
  constructor(props) {
    super(props);
    this.updateVertexNum = this.updateVertexNum.bind(this);
    this.updateMatrix = this.updateMatrix.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.loadExampleMatrix = this.loadExampleMatrix.bind(this);

    this.state = { vertexNum: props.vertexNum, matrix: props.defaultMatrix };
  }

  updateVertexNum(e) {
    const { matrix } = this.state;
    const vertexNum = parseInt(e.target.value, 10);
    if (!isNaN(vertexNum)) this.setState({ vertexNum, matrix });
  }

  updateMatrix(e) {
    const val = parseInt(e.target.value, 2) === 1 ? 1 : 0;
    const i = parseInt(e.target.getAttribute('i'), 10);
    const j = parseInt(e.target.getAttribute('j'), 10);

    const { vertexNum, matrix } = this.state;

    if (!matrix[i]) matrix[i] = []
    matrix[i][j] = val;

    this.setState({ vertexNum, matrix });
    
    console.log(e);
  }

  onSubmit(e) {
    e.preventDefault();

    const { vertexNum, matrix } = this.state;
    const inputMatrix = Array(vertexNum).fill().map((_, i) =>
      Array(vertexNum).fill().map((_, j) => matrix[i] && matrix[i][j] && matrix[i][j] || 0)
    )
    this.props.onSubmit(inputMatrix);
  }

  loadExampleMatrix() {
    this.setState({ vertexNum: 7, matrix: [
      [0, 1, 1, 1, 0, 0, 0], 
      [1, 0, 1, 0, 1, 0, 1],
      [1, 1, 0, 1, 1, 1, 1],
      [1, 0, 1, 0, 1, 1, 1],
      [0, 1, 1, 1, 0, 1, 0],
      [0, 0, 1, 1, 1, 0, 1],
      [0, 1, 1, 1, 0, 1, 0]
    ] });
  }

  render() {
    const { vertexNum, matrix } = this.state;
    const fields = Array(vertexNum).fill().map((_, i) =>
      <li>{
        Array(vertexNum).fill().map((_, j) =>
          <input type="number" className="matrix-input__item" min="0" max="1"
                 value={matrix[i] && matrix[i][j] || 0} i={i} j={j}
                 key={i * vertexNum + j} onChange={this.updateMatrix}/>)
      }</li>
    );
    return (
      <form onSubmit={this.onSubmit} className="matrix-input">
        <p>
          <label for="vertexNum">Число вершин в графе: </label>
          <input id="vertexNum" type="number" min="1" name="vertexNum" onChange={this.updateVertexNum} value={vertexNum} />
        </p>
        <p>
          <label for="matrix">Матрица смежности: </label>
        </p>
        <button type="button" onClick={this.loadExampleMatrix}>Заполнить примером из методички</button>
        <ul id="matrix" className="matrix-input__grid">{fields}</ul>
        <button type="submit">Рассчитать</button>
      </form>
    );
  }
}
