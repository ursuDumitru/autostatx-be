const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Define the root directory where service folders are stored
const SERVICES_DIR = path.join(__dirname, '../mock_db/reports/'); // Adjust path as needed
// Import the analyzeVehicles function
const analyzeVehicles = require(path.join(__dirname, '../scripts/analyze_excel')); // Adjust path as needed

// API endpoint to fetch directories and their files, including download URLs
router.get('/getServices', (req, res) => {
    try {
        const directories = fs.readdirSync(SERVICES_DIR).filter((file) => {
            const filePath = path.join(SERVICES_DIR, file);
            return fs.statSync(filePath).isDirectory(); // Only include directories
        });

        const result = directories.map((directory) => {
            const directoryPath = path.join(SERVICES_DIR, directory);
            const files = fs.readdirSync(directoryPath).filter((file) =>
                file.endsWith('.xlsx') // Include only Excel files
            ).map((file) => ({
                name: file,
                downloadUrl: `http://localhost:5000/api/download/${directory}/${file}`, // File download URL
            }));

            return {
                directory,
                files,
            };
        });

        res.json({ directories: result });
    } catch (error) {
        console.error('Error reading service directories:', error);
        res.status(500).json({ error: 'Failed to fetch directories.' });
    }
});

// API endpoint to download a file
router.get('/download/:service/:filename', (req, res) => {
    const { service, filename } = req.params;
    const filePath = path.join(SERVICES_DIR, service, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found.' });
    }

    res.download(filePath); // Serve the file for download
});

// API endpoint to analyze vehicles data
router.get('/analyzeVehicles', async (req, res) => {
    const { date, startTime, endTime, service } = req.query;

    // filename = 'Pipera1.xlsx'; // Adjust filename as needed

    // Validate query parameters
    if (!date || !startTime || !endTime || !service) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    // const filePath = path.join(SERVICES_DIR, filename);
    const filePath = '';

    // if (!fs.existsSync(filePath)) {
    //     return res.status(404).json({ error: 'File not found.' });
    // }

    try {
        const result = await analyzeVehicles(filePath, date, startTime, endTime, 'One Entry and one Exit');
        res.json(result);
        console.log('Analyzed vehicle data:', result);
    } catch (error) {
        console.error('Error analyzing vehicle data:', error);
        res.status(500).json({ error: 'Failed to analyze vehicle data.' });
    }
});

module.exports = router;
