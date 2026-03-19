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

        if (!sheet) {
            sheet = ss.insertSheet(dateStringSheetName, 1);
            sheet.appendRow(["Name", "Mht Id", "Mobile No.", "Device Id", "Location", "Timestamp"]);
            sheet.getRange(1, 1, 1, 6).setFontWeight("bold");
            sheet.setFrozenRows(1);
        }

        // Fetch existing data
        const existingData = sheet.getDataRange().getValues();

        // Duplicate check
        const isDuplicate = existingData.some((row) => (
            (row[0] == data.name && (
                (data.mhtId && row[1] == data.mhtId) ||
                (data.mobileNo && row[2] == data.mobileNo) ||
                (data.deviceId && row[3] == data.deviceId)
            )) ||
            (data.mhtId && row[1] == data.mhtId && (
                (data.mobileNo && row[2] == data.mobileNo) ||
                (data.deviceId && row[3] == data.deviceId)
            ))
        ));

        if (isDuplicate) {
            console.log("Duplicate entry detected");
            return ContentService
                .createTextOutput(JSON.stringify({result: "error", message: "Details already exist for today."}))
                .setMimeType(ContentService.MimeType.JSON);
        }

        // Get or create master sheet
        let masterSheet = ss.getSheetByName("Master Sheet") || ss.insertSheet("Master Sheet");

        // Initialize master sheet
        if (masterSheet.getLastRow() === 0) {
            masterSheet.appendRow(["Sl. No.", "Name", "Mht Id", "Mobile No."]);
            masterSheet.getRange(1, 1, 1, 4).setFontWeight("bold").setBackground("#EEEEEE");
            masterSheet.setFrozenRows(1);
            masterSheet.setFrozenColumns(4);
        }

        const lastRow = masterSheet.getLastRow();
        let personRow = 0;

        // Identify user
        if (lastRow > 1) {
            const userData = masterSheet.getRange(2, 1, lastRow - 1, 4).getValues();

            // Match by MhtId
            if (data.mhtId) {
                for (let i = 0; i < userData.length; i++) {
                    if (userData[i][2] && userData[i][2].toString() === data.mhtId.toString()) {
                        personRow = i + 2;
                        break;
                    }
                }
            }

            // Match by Name + Mobile
            if (personRow === 0 && data.name && data.mobileNo) {
                for (let i = 0; i < userData.length; i++) {
                    if (
                        userData[i][1]?.toString() === data.name.toString() &&
                        userData[i][3]?.toString() === data.mobileNo.toString()
                    ) {
                        personRow = i + 2;
                        break;
                    }
                }
            }
        }

        // Add entry to daily sheet
        sheet.appendRow([
            data.name,
            data.mhtId || "",
            data.mobileNo || "",
            data.deviceId || "",
            data.location || "",
            today
        ]);

        // Get headers
        const headers = masterSheet.getRange(1, 1, 1, masterSheet.getLastColumn()).getDisplayValues()[0];

        let dateCol = headers.indexOf(dateStringSheetName) + 1;

        // Create new date column at position 5
        if (dateCol === 0) {
            dateCol = 5;

            masterSheet.insertColumnBefore(dateCol);

            masterSheet.getRange(1, dateCol)
                .setValue(dateStringSheetName)
                .setFontWeight("bold")
                .setBackground("#EEEEEE")
                .setHorizontalAlignment("center");

            if (lastRow > 1) {
                masterSheet.getRange(2, dateCol, lastRow - 1, 1)
                    .setValue("No")
                    .setHorizontalAlignment("center");
            }
        }

        // Handle new user
        if (personRow === 0) {
            const nextSlNo = masterSheet.getLastRow();
            masterSheet.appendRow([nextSlNo, data.name, data.mhtId || "", data.mobileNo || ""]);
            personRow = masterSheet.getLastRow();

            // Highlight new user in daily sheet
            sheet.getRange(sheet.getLastRow(), 1, 1, 6)
                .setBackground("#FFF2CC");

            const totalCols = masterSheet.getLastColumn();
            if (totalCols > 4) {
                masterSheet.getRange(personRow, 5, 1, totalCols - 4)
                    .setValue("")
                    .setHorizontalAlignment("center");
            }

        } else {
            // Existing user → no highlight
            sheet.getRange(sheet.getLastRow(), 1, 1, 6)
                .setBackground(null);
        }

        // Mark attendance
        masterSheet.getRange(personRow, dateCol)
            .setValue("Yes")
            .setHorizontalAlignment("center");

        // Apply borders
        sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn())
            .setBorder(true, true, true, true, true, true);

        masterSheet.getRange(1, 1, masterSheet.getLastRow(), masterSheet.getLastColumn())
            .setBorder(true, true, true, true, true, true);

        // Success response
        return ContentService
            .createTextOutput(JSON.stringify({result: "success", status: 200}))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        console.error("Error in doPost:", error);

        return ContentService
            .createTextOutput(JSON.stringify({result: "error", message: error.message}))
            .setMimeType(ContentService.MimeType.JSON);
    }
}