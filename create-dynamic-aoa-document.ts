/**
 * Dynamic AOA Document Creation
 *
 * This script creates documents dynamically with:
 * - N county detail pages (AOACountyDetailPage.pdf)
 * - 1 signing page (AOASigningPage.pdf)
 *
 * Each page has fields placed dynamically based on the data provided.
 */

import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';

const API_TOKEN = process.env.API_TOKEN || '';
const BASE_URL = process.env.BASE_URL || 'https://documenso-dev.up.railway.app';

if (!API_TOKEN) {
  console.error('❌ Error: API_TOKEN environment variable is required');
  console.log('\nUsage: API_TOKEN=your-token BASE_URL=https://your-url.com bun create-dynamic-aoa-document.ts');
  console.log('Or set them in your .env file');
  process.exit(1);
}

// Type definitions
type Property = {
  account_number: string;
  address: string;
};

type CountyPageData = {
  county_name: string;
  client_address: string;
  properties: Property[];
};

type SigningPageData = {
  client_name: string;
  client_email: string;
};

type AOADocumentData = {
  countyPages: CountyPageData[];
  signingPage: SigningPageData;
  recipientEmail: string;
  recipientName: string;
};

/**
 * Field position constants for County Detail Page
 * These are based on inspecting the template at:
 * http://localhost:3000/t/personal_kxmtbctzfnibtcwa/templates/envelope_vmcrbmhetlwconlw/edit?step=addFields
 */
const COUNTY_DETAIL_FIELDS = {
  COUNTY_NAME: {
    pageX: 4.625,
    pageY: 20.8695652173913,
    pageWidth: 33.75, // 11.25 * 3
    pageHeight: 2.898550724637681,
  },
  CLIENT_ADDRESS: {
    pageX: 4.999999999999993,
    pageY: 27.82608695652174,
    pageWidth: 33.75, // 11.25 * 3
    pageHeight: 2.898550724637681,
  },
  PROPERTY_ACCOUNT: {
    pageX: 7.812499999999998,
    pageY: 54.20306180320236,
    pageWidth: 33.75, // 11.25 * 3
    pageHeight: 2.898550724637681,
  },
  PROPERTY_ADDRESS: {
    pageX: 28.31250000000001,
    pageY: 54.30614360334191,
    pageWidth: 33.75, // 11.25 * 3
    pageHeight: 2.898550724637681,
  },
};

/**
 * Field position constants for Signing Page
 * All widths match the county detail fields (33.75)
 */
const SIGNING_PAGE_FIELDS = {
  CLIENT_NAME: {
    pageX: 11.9375,
    pageY: 9.323834750062279,
    pageWidth: 33.75, // Same as county detail fields
    pageHeight: 2.898550724637679,
  },
  CLIENT_ADDRESS: {
    pageX: 11.93750000000001,
    pageY: 12.99516908212565,
    pageWidth: 33.75, // Same as county detail fields
    pageHeight: 2.898550724637682,
  },
  SIGNATURE: {
    pageX: 15.06250000000003,
    pageY: 66.03864734299505,
    pageWidth: 33.75, // Same as county detail fields
    pageHeight: 2.898550724637677,
  },
  NAME: {
    pageX: 16.06249999999999,
    pageY: 72.22222222222236,
    pageWidth: 33.75, // Same as county detail fields
    pageHeight: 2.898550724637688,
  },
  CLIENT_EMAIL: {
    pageX: 60.75608480236491,
    pageY: 72.19347754717863,
    pageWidth: 33.75, // Same as county detail fields
    pageHeight: 2.898550724637688,
  },
};

/**
 * Merge multiple PDFs into a single PDF
 */
