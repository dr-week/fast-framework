import { signal, batch } from '@zuari/signals';
import { html, render } from '@zuari/dom';

let nextId = 1;
const adjectives = ['pretty', 'large', 'big', 'small', 'tall', 'short', 'long', 'handsome', 'plain', 'quaint', 'clean', 'elegant', 'easy', 'angry', 'crazy', 'helpful', 'mushy', 'odd', 'unsightly', 'adorable', 'important', 'inexpensive', 'cheap', 'expensive', 'fancy'];
const colours = ['red', 'yellow', 'blue', 'green', 'pink', 'brown', 'purple', 'brown', 'white', 'black', 'orange'];
const nouns = ['table', 'chair', 'house', 'bbq', 'desk', 'car', 'pony', 'cookie', 'sandwich', 'burger', 'pizza', 'mouse', 'keyboard'];

function _random(max) {
  return Math.round(Math.random() * 1000) % max;
}

function buildData(count = 1000) {
  const data = new Array(count);
  for (let i = 0; i < count; i++) {
    data[i] = {
      id: nextId++,
      label: signal(`${adjectives[_random(adjectives.length)]} ${colours[_random(colours.length)]} ${nouns[_random(nouns.length)]}`)
    };
  }
  return data;
}

const data = signal([]);
const selected = signal(null);

function run() {
  data.value = buildData(1000);
  selected.value = null;
}

function runLots() {
  data.value = buildData(10000);
  selected.value = null;
}

function add() {
  data.value = data.value.concat(buildData(1000));
}

function update() {
  batch(() => {
    const list = data.value;
    for (let i = 0; i < list.length; i += 10) {
      list[i].label.value += ' !!!';
    }
  });
}

function clear() {
  data.value = [];
  selected.value = null;
}

function swapRows() {
  const list = data.value;
  if (list.length > 998) {
    const nextList = list.slice();
    const temp = nextList[1];
    nextList[1] = nextList[998];
    nextList[998] = temp;
    data.value = nextList;
  }
}

function remove(id) {
  const list = data.value;
  const idx = list.findIndex(d => d.id === id);
  if (idx >= 0) {
    const copy = list.slice();
    copy.splice(idx, 1);
    data.value = copy;
  }
}

function select(id) {
  selected.value = id;
}

const tableBody = document.createElement('tbody');
tableBody.id = 'tbody';

let renderedRows = new Map();

data.subscribe((rows) => {
  const currentSelected = selected.value;
  const newMap = new Map();
  const frag = document.createDocumentFragment();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let rowEl = renderedRows.get(row.id);

    if (!rowEl) {
      const tr = document.createElement('tr');
      tr.id = String(row.id);
      if (row.id === currentSelected) {
        tr.className = 'danger';
      }

      const rowView = html`
        <td class="col-md-1">${row.id}</td>
        <td class="col-md-4">
          <a class="lbl" @click=${() => select(row.id)}>${row.label}</a>
        </td>
        <td class="col-md-1">
          <a class="remove" @click=${() => remove(row.id)}>
            <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
          </a>
        </td>
        <td class="col-md-6"></td>
      `;
      const { fragment } = render(rowView);
      tr.appendChild(fragment);
      rowEl = tr;
    } else {
      if (row.id === currentSelected && rowEl.className !== 'danger') {
        rowEl.className = 'danger';
      } else if (row.id !== currentSelected && rowEl.className === 'danger') {
        rowEl.className = '';
      }
    }

    newMap.set(row.id, rowEl);
    frag.appendChild(rowEl);
  }

  tableBody.textContent = '';
  tableBody.appendChild(frag);
  renderedRows = newMap;
});

selected.subscribe((selId) => {
  renderedRows.forEach((el, id) => {
    if (id === selId) {
      el.className = 'danger';
    } else if (el.className === 'danger') {
      el.className = '';
    }
  });
});

const appView = html`
  <div class="container">
    <div class="jumbotron">
      <div class="row">
        <div class="col-md-6">
          <h1>Zuari (keyed)</h1>
        </div>
        <div class="col-md-6">
          <div class="row">
            <div class="col-sm-6 smallpad">
              <button type="button" class="btn btn-primary btn-block" id="run" @click=${run}>Create 1,000 rows</button>
            </div>
            <div class="col-sm-6 smallpad">
              <button type="button" class="btn btn-primary btn-block" id="runlots" @click=${runLots}>Create 10,000 rows</button>
            </div>
            <div class="col-sm-6 smallpad">
              <button type="button" class="btn btn-primary btn-block" id="add" @click=${add}>Append 1,000 rows</button>
            </div>
            <div class="col-sm-6 smallpad">
              <button type="button" class="btn btn-primary btn-block" id="update" @click=${update}>Update every 10th row</button>
            </div>
            <div class="col-sm-6 smallpad">
              <button type="button" class="btn btn-primary btn-block" id="clear" @click=${clear}>Clear</button>
            </div>
            <div class="col-sm-6 smallpad">
              <button type="button" class="btn btn-primary btn-block" id="swaprows" @click=${swapRows}>Swap Rows</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <table class="table table-hover table-striped test-data">
    </table>
    <span class="preloadicon glyphicon glyphicon-remove" aria-hidden="true"></span>
  </div>
`;

const root = document.getElementById('main');
const { fragment } = render(appView);
const table = fragment.querySelector('table');
table.appendChild(tableBody);
root.appendChild(fragment);
