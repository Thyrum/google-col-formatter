import { updateTranspose } from './transposer';
import { insertCOL } from './COLformatter';

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
  const html = HtmlService.createTemplateFromFile('chords-over-lyrics').evaluate().setTitle('Chords Over Lyrics Input');
  DocumentApp.getUi().showSidebar(html);
}

function showTransposeBar() {
  const html = HtmlService.createTemplateFromFile('transpose.html').evaluate().setTitle('Transpose');
  DocumentApp.getUi().showSidebar(html);
}

global.onOpen = onOpen;
global.onInstall = onInstall;
global.showCOLSidebar = showCOLSidebar;
global.showTransposeBar = showTransposeBar;
global.updateTranspose = updateTranspose;
global.insertCOL = insertCOL;
