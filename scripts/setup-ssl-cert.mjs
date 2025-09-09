#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Script to prepare SSL certificate for DigitalOcean App Platform
 * This converts the ca-certificate.crt file to a format suitable for environment variables
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const certPath = path.join(__dirname, '..', 'ca-certificate.crt');
const outputPath = path.join(__dirname, '..', 'ssl-cert-env.txt');

try {
  // Read the certificate file
  const certContent = fs.readFileSync(certPath, 'utf8');
  
  // Clean up the certificate content (remove extra whitespace, ensure proper line endings)
  const cleanCert = certContent.trim();
  
  // Create instructions for setting up the environment variable
  const instructions = `
# SSL Certificate Setup for DigitalOcean App Platform

## Step 1: Set the DATABASE_CA_CERT environment variable in DigitalOcean

Copy the certificate content below and set it as the DATABASE_CA_CERT environment variable in your DigitalOcean App Platform:

---CERTIFICATE CONTENT START---
${cleanCert}
---CERTIFICATE CONTENT END---

## Step 2: Alternative - Use doctl CLI to set the environment variable

You can also use the doctl CLI to set this environment variable:

\`\`\`bash
# First, save the certificate to a temporary file
cat > /tmp/db-cert.crt << 'EOF'
${cleanCert}
EOF

# Then set the environment variable using doctl
doctl apps update YOUR_APP_ID --spec .do/app.yaml

# Or set it directly via the CLI (replace YOUR_APP_ID with your actual app ID)
doctl apps create-deployment YOUR_APP_ID
\`\`\`

## Step 3: Verify the setup

After deployment, check the health endpoint: https://your-app-url.ondigitalocean.app/api/health

The response should show:
- status: "healthy"
- database: "connected"

## Certificate Info:
- File: ${certPath}
- Size: ${certContent.length} bytes
- Generated: ${new Date().toISOString()}
`;

  // Write the instructions to a file
  fs.writeFileSync(outputPath, instructions);
  
  console.log('✅ SSL certificate setup instructions generated!');
  console.log(`📄 Instructions saved to: ${outputPath}`);
  console.log('');
  console.log('🔧 Next steps:');
  console.log('1. Copy the certificate content from the generated file');
  console.log('2. Set DATABASE_CA_CERT environment variable in DigitalOcean App Platform');
  console.log('3. Deploy your application');
  console.log('4. Test the /api/health endpoint');
  console.log('');
  console.log('📋 Certificate content (copy this to DigitalOcean):');
  console.log('---');
  console.log(cleanCert);
  console.log('---');
  
} catch (error) {
  console.error('❌ Error processing SSL certificate:', error.message);
  console.error('');
  console.error('Make sure the ca-certificate.crt file exists in the project root.');
  process.exit(1);
}
