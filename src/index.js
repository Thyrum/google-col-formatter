// =========
//  util.gs
// =========

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

const CellStyle = {};
CellStyle[DocumentApp.Attribute.FONT_FAMILY] = 'Ubuntu Mono';
CellStyle[DocumentApp.Attribute.FONT_SIZE] = 11;
CellStyle[DocumentApp.Attribute.FOREGROUND_COLOR] = '#000000';
CellStyle[DocumentApp.Attribute.PADDING_BOTTOM] = 0;
CellStyle[DocumentApp.Attribute.PADDING_LEFT] = 0;
CellStyle[DocumentApp.Attribute.PADDING_TOP] = 0;
CellStyle[DocumentApp.Attribute.PADDING_RIGHT] = 0;
CellStyle[DocumentApp.Attribute.LINE_SPACING] = 1;

const HeaderStyle = {};
HeaderStyle[DocumentApp.Attribute.FOREGROUND_COLOR] = '#3c78d8';

const ChorusStyle = {};
ChorusStyle[DocumentApp.Attribute.FOREGROUND_COLOR] = '#cc0000';

const ChordStyle = {};
ChordStyle[DocumentApp.Attribute.BOLD] = true;

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

/* What should the add-on do when a document is opened */
function onOpen() {
  DocumentApp.getUi()
    .createAddonMenu() // Add a new option in the Google Docs Add-ons Menu
    .addItem('Insert Chords-Over-Lyrics', 'showCOLSidebar')
    .addItem('Transpose', 'showTransposeBar')
    .addToUi(); // Run the showSidebar function when someone clicks the menu
}
/* What should the add-on do after it is installed */
function onInstall() {
  onOpen();
}

/* Show a 300px sidebar with the HTML from chords-over-lyrics.html */
function showCOLSidebar() {
  const html = HtmlService.createTemplateFromFile('chords-over-lyrics').evaluate().setTitle('Chords Over Lyrics Input'); // The title shows in the sidebar
  DocumentApp.getUi().showSidebar(html);
}

function showTransposeBar() {
  const html = HtmlService.createTemplateFromFile('transpose.html').evaluate().setTitle('Transpose');
  DocumentApp.getUi().showSidebar(html);
}

// ===============
//  Transposer.gs
// ===============

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
  return line.replace(/[CDEFGAB](#|b)?/g, function (match) {
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

// ==============================
//  chords-over-lyrics-formatter
// ==============================

function insertTable(atCursor) {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  let thisTable;

  if (atCursor) {
    const cursor = doc.getCursor();
    if (cursor) {
      const element = cursor.getElement();
      if (element) {
        const parent = element.getParent();
        thisTable = body.insertTable(parent.getChildIndex(element) + 1);
      } else {
        alert('Cannot insert there');
      }
    } else {
      alert('Could not get cursor position');
    }
  } else {
    thisTable = body.appendTable();
  }

  return thisTable;
}

function addRow(paragraph, table) {
  const tr = table.appendTableRow();
  formatCell(tr.appendTableCell(), paragraph);
}

/* This Google Script function does all the magic. */
function insertCOL(text) {
  // Split all paragraphs
  const splitted = text.split(/\n\s*\n/).map((par) => par.replace(/^\s*$(?:\r\n?|\n)/gm, ''));
  const table = insertTable(true);
  let prevParagraph = '';

  splitted.forEach((paragraph) => {
    if (isHeader(paragraph)) {
      prevParagraph = `${paragraph}\n`;
    } else {
      addRow(`${prevParagraph + paragraph}\n`, table);
      prevParagraph = '';
    }
  });
}

global.onOpen = onOpen;
global.onInstall = onInstall;
global.showCOLSidebar = showCOLSidebar;
global.showTransposeBar = showTransposeBar;
global.updateTranspose = updateTranspose;
global.insertCOL = insertCOL;
