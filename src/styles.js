const CellStyle = {};
CellStyle[DocumentApp.Attribute.FONT_FAMILY] = "Ubuntu Mono";
CellStyle[DocumentApp.Attribute.FONT_SIZE] = 11;
CellStyle[DocumentApp.Attribute.FOREGROUND_COLOR] = "#000000";
CellStyle[DocumentApp.Attribute.PADDING_BOTTOM] = 0;
CellStyle[DocumentApp.Attribute.PADDING_LEFT] = 0;
CellStyle[DocumentApp.Attribute.PADDING_TOP] = 0;
CellStyle[DocumentApp.Attribute.PADDING_RIGHT] = 0;

const ParagraphStyle = {};
ParagraphStyle[DocumentApp.Attribute.LINE_SPACING] = 1;

const HeaderStyle = {};
HeaderStyle[DocumentApp.Attribute.FOREGROUND_COLOR] = "#3c78d8";

const ChorusStyle = {};
ChorusStyle[DocumentApp.Attribute.FOREGROUND_COLOR] = "#cc0000";

const ChordStyle = {};
ChordStyle[DocumentApp.Attribute.BOLD] = true;

export { CellStyle, ParagraphStyle, HeaderStyle, ChorusStyle, ChordStyle };