async function mergePDFs(pdfPaths: string[]): Promise<Buffer> {
  console.log(`  📑 Merging ${pdfPaths.length} PDF files...`);

  const mergedPdf = await PDFDocument.create();

  for (const pdfPath of pdfPaths) {
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdf = await PDFDocument.load(pdfBytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
    console.log(`    ✅ Added ${pdf.getPageCount()} page(s) from ${path.basename(pdfPath)}`);
  }

  const mergedPdfBytes = await mergedPdf.save();
  console.log(`  ✅ Merged PDF created with ${mergedPdf.getPageCount()} total pages`);

  return Buffer.from(mergedPdfBytes);
}

/**
 * Upload a PDF buffer to the document using the upload URL
 */
async function uploadPDF(uploadUrl: string, pdfBuffer: Buffer): Promise<void> {
  console.log(`  📤 Uploading merged PDF...`);

  // Upload the PDF
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/pdf',
    },
    body: pdfBuffer,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload PDF: ${uploadResponse.statusText}`);
  }

  console.log(`  ✅ PDF uploaded successfully`);
}

/**
 * Create a recipient for the document
 */
async function createRecipient(
  documentId: number,
  email: string,
  name: string
): Promise<number> {
  console.log(`  👤 Creating recipient: ${name} (${email})`);

  const response = await fetch(`${BASE_URL}/api/v1/documents/${documentId}/recipients`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      email,
      role: 'SIGNER',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create recipient: ${error}`);
  }

  const data = await response.json();
  console.log(`  ✅ Recipient created with ID: ${data.recipientId}`);
  return data.recipientId;
}

/**
 * Create fields for a county detail page
 */
