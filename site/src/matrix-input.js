import { h, Component } from 'preact';

export class MatrixInput extends Component {
  constructor(props) {
    super(props);
    this.updateVertexNum = this.updateVertexNum.bind(this);
    this.updateMatrix = this.updateMatrix.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.loadExampleMatrix = () => this.setState({ vertexNum: props.exampleMatrix.length, matrix: props.exampleMatrix });

    const storedMatrix = this.loadStoredMatrix();
    const vertexNum = storedMatrix.length > 0 ? storedMatrix.length : props.exampleMatrix.length;

    this.state = { vertexNum: vertexNum, matrix: storedMatrix };
  }

  loadStoredMatrix() {
    const matrix = localStorage.getItem('hw-matrix');
    return matrix && JSON.parse(matrix) || [];
  }

  onSubmit(e) {
    e.preventDefault();

    const { vertexNum, matrix } = this.state;
    const inputMatrix = Array(vertexNum).fill().map((_, i) =>
      Array(vertexNum).fill().map((_, j) => matrix[i] && matrix[i][j] && matrix[i][j] || 0)
    )

    localStorage.setItem('hw-matrix', JSON.stringify(inputMatrix));
    this.props.onSubmit(inputMatrix);
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
