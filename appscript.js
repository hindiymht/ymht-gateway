function doPost(e) {
    try {
        // Parse incoming JSON payload
        const data = JSON.parse(e.postData.contents);

        // Get active spreadsheet
        const ss = SpreadsheetApp.getActiveSpreadsheet();

        // Get current date and format as sheet name
        const today = new Date();
        const dateStringSheetName = Utilities.formatDate(
            today,
            Session.getScriptTimeZone(),
            "dd MMM yyyy"
        );

        // Get or create today's sheet
        let sheet = ss.getSheetByName(dateStringSheetName);

        // Create today's sheet with headers if not exists
        if (!sheet) {
            sheet = ss.insertSheet(dateStringSheetName, 1);
            sheet.appendRow(["Name", "Mht Id", "Mobile No.", "Device Id", "Location", "Timestamp"]);
            sheet.getRange(1, 1, 1, 6).setFontWeight("bold"); // Make header bold
            sheet.setFrozenRows(1); // Freeze header row
        }

        // Fetch existing data from today's sheet
        const existingData = sheet.getDataRange().getValues();

        // Check duplicate entry based on custom logic
        const isDuplicate = existingData.some((row) => (
            ((row[0] == data.name || row[0]?.includes(data.name)) && (
                (data.mhtId && row[1] == data.mhtId) ||
                (data.mobileNo && row[2] == data.mobileNo) ||
                (data.deviceId && row[3] == data.deviceId)
            )) ||
            (data.mhtId && row[1] == data.mhtId && (
                (data.mobileNo && row[2] == data.mobileNo) ||
                (data.deviceId && row[3] == data.deviceId)
            ))
        ));

        // Return error if duplicate found
        if (isDuplicate) {
            console.log("Duplicate entry detected");
            return ContentService
                .createTextOutput(JSON.stringify({result: "error", message: "Details already exist for today."}))
                .setMimeType(ContentService.MimeType.JSON);
        }

        // Get or create master sheet
        let masterSheet = ss.getSheetByName("Master Sheet") || ss.insertSheet("Master Sheet");

        // Initialize master sheet headers if empty
        if (masterSheet.getLastRow() === 0) {
            masterSheet.appendRow(["Name", "Mht Id", "Mobile No.", "Total Attended"]);
            masterSheet.getRange(1, 1, 1, 4)
                .setFontWeight("bold")
            masterSheet.setFrozenRows(1); // Freeze header row
            masterSheet.setFrozenColumns(4); // Freeze first 4 columns
        }

        const lastRow = masterSheet.getLastRow();
        let personRow = 0;

        // Identify user in master sheet
        if (lastRow > 1) {
            const userData = masterSheet.getRange(2, 1, lastRow - 1, 4).getValues();

            // Match by Mht Id
            if (data.mhtId) {
                for (let i = 0; i < userData.length; i++) {
                    if (userData[i][1]?.toString() === data.mhtId.toString()) {
                        personRow = i + 2;
                        break;
                    }
                }
            }

            // Match by Name + Mobile if not found by Mht Id
            if (personRow === 0 && data.name && data.mobileNo) {
                for (let i = 0; i < userData.length; i++) {
                    if (
                        (userData[i][0]?.toString() === data.name.toString() ||
                            userData[i][0]?.toString().includes(data.name.toString())) &&
                        userData[i][2]?.toString() === data.mobileNo.toString()
                    ) {
                        personRow = i + 2;
                        break;
                    }
                }
            }
        }

        // Append entry in today's sheet
        sheet.appendRow([
            data.name,
            data.mhtId || "",
            data.mobileNo || "",
            data.deviceId || "",
            data.location || "",
            today
        ]);

        // Get headers from master sheet
        const headers = masterSheet.getRange(1, 1, 1, masterSheet.getLastColumn()).getDisplayValues()[0];

        let dateCol = headers.indexOf(dateStringSheetName) + 1;

        // Create new date column after column D (Total Attended)
        if (dateCol === 0) {
            dateCol = 5;

            // Insert new column at position 5
            masterSheet.insertColumnBefore(dateCol);

            // Set header for new date column
            masterSheet.getRange(1, dateCol)
                .setValue(dateStringSheetName)
                .setFontWeight("bold")
                .setBackground("#356854") // Green
                .setHorizontalAlignment("center");

            // Fill "No" for all existing users (default absent)
            if (lastRow > 1) {
                masterSheet.getRange(2, dateCol, lastRow - 1, 1)
                    .setValue("No")
                    .setBackground("#F4CCCC") // Red
                    .setHorizontalAlignment("center");
            }
        }

        // Handle new user
        if (personRow === 0) {
            masterSheet.appendRow([
                data.name,
                data.mhtId || "",
                data.mobileNo || ""
            ]);

            personRow = masterSheet.getLastRow();

            // Highlight new user row in today's sheet
            sheet.getRange(sheet.getLastRow(), 1, 1, 6)
                .setBackground("#FFF2CC"); // Yellow

            // Initialize attendance columns for new user
            const totalCols = masterSheet.getLastColumn();
            if (totalCols > 4) {
                masterSheet.getRange(personRow, 5, 1, totalCols - 4)
                    .setValue("No")
                    .setBackground("#F4CCCC") // Red
                    .setHorizontalAlignment("center");
            }

        } else {
            // Existing user → no highlight
            sheet.getRange(sheet.getLastRow(), 1, 1, 6)
                .setBackground(null);
        }

        // Mark today's attendance as "Yes"
        masterSheet.getRange(personRow, dateCol)
            .setValue("Yes")
            .setBackground("#B7E1CD") // Green
            .setHorizontalAlignment("center");

        // Apply borders to today's sheet
        sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn())
            .setBorder(true, true, true, true, true, true);

        // Apply borders to master sheet
        masterSheet.getRange(1, 1, masterSheet.getLastRow(), masterSheet.getLastColumn())
            .setBorder(true, true, true, true, true, true);

        // Return success response
        return ContentService
            .createTextOutput(JSON.stringify({result: "success", status: 200}))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        // Log error in Apps Script logs
        console.error("Error in doPost:", error);

        // Return error response
        return ContentService
            .createTextOutput(JSON.stringify({result: "error", message: error.message}))
            .setMimeType(ContentService.MimeType.JSON);
    }
}