
const fs = require('fs');
const path = require('path');

const samplePath = path.join(__dirname, 'sample_cibil.txt');
const outputPath = path.join(__dirname, 'large_cibil.txt');

try {
    const content = fs.readFileSync(samplePath, 'utf8');
    // Repeat content 100 times to simulate a large file (~50-100 pages)
    const largeContent = Array(100).fill(content).join('\n\n' + '='.repeat(50) + '\n\n');

    fs.writeFileSync(outputPath, largeContent);
    console.log(`Created large_cibil.txt with size: ${(largeContent.length / 1024).toFixed(2)} KB`);
} catch (err) {
    console.error('Error creating large file:', err);
}
