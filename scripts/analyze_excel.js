const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Function to calculate the number of unique cars, average time, and generate a graph
async function analyzeVehicles(filePath, date, startTime, endTime, sheetName = null) {
    const excelFilePath = path.join(__dirname, '..', 'mock_db', 'Pipera1.xlsx');
    const workbook = XLSX.readFile(excelFilePath);
    let sheetData;

    if (sheetName) {
        sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else {
        sheetData = [];
        workbook.SheetNames.forEach(sheet => {
            sheetData = sheetData.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
        });
    }

    const startDatetime = new Date(`${date} ${startTime}`);
    const endDatetime = new Date(`${date} ${endTime}`);

    const filteredData = sheetData.filter(row => {
        const entryTime = new Date(row['Entry Time']);
        return entryTime >= startDatetime && entryTime <= endDatetime;
    });

    const vehicleStats = {};
    filteredData.forEach(row => {
        const licensePlate = row['License Plate'];
        const entryTime = new Date(row['Entry Time']);
        const exitTime = new Date(row['Exit Time']);
        const timeSpent = (exitTime - entryTime) / (1000 * 60); // time in minutes

        if (!vehicleStats[licensePlate]) {
            vehicleStats[licensePlate] = 0;
        }
        vehicleStats[licensePlate] += timeSpent;
    });

    const uniqueVehicles = Object.keys(vehicleStats);
    const stayTimes = Object.values(vehicleStats);

    const totalTime = stayTimes.reduce((acc, time) => acc + time, 0);
    const averageTime = stayTimes.length > 0 ? totalTime / stayTimes.length : 0;

    // Generate the graph
    // const chartPath = await generateGraph(uniqueVehicles, stayTimes);

    return {
        uniqueVehicles: uniqueVehicles.length,
        averageTime,
    };
}

// Export the analyzeVehicles function
module.exports = analyzeVehicles;