async function createCountyDetailFields(
  documentId: number,
  recipientId: number,
  pageNumber: number,
  countyData: CountyPageData
): Promise<void> {
  console.log(`  📝 Creating fields for county page ${pageNumber}: ${countyData.county_name}`);

  const fields = [];

  // County name field
  fields.push({
    recipientId,
    type: 'TEXT',
    pageNumber,
    pageX: COUNTY_DETAIL_FIELDS.COUNTY_NAME.pageX,
    pageY: COUNTY_DETAIL_FIELDS.COUNTY_NAME.pageY,
    pageWidth: COUNTY_DETAIL_FIELDS.COUNTY_NAME.pageWidth,
    pageHeight: COUNTY_DETAIL_FIELDS.COUNTY_NAME.pageHeight,
    fieldMeta: {
      label: 'County Name',
      type: 'text',
      required: false,
      readOnly: true,
      text: countyData.county_name,
      fontSize: 12,
      textAlign: 'left',
    },
  });

  // Client address field
  fields.push({
    recipientId,
    type: 'TEXT',
    pageNumber,
    pageX: COUNTY_DETAIL_FIELDS.CLIENT_ADDRESS.pageX,
    pageY: COUNTY_DETAIL_FIELDS.CLIENT_ADDRESS.pageY,
    pageWidth: COUNTY_DETAIL_FIELDS.CLIENT_ADDRESS.pageWidth,
    pageHeight: COUNTY_DETAIL_FIELDS.CLIENT_ADDRESS.pageHeight,
    fieldMeta: {
      label: 'Client Address',
      type: 'text',
      required: false,
      readOnly: true,
      text: countyData.client_address,
      fontSize: 12,
      textAlign: 'left',
    },
  });

  // Property fields (account number and address for each property)
  countyData.properties.forEach((property, index) => {
    // Account number
    fields.push({
      recipientId,
      type: 'TEXT',
      pageNumber,
      pageX: COUNTY_DETAIL_FIELDS.PROPERTY_ACCOUNT.pageX,
      pageY: COUNTY_DETAIL_FIELDS.PROPERTY_ACCOUNT.pageY + (index * 5), // Offset each property row
      pageWidth: COUNTY_DETAIL_FIELDS.PROPERTY_ACCOUNT.pageWidth,
      pageHeight: COUNTY_DETAIL_FIELDS.PROPERTY_ACCOUNT.pageHeight,
      fieldMeta: {
        label: `Property ${index + 1} Account`,
        type: 'text',
        required: false,
        readOnly: true,
        text: property.account_number,
        fontSize: 12,
        textAlign: 'left',
      },
    });

    // Property address
    fields.push({
      recipientId,
      type: 'TEXT',
      pageNumber,
      pageX: COUNTY_DETAIL_FIELDS.PROPERTY_ADDRESS.pageX,
      pageY: COUNTY_DETAIL_FIELDS.PROPERTY_ADDRESS.pageY + (index * 5), // Offset each property row
      pageWidth: COUNTY_DETAIL_FIELDS.PROPERTY_ADDRESS.pageWidth,
      pageHeight: COUNTY_DETAIL_FIELDS.PROPERTY_ADDRESS.pageHeight,
      fieldMeta: {
        label: `Property ${index + 1} Address`,
        type: 'text',
        required: false,
        readOnly: true,
        text: property.address,
        fontSize: 12,
        textAlign: 'left',
      },
    });
  });

  // Create all fields
  const response = await fetch(`${BASE_URL}/api/v1/documents/${documentId}/fields`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(fields),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create fields: ${error}`);
  }

  console.log(`  ✅ Created ${fields.length} fields for county page`);
}

/**
 * Create fields for the signing page
 */
async function createSigningPageFields(
  documentId: number,
  recipientId: number,
  pageNumber: number,
  signingData: SigningPageData,
  clientAddress: string
): Promise<void> {
  console.log(`  📝 Creating fields for signing page`);

  const fields = [];

  // Client name field (read-only, prefilled)
  fields.push({
    recipientId,
    type: 'TEXT',
    pageNumber,
    pageX: SIGNING_PAGE_FIELDS.CLIENT_NAME.pageX,
    pageY: SIGNING_PAGE_FIELDS.CLIENT_NAME.pageY,
    pageWidth: SIGNING_PAGE_FIELDS.CLIENT_NAME.pageWidth,
    pageHeight: SIGNING_PAGE_FIELDS.CLIENT_NAME.pageHeight,
    fieldMeta: {
      label: 'Client Name',
      type: 'text',
      required: false,
      readOnly: true,
      text: signingData.client_name,
      fontSize: 12,
      textAlign: 'left',
    },
  });

  // Client address field (read-only, prefilled)
  fields.push({
    recipientId,
    type: 'TEXT',
    pageNumber,
    pageX: SIGNING_PAGE_FIELDS.CLIENT_ADDRESS.pageX,
    pageY: SIGNING_PAGE_FIELDS.CLIENT_ADDRESS.pageY,
    pageWidth: SIGNING_PAGE_FIELDS.CLIENT_ADDRESS.pageWidth,
    pageHeight: SIGNING_PAGE_FIELDS.CLIENT_ADDRESS.pageHeight,
    fieldMeta: {
      label: 'Address',
      type: 'text',
      required: false,
      readOnly: true,
      text: clientAddress,
      fontSize: 12,
      textAlign: 'left',
    },
  });

  // Signature field
  fields.push({
    recipientId,
    type: 'SIGNATURE',
    pageNumber,
    pageX: SIGNING_PAGE_FIELDS.SIGNATURE.pageX,
    pageY: SIGNING_PAGE_FIELDS.SIGNATURE.pageY,
    pageWidth: SIGNING_PAGE_FIELDS.SIGNATURE.pageWidth,
    pageHeight: SIGNING_PAGE_FIELDS.SIGNATURE.pageHeight,
    fieldMeta: {
      type: 'signature',
      fontSize: 18,
    },
  });

  // Name field (read-only, prefilled)
  fields.push({
    recipientId,
    type: 'TEXT',
    pageNumber,
    pageX: SIGNING_PAGE_FIELDS.NAME.pageX,
    pageY: SIGNING_PAGE_FIELDS.NAME.pageY,
    pageWidth: SIGNING_PAGE_FIELDS.NAME.pageWidth,
    pageHeight: SIGNING_PAGE_FIELDS.NAME.pageHeight,
    fieldMeta: {
      label: 'Name',
      type: 'text',
      required: false,
      readOnly: true,
      text: signingData.client_name,
      fontSize: 12,
      textAlign: 'left',
    },
  });

  // Client email field (read-only, prefilled)
  fields.push({
    recipientId,
    type: 'TEXT',
    pageNumber,
    pageX: SIGNING_PAGE_FIELDS.CLIENT_EMAIL.pageX,
    pageY: SIGNING_PAGE_FIELDS.CLIENT_EMAIL.pageY,
    pageWidth: SIGNING_PAGE_FIELDS.CLIENT_EMAIL.pageWidth,
    pageHeight: SIGNING_PAGE_FIELDS.CLIENT_EMAIL.pageHeight,
    fieldMeta: {
      label: 'Client Email',
      type: 'text',
      required: false,
      readOnly: true,
      text: signingData.client_email,
      fontSize: 12,
      textAlign: 'left',
    },
  });

  // Create all fields
  const response = await fetch(`${BASE_URL}/api/v1/documents/${documentId}/fields`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(fields),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create fields: ${error}`);
  }

  console.log(`  ✅ Created ${fields.length} fields for signing page`);
}

