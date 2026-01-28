const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function drawSplashIcon(canvas) {
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const scale = size / 300;

    // Clear canvas (transparent background)
    ctx.clearRect(0, 0, size, size);

    // Calculate dimensions
    const padding = 20 * scale;
    const signSize = size - (padding * 2);
    const cornerRadius = 30 * scale;
    const borderWidth = 8 * scale;

    // Colors - matching the image
    const greenColor = '#3d8c40';
    const whiteColor = '#ffffff';

    // Draw outer rounded rectangle (white border)
    ctx.fillStyle = whiteColor;
    drawRoundedRect(ctx, padding, padding, signSize, signSize, cornerRadius);
    ctx.fill();

    // Draw inner rounded rectangle (green fill)
    const innerPadding = padding + borderWidth;
    const innerSize = signSize - (borderWidth * 2);
    const innerRadius = cornerRadius - (borderWidth * 0.5);

    ctx.fillStyle = greenColor;
    drawRoundedRect(ctx, innerPadding, innerPadding, innerSize, innerSize, innerRadius);
    ctx.fill();

    // Draw "+1" text
    ctx.fillStyle = whiteColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Calculate font size to fit nicely
    const fontSize = size * 0.45;
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;

    // Position text in center
    const centerX = size / 2;
    const centerY = size / 2;

    ctx.fillText('+1', centerX, centerY);
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function saveImage(size, outputPath) {
    const canvas = createCanvas(size, size);
    drawSplashIcon(canvas);
    
    const buffer = canvas.toBuffer('image/png');
    
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, buffer);
    console.log(`Created: ${outputPath} (${size}x${size})`);
}

// Generate all splash images
const basePath = __dirname;

// Android drawable folders
saveImage(300, path.join(basePath, 'android/app/src/main/res/drawable-mdpi/splashscreen_logo.png'));
saveImage(450, path.join(basePath, 'android/app/src/main/res/drawable-hdpi/splashscreen_logo.png'));
saveImage(600, path.join(basePath, 'android/app/src/main/res/drawable-xhdpi/splashscreen_logo.png'));
saveImage(900, path.join(basePath, 'android/app/src/main/res/drawable-xxhdpi/splashscreen_logo.png'));
saveImage(1200, path.join(basePath, 'android/app/src/main/res/drawable-xxxhdpi/splashscreen_logo.png'));

// Expo assets splash
saveImage(1200, path.join(basePath, 'assets/splash-icon.png'));

console.log('\nAll splash images generated successfully!');
