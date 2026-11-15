const FOLDER = 'ShiftDesk Photos';   
const MAX_PHOTO_CHARS = 3000000;
function doGet() { return json({ ok: true, app: 'ShiftDesk backend', version: VERSION }); }

function doPost(e) {
  try { return handlePost(e); }
  catch (err) { return json({ error: 'Script error: ' + err.message }); }
}

// Run once from the editor (select "authorize" > Run) to grant Sheets + Drive permission.
function authorize() {
  SpreadsheetApp.getActiveSpreadsheet();
  photoFolder();
  LockService.getScriptLock();
  Logger.log('Permissions OK. Now deploy as a Web app (or a New version).');
}

function handlePost(e) {
  const d = JSON.parse(e.postData.contents);
  if (d.type !== 'login' && d.type !== 'logout') return out('ignored');
  if (!d.empNo || !d.dateKey) return out('ignored');

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const empNo = isNaN(Number(d.empNo)) ? d.empNo : Number(d.empNo);
    const key = empNo + '|' + d.dateKey;       // one login and one logout per employee per day
    const base = empNo + '_' + d.dateKey;

    if (d.type === 'login') {
      const sh = sheet(ss, 'Logins', ['Employee No', 'Name', 'Team', 'Date', 'Login time',
        'Laptop login photo', 'Shift ID', 'Key'], 4);
      if (exists(sh, key)) return out('duplicate');
      sh.appendRow([empNo, d.name, d.team, d.dateKey, d.loginTime,
        savePhoto(d.photoLaptop, base + '_login_laptop'), d.shiftId, key]);
      return out('ok');
    }

    // logout
    const sh = sheet(ss, 'Logouts', ['Employee No', 'Name', 'Team', 'Date', 'Login time', 'Logout time', 'Duration',
      'Laptop logout photo', 'Remarks', 'Shift ID', 'Key'], 4);
    if (exists(sh, key)) return out('duplicate');
    sh.appendRow([empNo, d.name, d.team, d.dateKey, d.loginTime, d.logoutTime, d.duration,
      savePhoto(d.photoLaptop, base + '_logout_laptop'), d.remarks, d.shiftId, key]);

    // One KPI tab per team, with that team's own columns
    const labels = (d.kpi || []).map(k => k.label);
    const kp = sheet(ss, 'KPI ' + d.team, ['Employee No', 'Name', 'Date'].concat(labels, ['Remarks']), 3);
    kp.appendRow([empNo, d.name, d.dateKey].concat((d.kpi || []).map(k => k.value), [d.remarks]));
    return out('ok');
  } finally {
    lock.releaseLock();
  }
}

function exists(sh, key) {
  const n = sh.getLastRow() - 1;
  if (n < 1) return false;
  return sh.getRange(2, sh.getLastColumn(), n, 1).getValues().some(r => r[0] === key);
}

function out(text) { return ContentService.createTextOutput(text); }
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function photoFolder() {
  const it = DriveApp.getFoldersByName(FOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER);
}

function savePhoto(dataUrl, name) {
  if (!dataUrl || String(dataUrl).length > MAX_PHOTO_CHARS) return '';
  const blob = Utilities.newBlob(Utilities.base64Decode(dataUrl.split(',')[1]), 'image/jpeg', name + '.jpg');
  return photoFolder().createFile(blob).getUrl(); // private to you; share the Drive folder to let others view
}

// Creates the tab, or renames an older tab that has a different layout so nothing is lost.
function sheet(ss, name, headers, dateCol) {
  let sh = ss.getSheetByName(name);
  const same = sh && sh.getLastColumn() === headers.length &&
    sh.getRange(1, 1, 1, headers.length).getValues()[0].every((h, i) => h === headers[i]);
  if (sh && !same) {
    sh.setName(name + ' (old ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MMM HH.mm') + ')');
    sh = null;
  }
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#e0e7ff');
    sh.setFrozenRows(1);
    sh.getRange(1, dateCol, sh.getMaxRows(), 1).setNumberFormat('@'); // keep dates as plain text yyyy-mm-dd
  }
  return sh;
}
