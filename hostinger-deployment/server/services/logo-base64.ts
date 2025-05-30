import fs from 'fs';
import path from 'path';

// Get the base64 encoded logo data
const logoPath = path.join(__dirname, '../assets/petrodeal-logo.png');
const logoData = fs.readFileSync(logoPath);
export const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;