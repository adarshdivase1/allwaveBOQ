import * as XLSX from 'xlsx';
import { ClientDetails, Room } from '../types';
import { scopeOfWork, termsAndConditions } from '../data/scopeAndTermsData';

export const exportToXlsx = (
    rooms: Room[],
    clientDetails: ClientDetails,
    margin: number,
) => {
    const wb = XLSX.utils.book_new();
    const gstRate = 0.18;

    // --- Summary Sheet ---
    let projectSubTotal = 0;
    let projectTotalAfterMargin = 0;

    const summaryData: any[] = [
        ['Project Summary'],
        [],
        ['Client:', clientDetails.clientName],
        ['Project:', clientDetails.projectName],
        ['Prepared By:', clientDetails.preparedBy],
        ['Date:', clientDetails.date],
        ['Default Project Margin:', `${margin}% (Note: Per-item margins may apply)`],
        [],
        ['Room', 'Subtotal (USD)', 'Total w/ Margin (USD)', 'GST (USD)', 'Final Total (USD)'],
    ];

    rooms.forEach(room => {
        if (room.boq) {
            let roomSubTotal = 0;
            let roomTotalAfterMargin = 0;
            
            room.boq.forEach(item => {
                const itemMarginPercent = typeof item.margin === 'number' ? item.margin : margin;
                const itemMarginMultiplier = 1 + itemMarginPercent / 100;

                roomSubTotal += item.totalPrice;
                roomTotalAfterMargin += item.totalPrice * itemMarginMultiplier;
            });

            const roomGstAmount = roomTotalAfterMargin * gstRate;
            const roomFinalTotal = roomTotalAfterMargin + roomGstAmount;
            
            summaryData.push([
                room.name,
                roomSubTotal,
                roomTotalAfterMargin,
                roomGstAmount,
                roomFinalTotal
            ]);

            projectSubTotal += roomSubTotal;
            projectTotalAfterMargin += roomTotalAfterMargin;
        }
    });

    const projectGstAmount = projectTotalAfterMargin * gstRate;
    const projectGrandTotal = projectTotalAfterMargin + projectGstAmount;

    summaryData.push([]);
    summaryData.push(['', 'Project Subtotal', 'Total w/ Margin', 'Total GST', 'Grand Total']);
    summaryData.push([
        '',
        projectSubTotal,
        projectTotalAfterMargin,
        projectGstAmount,
        projectGrandTotal
    ]);

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWs['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    // --- Individual Room Sheets ---
    rooms.forEach(room => {
        if (room.boq) {
            const roomData: any[] = [
                ['Category', 'Item Description', 'Brand', 'Model', 'Qty',
                    'Unit Price (USD)', 'Total Price (USD)',
                    'Item Margin (%)',
                    'Unit Price w/ Margin', 'Total Price w/ Margin',
                    'GST Amount (18%)', 'Final Total Price']
            ];
            let roomSubTotal = 0;
            let roomTotalAfterMargin = 0;
            let roomGstAmount = 0;
            let roomFinalTotal = 0;

            room.boq.forEach(item => {
                const unitPrice = item.unitPrice;
                const totalPrice = item.totalPrice;

                const currentItemMarginPercent = typeof item.margin === 'number' ? item.margin : margin;
                const marginMultiplier = 1 + currentItemMarginPercent / 100;

                const unitPriceWithMargin = unitPrice * marginMultiplier;
                const totalPriceWithMargin = totalPrice * marginMultiplier;
                const gstAmount = totalPriceWithMargin * gstRate;
                const finalTotalPrice = totalPriceWithMargin + gstAmount;

                roomSubTotal += totalPrice;
                roomTotalAfterMargin += totalPriceWithMargin;
                roomGstAmount += gstAmount;
                roomFinalTotal += finalTotalPrice;

                roomData.push([
                    item.category,
                    item.itemDescription,
                    item.brand,
                    item.model,
                    item.quantity,
                    unitPrice,
                    totalPrice,
                    currentItemMarginPercent,
                    unitPriceWithMargin,
                    totalPriceWithMargin,
                    gstAmount,
                    finalTotalPrice
                ]);
            });

            roomData.push([]); // spacer row
            roomData.push(['', '', '', '', '', '', '', 'Subtotal:', roomSubTotal]);
            roomData.push(['', '', '', '', '', '', '', 'Total w/ Margin:', roomTotalAfterMargin]);
            roomData.push(['', '', '', '', '', '', '', 'Total GST:', roomGstAmount]);
            roomData.push(['', '', '', '', '', '', '', 'Grand Total:', roomFinalTotal]);

            const roomWs = XLSX.utils.aoa_to_sheet(roomData);
            roomWs['!cols'] = [{ wch: 20 }, { wch: 40 }, { wch: 20 }, { wch: 20 }, { wch: 5 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
            XLSX.utils.book_append_sheet(wb, roomWs, room.name.substring(0, 31));
        }
    });

    // --- Scope & Terms Sheet ---
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

    XLSX.writeFile(wb, `${clientDetails.projectName || 'BOQ'}_${new Date().toISOString().split('T')[0]}.xlsx`);
};