/**
 * Main function to create the dynamic AOA document
 */
async function createAOADocument(data: AOADocumentData): Promise<void> {
  console.log('\n🚀 Creating dynamic AOA document...\n');

  // Step 1: Create the document
  console.log('📄 Step 1: Creating document');
  const createDocResponse = await fetch(`${BASE_URL}/api/v1/documents`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: `AOA Document - ${new Date().toISOString()}`,
      recipients: [
        {
          name: data.recipientName,
          email: data.recipientEmail,
          role: 'SIGNER',
        },
      ],
      meta: {
        subject: 'AOA Document for Signing',
        message: `Hi ${data.recipientName}, please review and sign this AOA document.`,
      },
    }),
  });

  if (!createDocResponse.ok) {
    const error = await createDocResponse.text();
    throw new Error(`Failed to create document: ${error}`);
  }

  const createDocData = await createDocResponse.json();
  const documentId = createDocData.documentId;
  const recipientId = createDocData.recipients[0].recipientId;
  const uploadUrl = createDocData.uploadUrl;

  console.log(`✅ Document created with ID: ${documentId}`);
  console.log(`✅ Recipient ID: ${recipientId}`);
  console.log(`✅ Upload URL: ${uploadUrl.substring(0, 50)}...\n`);

  // Step 2: Merge PDFs
  console.log('📄 Step 2: Merging PDFs');
  const pdfPaths = [];

  // Add county detail pages
  data.countyPages.forEach(() => {
    pdfPaths.push(path.join(__dirname, 'doc-templates/AOACountyDetailPage.pdf'));
  });

  // Add signing page
  pdfPaths.push(path.join(__dirname, 'doc-templates/AOASigningPage.pdf'));

  const mergedPdfBuffer = await mergePDFs(pdfPaths);

  // Step 3: Upload merged PDF
  console.log('\n📤 Step 3: Uploading merged PDF');
  await uploadPDF(uploadUrl, mergedPdfBuffer);

  // Step 4: Create fields for county pages
  console.log('\n📝 Step 4: Creating fields for county pages');
  for (let i = 0; i < data.countyPages.length; i++) {
    await createCountyDetailFields(documentId, recipientId, i + 1, data.countyPages[i]);
  }

  // Step 5: Create fields for signing page
  console.log('\n📝 Step 5: Creating fields for signing page');
  const signingPageNumber = data.countyPages.length + 1;
  await createSigningPageFields(
    documentId,
    recipientId,
    signingPageNumber,
    data.signingPage,
    data.countyPages[0].client_address
  );

  console.log('\n✅ Document setup complete!');
  console.log(`🔗 Document URL: ${BASE_URL}/documents/${documentId}`);

  // Step 6: Send document
  console.log('\n📧 Step 6: Sending document...');
  const sendResponse = await fetch(`${BASE_URL}/api/v1/documents/${documentId}/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sendEmail: true,
    }),
  });

  if (!sendResponse.ok) {
    const error = await sendResponse.text();
    throw new Error(`Failed to send document: ${error}`);
  }

  console.log('✅ Document sent successfully!\n');
}

// Test data
const testData: AOADocumentData = {
  countyPages: [
    {
      county_name: 'Dallas',
      client_address: '2840 Blake St',
      properties: [
        {
          account_number: '1234567890',
          address: '2840 Blake St',
        },
      ],
    },
    {
      county_name: 'Tarrant',
      client_address: '2840 Blake St',
      properties: [
        {
          account_number: '9876543210',
          address: '123 Main St',
        },
        {
          account_number: '5555555555',
          address: '456 Oak Ave',
        },
      ],
    },
  ],
  signingPage: {
    client_name: 'Jacob Colling',
    client_email: 'jcollingj@gmail.com',
  },
  recipientEmail: 'jcollingj@gmail.com',
  recipientName: 'Jacob Colling',
};

// Run the script
createAOADocument(testData)
  .then(() => {
    console.log('🎉 Success!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  });
