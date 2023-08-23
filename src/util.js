import { CellStyle, HeaderStyle, ChorusStyle, ChordStyle } from './styles';

function isHeader(line) {
  return /^\[.*\][^\r\n]*$/.test(line);
}

function isChorus(line) {
  return /^\[(Chorus|Refrein).*\]/.test(line);
}

function isChordLine(line) {
  if (line.trim().length === 0) {
    return false;
  }
  const words = line.split(/\s+/);
  for (let i = 0; i < words.length; i += 1) {
    if (words[i].length !== 0 && !/[A-G]/.test(words[i][0]) && words[i][0] !== '|' && words[i][0] !== '/') {
      return false;
    }
  }

  return true;
}

function formatCell(cell, content) {
  const lines = content.split(/\r?\n/);
  cell.setText(content);
  cell.setAttributes(CellStyle);
  const text = cell.editAsText();
  let offset = 0;
  if (isHeader(lines[0])) {
    text.setAttributes(0, lines[0].length - 1, HeaderStyle);
    offset = lines[0].length + 1;
    if (isChorus(lines[0])) {
      text.setAttributes(offset, text.getText().length - 1, ChorusStyle);
    }
    lines.shift();
  }
  lines.forEach((line) => {
    if (isChordLine(line)) {
      text.setAttributes(offset, offset + line.length - 1, ChordStyle);
    }
    offset += line.length + 1;
  });
}

export { isHeader, isChorus, isChordLine, formatCell };
