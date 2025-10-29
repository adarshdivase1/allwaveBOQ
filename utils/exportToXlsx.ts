import * as XLSX from 'xlsx';
import { ClientDetails, Room } from '../types';
import { scopeOfWork, termsAndConditions } from '../data/scopeAndTermsData';

// A utility function to format currency
const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
};

export const exportToXlsx = (
    rooms: Room[],
    clientDetails: ClientDetails,
) => {
    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData: any[] = [
        ['Project Summary'],
        [],
        ['Client:', clientDetails.clientName],
        ['Project:', clientDetails.projectName],
        ['Prepared By:', clientDetails.preparedBy],
        ['Date:', clientDetails.date],
        [],
        ['Room', 'Total Cost (USD)'],
    ];

    let grandTotal = 0;
    rooms.forEach(room => {
        if (room.boq) {
            const roomTotal = room.boq.reduce((acc, item) => acc + item.totalPrice, 0);
            grandTotal += roomTotal;
            summaryData.push([room.name, formatCurrency(roomTotal, 'USD')]);
        }
    });
    summaryData.push(['', '']);
    summaryData.push(['Grand Total', formatCurrency(grandTotal, 'USD')]);

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    // Individual Room Sheets
    rooms.forEach(room => {
        if (room.boq) {
            const roomData = [
                ['Category', 'Item Description', 'Brand', 'Model', 'Qty', 'Unit Price (USD)', 'Total Price (USD)'],
                ...room.boq.map(item => [
                    item.category,
                    item.itemDescription,
                    item.brand,
                    item.model,
                    item.quantity,
                    item.unitPrice,
                    item.totalPrice,
                ])
            ];
            const roomTotal = room.boq.reduce((acc, item) => acc + item.totalPrice, 0);
            roomData.push(['', '', '', '', '', 'Total', roomTotal]);
            const roomWs = XLSX.utils.aoa_to_sheet(roomData);
            // Set column formats
            roomWs['!cols'] = [ {wch:20}, {wch:40}, {wch:20}, {wch:20}, {wch:5}, {wch:15}, {wch:15} ];
            XLSX.utils.book_append_sheet(wb, roomWs, room.name.substring(0, 31)); // Sheet names have a 31 char limit
        }
    });

    // Scope & Terms Sheet
    const scopeAndTermsData = [
        ['Scope of Work'],
        [scopeOfWork],
        [],
        ['Terms and Conditions'],
        [termsAndConditions]
    ];
    const termsWs = XLSX.utils.aoa_to_sheet(scopeAndTermsData);
    termsWs['!cols'] = [{ wch: 100 }];
    XLSX.utils.book_append_sheet(wb, termsWs, 'Scope & Terms');

    XLSX.writeFile(wb, `${clientDetails.projectName || 'BOQ'}.xlsx`);
};
