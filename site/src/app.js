import { h, render } from 'preact';
import { Router } from 'preact-router';
import { Link } from 'preact-router/match';
import createHashHistory from 'history/createHashHistory';

import HW4 from './hw4';

function App(props) {
  return (
    <div>
      <nav className="header">
        <Link className="header__link" activeClassName="active" href="/">ДМ</Link>
        <Link className="header__link" activeClassName="active" href="/4">4</Link>
      </nav>
      <main className="content">
        <Router history={createHashHistory()}>
          <Home path="/" />
          <HW4 path="/4" />
        </Router>
      </main>
    </div>
  );
}

function Home(props) {
  return (
    <div>
      <h1>Дискретная математика</h1>
      <p>Домашние задания второго семестра, ИТМО ВТ:</p>
      <ol>
        <li>Раскраска графа &mdash; проще сделать вручную</li>
        <li>
          <a href="https://github.com/thymelous/ifmo/blob/master/notes/DiscreteMath.ShortestPath.ipynb">
            Алгоритм Дейкстры (кратчайший путь)
          </a><span> </span> &mdash; оффлайн версия, необходим <a href="https://github.com/gibiansky/IHaskell">IHaskell</a>
        </li>
        <li>
          <a href="https://github.com/thymelous/ifmo/blob/master/notes/DiscreteMath.MaxFlow.ipynb">
            Алгоритм Франка-Фриша (путь с максимальной пропускной способностью)
          </a><span> </span> &mdash; оффлайн
        </li>
        <li><a href="/4">Планаризация графа</a></li>
      </ol>
    </div>
  );
}

document.addEventListener('DOMContentLoaded', () => render(<App />, document.body));
