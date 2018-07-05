/**
 * setup sheets expects a fresh sheet, creates the expected sheets for the demo functions
 * demo functions just activate the sheet by name expecting it to be there
 */
function setupInputSheets() {
  var welcomeSheet = SpreadsheetApp.getActive().getSheetByName('Welcome');
  if (welcomeSheet){
    welcomeSheet.activate();
    SpreadsheetApp.getActive().moveActiveSheet(0);
  } else {
    SpreadsheetApp.getActiveSpreadsheet().insertSheet('Welcome', 0).activate();
  }
  var sheetIds = SpreadsheetApp.getActiveSpreadsheet().getSheets().map(function(e){return e.getSheetId()});
  var numSheets = sheetIds.length;
  
  if(numSheets>1){ deleteSheetsBesidesFirstOne(sheetIds); }//combine sheet deletion into one call for performance improvement
  
  //CREATE SHEETS
  var spreadsheet = SpreadsheetApp.getActive();
  
  //Create all expected input sheets and name them 
  createAndNameAllInputSheets(spreadsheet.getId());
  //Update Multiple Cells
  var umcSheet = SpreadsheetApp.getActive().getSheetByName('Update Multiple Cells');
  
  //PREP SHEETS
  populateUpdateMultipleCells();
  highlightsForUpdateMultipleCells();
  
  //Manipulate Disjoint Ranges
  var mdrSheet = SpreadsheetApp.getActive().getSheetByName('Manipulate Disjoint Ranges');
  
  //PREP SHEETS
  populateManipulateDisjointRanges();
  
  //Gist Query A sheet
  setupQueryInputSheet();
  
  
//ENCLOSED FUNCTIONS
/**
 * enclosed function that creates all expected input sheets 
 */
 function createAndNameAllInputSheets(ssId){
   var resource = {
     "requests": [{ //initial request to create sheet of exactly right size
       "addSheet": {
         "properties": {
           "title": "Update Multiple Cells",
           "tabColor": {
             "red": 30,
             "green": 93,
             "blue": 230,
             "alpha": 1.00
           },
           "gridProperties": {
             "columnCount": 10,
             "rowCount": 25
           }
         }
       },
       "addSheet": {
         "properties": {
           "title": "Manipulate Disjoint Ranges",
           "tabColor": {
             "red": 30,
             "green": 93,
             "blue": 230,
             "alpha": 1.00
           },
           "gridProperties": {
             "columnCount": 10,
             "rowCount": 25
           }
         }
       },
       "addSheet": {
         "properties": {
           "title": "queryASheet-input",
           "tabColor": {
             "red": 30,
             "green": 93,
             "blue": 230,
             "alpha": 1.00
           },
           "gridProperties": {
             "columnCount": 10,
             "rowCount": 25
           }
         }
       }
     }],
     "includeSpreadsheetInResponse": false
   };
   //batch update one
   Sheets.Spreadsheets.batchUpdate(resource, ssId);
 }//end createAndNameAllInputSheets()


  function populateManipulateDisjointRanges() {
    mdrSheet.getRange('A1').activate();
    mdrSheet.getCurrentCell().setFormula('=hyperlink("https://issuetracker.google.com/issues/36761866","comment 60 on original issue")');
  }
  
  function populateUpdateMultipleCells() {
    SpreadsheetApp.setActiveSheet(umcSheet, true);
    umcSheet.getCurrentCell().setFormula('=hyperlink("https://ctrlq.org/code/20504-update-google-sheet-cell-values","source article for initial idea")');
  }

  function highlightsForUpdateMultipleCells() {
    umcSheet.getRange('A2').activate();
    umcSheet.getActiveRangeList().setBackground('#ffff00');
    umcSheet.getRange('B2:B4').activate();
    umcSheet.getActiveRangeList().setBackground('#4a86e8');
    umcSheet.getRange('C2:E2').activate();
    umcSheet.getActiveRangeList().setBackground('#c9daf8');
    umcSheet.getRange('F2:H3').activate();
    umcSheet.getActiveRangeList().setBackground('#b4a7d6');
    umcSheet.getRange('A6').activate();
    umcSheet.getActiveRangeList().setBackground('#b4a7d6');
  }
//credit   
  function deleteSheetsBesidesFirstOne(sheetIds) {

    //Here, the first sheet ID is sheetIds[0]. So if you want to delete all sheets except for 1st sheet, you can create the request body like 
    var requestBody = {
      requests: sheetIds.filter(function(_, i) {
        return i != 0
      }).map(function(e) {
        return {
          deleteSheet: {
            sheetId: e
          }
        }
      })
    };
    Sheets.Spreadsheets.batchUpdate(requestBody, SpreadsheetApp.getActive().getId());

  }
} //end setupInputSheets
/**
 * sheet1 demo
 * demonstrates mulitple cells updated in one execution
 * enable Google Sheets API first; These services must also be enabled in the Google API Console in GCP
 * Modified from original Written by Amit Agarwal
 * Web: ctrlq.org  Email: amit@labnol.org
 */
function updateMultipleCells(spreadsheetId) {
  var spreadsheet = SpreadsheetApp.getActive();

  spreadsheet.getSheetByName('Update Multiple Cells').activate();
  var spreadsheetId = spreadsheetId || spreadsheet.getId(); //when called from menu no passed param, get the id in the users current sheet
  // TODO: compare to other approaches on batchUpdate and examine google examples
  var data = [{
      range: "'Update Multiple Cells'!A2", // Update single cell
      values: [
        ["A2"]
      ]
    },
    {
      range: "'Update Multiple Cells'!B2:B4", // Update a column
      values: [
        ["B2"],
        ["B3"],
        ["B4"]
      ]
    },
    {
      range: "'Update Multiple Cells'!C2:E2", // Update a row
      values: [
        ["C2", "D2", "E2"]
      ]
    },
    {
      range: "'Update Multiple Cells'!F2:H3", // Update a 2d range
      values: [
        ["F2", "G2", "H2"],
        ["F3", "G3", "H3"]
      ]
    },
    {
      range: "'Update Multiple Cells'!A6", // Update a cell with a 2d array
      values: [
        ["F2", "G2", "H2"],
        ["F3", "G3", "H3"]
      ]
    }
  ];

  var resource = {
    valueInputOption: "USER_ENTERED",
    data: data
  };
  //TODO: try catch with e sent to stackdriver
  Sheets.Spreadsheets.Values.batchUpdate(resource, spreadsheetId);

}

/**
 * and this pattern is comment 60 on https://issuetracker.google.com/36761866
 * select multiple ranges, run function, each selection has border set
 **/
function manipulateDisjointRanges() {
  var ss = SpreadsheetApp;

  ss.setActiveSheet(ss.getActiveSpreadsheet().getSheetByName('Manipulate Disjoint Ranges'), true);

  ss.getActiveSheet().getActiveRangeList().getRanges().forEach(Outline);

  function Outline(R) {
    R.setBorder(true, true, true, true, true, true);
  }
}