import * as XLSX from 'xlsx';
import type { BoqItem, ClientDetails, Room, Currency } from '../types';
import { scopeAndTerms } from '../data/scopeAndTermsData';

// Helper function for styling (basic implementation)
const currencyFormat = `#,##0.00`;

const addVersionControlSheet = (wb: XLSX.WorkBook, clientDetails: ClientDetails) => {
    const ws_data = [
        ["Version", null, "Contact Details"],
        ["Date of First Draft", new Date(clientDetails.date), "Design Engineer", clientDetails.designEngineer],
        ["Date of Final Draft", null, "Account Manager", clientDetails.accountManager],
        ["Version No.", "1.0", "Client Name", clientDetails.clientName],
        ["Published Date", new Date(clientDetails.date), "Key Client Personnel", clientDetails.keyClientPersonnel],
        [null, null, "Location", clientDetails.location],
        [null, null, "Key Comments", clientDetails.keyComments],
    ];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    ws['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, ws, "Version Control");
};

const addSummarySheet = (wb: XLSX.WorkBook, rooms: Room[], currency: Currency, exchangeRate: number) => {
    const data = rooms.map((room, index) => {
        const total = room.boq.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) * exchangeRate;
        return [index + 1, room.name, total];
    });
    const grandTotal = data.reduce((sum, row) => sum + (row[2] as number), 0);

    const sheetData = [
        ["Proposal Summary"],
        [],
        ["Sr. No.", "Description", `Total Amount (${currency})`],
        ...data,
        [],
        [null, "Grand Total", grandTotal]
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!cols'] = [{ wch: 10 }, { wch: 40 }, { wch: 20 }];

    // Apply currency format to all data rows
    for (let i = 0; i < data.length; i++) {
        const cellRef = `C${4 + i}`; // Data starts at row 4
        if (ws[cellRef]) {
            ws[cellRef].z = currencyFormat;
        }
    }

    // Format grand total row
    const grandTotalRowIndex = 4 + data.length + 1; // Correct calculation
    const grandTotalCellRef = `C${grandTotalRowIndex}`;
    if (ws[grandTotalCellRef]) {
        ws[grandTotalCellRef].z = currencyFormat;
    }
    
    XLSX.utils.book_append_sheet(wb, ws, "Proposal Summary");
}

const addScopeAndTermsSheets = (wb: XLSX.WorkBook) => {
    const scope_ws = XLSX.utils.aoa_to_sheet([["Scope of Work"], ...scopeAndTerms.scope.map(s => [s])]);
    scope_ws['!cols'] = [{ wch: 80 }];
    XLSX.utils.book_append_sheet(wb, scope_ws, "Scope of Work");

    const terms_ws = XLSX.utils.aoa_to_sheet([["Terms & Conditions"], ...scopeAndTerms.terms.map(t => [t])]);
    terms_ws['!cols'] = [{ wch: 80 }];
    XLSX.utils.book_append_sheet(wb, terms_ws, "Terms & Conditions");
};


const addBoqSheet = (wb: XLSX.WorkBook, room: Room, currency: Currency, exchangeRate: number) => {
    const headers = ["Category", "Brand", "Model Number", "Item Name", "Description", "Qty", `Unit Price (${currency})`, `Total Price (${currency})`, "Notes", "Reference Image"];
    
    const data = room.boq.map(item => {
        const unitPrice = item.unitPrice * exchangeRate;
        const totalPrice = item.quantity * unitPrice;
        return {
            Category: item.category,
            Brand: item.brand,
            'Model Number': item.modelNumber,
            'Item Name': item.itemName,
            Description: item.description,
            Qty: item.quantity,
            'Unit Price': unitPrice,
            'Total Price': totalPrice,
            Notes: item.notes,
            'Reference Image': item.imageUrl ? { t: 'f', f: `=HYPERLINK("${item.imageUrl}", "View Image")` } : 'N/A'
        };
    });

    const ws = XLSX.utils.json_to_sheet(data); // Don't pass headers here to avoid double headers
    
    // Calculate Grand Total
    const total = data.reduce((sum, item) => sum + item['Total Price'], 0);
    const totalRowIndex = data.length + 2;
    XLSX.utils.sheet_add_aoa(ws, [[null, null, null, null, null, "Grand Total", null, total]], { origin: `A${totalRowIndex}` });

    // Add headers manually to allow for styling
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A1' });

    ws['!cols'] = [ { wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 30 }, { wch: 40 }, { wch: 5 }, { wch: 15 }, { wch: 15 }, { wch: 50 }, { wch: 15 } ];
    
    // Add number formatting to price columns
    const priceCols = ['G', 'H'];
    // Loop through data rows (from row 2 to data.length + 1)
    for(let i = 2; i <= data.length + 1; i++) {
        priceCols.forEach(col => {
            const cellRef = `${col}${i}`;
            if(ws[cellRef]) ws[cellRef].z = currencyFormat;
        });
    }

    // Format the grand total cell
    const grandTotalCellRef = `H${totalRowIndex}`;
    if(ws[grandTotalCellRef]) {
        ws[grandTotalCellRef].z = currencyFormat;
    }

    const safeSheetName = room.name.replace(/[\\/*?[\]]/g, '').substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, `BOQ - ${safeSheetName}`);
};


export const exportToXlsx = (
    rooms: Room[],
    clientDetails: ClientDetails,
    currency: Currency,
    exchangeRate: number
) => {
    const wb = XLSX.utils.book_new();

    // Add informational sheets
    addVersionControlSheet(wb, clientDetails);
    // Executive Summary could be added here
    addScopeAndTermsSheets(wb);
    addSummarySheet(wb, rooms, currency, exchangeRate);
    
    // Add a BOQ sheet for each room
    rooms.forEach(room => {
        if (room.boq && room.boq.length > 0) {
            addBoqSheet(wb, room, currency, exchangeRate);
        }
    });
    
    // Set Version Control as the active sheet
    if (wb.SheetNames.length > 0) {
        // Fix: Property 'active' does not exist on type 'WorkBook'. The correct property is `ActiveSheet` within `Props`.
        if (!wb.Props) wb.Props = {};
        // FIX: The @types/xlsx package may be outdated, causing a type error.
        // Using a type assertion to bypass the error and set the active sheet.
        (wb.Props as any).ActiveSheet = 0;
    }

    XLSX.writeFile(wb, `${clientDetails.projectName || 'AV Project'} - BOQ Report.xlsx`);
};
