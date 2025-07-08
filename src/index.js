import {
  CellStyle,
  ParagraphStyle,
  HeaderStyle,
  ChorusStyle,
  ChordStyle,
  TableStyle,
} from "./styles";

const DEV = true;

function onOpen() {
  const ui = DocumentApp.getUi();
  const menu = ui
    .createAddonMenu()
    .addItem("Insert Song at Cursor", "openSongDialog");
  if (DEV) {
    menu
      .addSeparator()
      .addSubMenu(
        ui
          .createMenu("DEV")
          .addItem("Print parent attributes", "printParentAttributes"),
      );
  }
  menu.addToUi();
}

function onInstall() {
  onOpen();
}

function getInsertPointAtCursor() {
  const cursor = DocumentApp.getActiveDocument().getCursor();
  if (!cursor) {
    throw new Error("Cannot find cursor");
  }
  const child = cursor.getElement();
  const parent = child.getParent();
  if (parent.getType() !== DocumentApp.ElementType.BODY_SECTION) {
    throw new Error(
      "Please place the cursor in the body of the document.\nNot in a table, header, footer, etc.",
    );
  }
  return [parent, parent.getChildIndex(child)];
}

function openSongDialog() {
  try {
    // Test if the cursor is in a valid location
    const [_parent, _childIndex] = getInsertPointAtCursor();
    const html = HtmlService.createHtmlOutputFromFile("songDialog")
      .setWidth(600)
      .setHeight(425);
    DocumentApp.getUi().showModalDialog(html, "Insert Song");
  } catch (error) {
    DocumentApp.getUi().alert(error.message);
  }
}

function isSectionHeader(line) {
  return line.match(/^\[.*\].*$/);
}

function isChorus(paragraph) {
  return paragraph.match(/^\[(Chorus|Refrein|CHORUS|REFREIN).*\].*$/m);
}

function isChordLine(line) {
  if (line.trim().length === 0) {
    return false;
  }
  const words = line.split(/\s+/);
  return words.every(
    (word) =>
      word.length === 0 ||
      /[A-G|/]/.test(word[0]) ||
      /^\(.*\)$/.test(word) ||
      /^x[\d]+$/.test(word),
  );
}

function splitParagraphs(text) {
  const paragraphs = text.split("\n\n");
  for (let i = 0; i < paragraphs.length; i += 1) {
    paragraphs[i] = paragraphs[i].trim();
    if (isSectionHeader(paragraphs[i]) && i < paragraphs.length - 1) {
      // eslint-disable-next-line prefer-template
      paragraphs[i + 1] = paragraphs[i] + "\n" + paragraphs[i + 1];
      paragraphs.splice(i, 1);
      i -= 1;
    } else {
      paragraphs[i] += "\n";
    }
  }
  return paragraphs;
}

function formatParagraph(paragraph, previousWasChorus = false) {
  const text = paragraph.editAsText();
  text.setAttributes(ParagraphStyle);
  const lines = text.getText().split("\r");

  let chorus = previousWasChorus;
  let i = 0;
  let lineStart = 0;
  if (isSectionHeader(lines[0])) {
    chorus = isChorus(lines[0]);
    i = 1;
    text.setAttributes(0, lines[0].length - 1, HeaderStyle);
    lineStart = lines[0].length + 1;
  }
  for (; i < lines.length; i += 1) {
    if (lines[i].trim().length === 0) {
      // eslint-disable-next-line no-continue
      continue;
    }
    const lineEnd = lineStart + lines[i].length - 1;
    if (chorus) {
      text.setAttributes(lineStart, lineEnd, ChorusStyle);
    }
    if (isChordLine(lines[i])) {
      text.setAttributes(lineStart, lineEnd, ChordStyle);
    }
    lineStart = lineEnd + 2;
  }
}

function insertSongTable(text) {
  try {
    const [parent, childIndex] = getInsertPointAtCursor();
    const table = parent.insertTable(childIndex + 1);
    table.setAttributes(TableStyle);

    const paragraphs = splitParagraphs(text);
    let wasChorus = false;
    for (let i = 0; i < paragraphs.length; i += 1) {
      const row = table.appendTableRow();
      const cell = row.appendTableCell();
      cell.setAttributes(CellStyle);
      const paragraph = cell.getChild(0);
      paragraph.setText(paragraphs[i]);
      formatParagraph(paragraph, wasChorus);
      wasChorus = isChorus(paragraphs[i]);
    }

    const doc = DocumentApp.getActiveDocument();
    const rangeBuilder = doc.newRange();
    rangeBuilder.addElement(table);
    doc.setSelection(rangeBuilder.build());
  } catch (error) {
    DocumentApp.getUi().alert(error.message);
  }
}

function getElementAtCursor(elementType) {
  let currentElement = DocumentApp.getActiveDocument().getCursor().getElement();
  while (currentElement) {
    if (currentElement.getType() === elementType) {
      return currentElement;
    }
    currentElement = currentElement.getParent();
  }

  throw new Error(`The cursor is not inside a ${elementType}`);
}

function getAttributeString(element) {
  const attributes = element.getAttributes();
  const attstring = Object.entries(attributes).reduce(
    (total, currentAtt) => `${total}${currentAtt[0]}: ${currentAtt[1]}\n`,
    `${element.getType()}\n\n`,
  );
  return attstring;
}

function printParentAttributes() {
  const ui = DocumentApp.getUi();
  let currentElement = DocumentApp.getActiveDocument().getCursor().getElement();
  while (currentElement) {
    const response = ui.alert(
      `${getAttributeString(currentElement)}\n\nContinue?`,
      ui.ButtonSet.YES_NO,
    );
    if (response === ui.Button.NO) {
      break;
    }
    currentElement = currentElement.getParent();
  }
}

global.onOpen = onOpen;
global.onInstall = onInstall;
global.openSongDialog = openSongDialog;
global.insertSongTable = insertSongTable;
if (DEV) {
  global.printParentAttributes = printParentAttributes;
}
