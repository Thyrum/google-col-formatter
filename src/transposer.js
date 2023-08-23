import { formatCell, isChordLine } from './util';

function getTable() {
  const doc = DocumentApp.getActiveDocument();
  const cursor = doc.getCursor();
  if (!cursor) {
    return null;
  }
  let element = cursor.getElement();
  while (element && element.getType() !== DocumentApp.ElementType.TABLE) {
    element = element.getParent();
  }
  if (element) {
    return element.asTable();
  }
  return null;
}

const SCALE = [
  [['C', 'C'], ['B#']],
  [['C#', 'Db'], []],
  [['D', 'D'], []],
  [['D#', 'Eb'], []],
  [['E', 'E'], ['Fb']],
  [['F', 'F'], ['E#']],
  [['F#', 'Gb'], []],
  [['G', 'G'], []],
  [['G#', 'Ab'], []],
  [['A', 'A'], []],
  [['A#', 'Bb'], []],
  [['B', 'B'], ['Cb']],
];

function mod(a, b) {
  return ((a % b) + b) % b;
}

function transposeLine(line, offset, accidental) {
  return line.replace(/[CDEFGAB](#|b)?/g, (match) => {
    const oldIndex = SCALE.findIndex((options) => options[0].includes(match) || options[1].includes(match));
    const newIndex = mod(oldIndex + offset, SCALE.length);
    return SCALE[newIndex][0][accidental === '#' ? 0 : 1];
  });
}

function updateTranspose(offset, accidental) {
  const ui = DocumentApp.getUi();
  const table = getTable();

  if (!table) {
    ui.alert('Please make sure your cursor is inside a table');
    return;
  }

  for (let row = 0; row < table.getNumRows(); row += 1) {
    const cell = table.getCell(row, 0);
    const paragraph = cell.getText();
    const lines = paragraph.split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      if (isChordLine(lines[i])) {
        lines[i] = transposeLine(lines[i], offset, accidental);
      }
    }
    formatCell(cell, lines.join('\n'));
  }
}

export { updateTranspose };
