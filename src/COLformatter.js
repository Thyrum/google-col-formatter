import { formatCell, isHeader } from './util';

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

export { insertCOL };
