const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const { createCanvas } = require('canvas');

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
        chartUrl: `/api/getChartImage`,
    };
}

// Function to generate the graph and save it locally
async function generateGraph(uniqueVehicles, stayTimes) {
    const width = 800;
    const height = 600;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Chart title
    ctx.fillStyle = '#000000';
    ctx.font = '20px Arial';
    ctx.fillText('Vehicle Stay Time Analysis', 20, 30);

    // Determine max value for scaling
    const maxTime = Math.max(...stayTimes);
    const barWidth = 40;
    const barSpacing = 20;
    const chartHeight = 400;
    const chartWidth = uniqueVehicles.length * (barWidth + barSpacing);
    const chartOffsetX = 50;
    const chartOffsetY = height - 100;

    // Draw axes
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(chartOffsetX, chartOffsetY);
    ctx.lineTo(chartOffsetX, chartOffsetY - chartHeight);
    ctx.moveTo(chartOffsetX, chartOffsetY);
    ctx.lineTo(chartOffsetX + chartWidth, chartOffsetY);
    ctx.stroke();

    // Draw bars
    uniqueVehicles.forEach((vehicle, index) => {
        const barHeight = (stayTimes[index] / maxTime) * chartHeight;

        ctx.fillStyle = '#36a2eb';
        ctx.fillRect(
            chartOffsetX + index * (barWidth + barSpacing),
            chartOffsetY - barHeight,
            barWidth,
            barHeight
        );

        // Add labels for vehicles
        ctx.fillStyle = '#000000';
        ctx.font = '12px Arial';
        ctx.fillText(
            vehicle,
            chartOffsetX + index * (barWidth + barSpacing) + barWidth / 2 - 10,
            chartOffsetY + 15
        );
    });

    // Add Y-axis labels
    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    ctx.fillText('0', chartOffsetX - 20, chartOffsetY);
    ctx.fillText(`${Math.round(maxTime)} min`, chartOffsetX - 50, chartOffsetY - chartHeight);

    // Save the chart to a file
    const outputPath = path.join(__dirname, 'vehicle_stay_times_chart.png');
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

    return outputPath; // Return the file path
}

// Export the analyzeVehicles function
module.exports = analyzeVehicles;
