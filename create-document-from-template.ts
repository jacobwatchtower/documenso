// import { initClient } from '@ts-rest/core';
// import { ApiContractV1 } from './packages/api/v1/contract';

// const API_TOKEN = 'api_wllqm03u7s3evgyo';
// const BASE_URL = 'http://localhost:3000';

// const main = async () => {

//   const client = initClient(ApiContractV1, {
//     baseUrl: `${BASE_URL}/api/v1`,
//     baseHeaders: {
//       authorization: `Bearer ${API_TOKEN}`,
//     },
//   });

//   console.log('📋 Fetching templates...\n');

//   // Get all templates
//   const templatesResponse = await client.getTemplates({
//     query: {
//       page: '1',
//       perPage: '10',
//     },
//   });

//   if (templatesResponse.status !== 200) {
//     console.error('❌ Failed to fetch templates');
//     console.error('Status:', templatesResponse.status);
//     console.error('Body:', templatesResponse.body);
//     process.exit(1);
//   }

//   const templates = templatesResponse.body.data;

//   if (!templates || templates.length === 0) {
//     console.error('❌ No templates found');
//     process.exit(1);
//   }

//   console.log(`Found ${templates.length} template(s):\n`);
//   templates.forEach((template, index) => {
//     console.log(`${index + 1}. Template ID: ${template.id}`);
//     console.log(`   Title: ${template.title}`);
//     console.log(`   Created: ${template.createdAt}`);
//     console.log('');
//   });

//   // Use the most recent template (first one)
//   const selectedTemplate = templates[0];
//   console.log(`\n✅ Using template: "${selectedTemplate.title}" (ID: ${selectedTemplate.id})\n`);

//   // Get template details
//   const templateDetailsResponse = await client.getTemplate({
//     params: {
//       id: selectedTemplate.id.toString(),
//     },
//   });

//   if (templateDetailsResponse.status !== 200) {
//     console.error('❌ Failed to fetch template details');
//     console.error('Status:', templateDetailsResponse.status);
//     process.exit(1);
//   }

//   const templateDetails = templateDetailsResponse.body;
//   console.log('Template details:');
//   console.log('  Title:', templateDetails.title);
//   console.log('  Recipients:', templateDetails.Recipient?.length || 0);
//   console.log('  Fields:', templateDetails.Field?.length || 0);
//   console.log('');

//   // Create document from template
//   console.log('📄 Creating document from template for jcollingj@gmail.com...\n');

//   const createDocResponse = await client.generateDocumentFromTemplate({
//     params: {
//       templateId: selectedTemplate.id.toString(),
//     },
//     body: {
//       title: `Test Document - ${new Date().toISOString()}`,
//       recipients: [
//         {
//           id: templateDetails.Recipient?.[0]?.id || 0,
//           email: 'jcollingj@gmail.com',
//           name: 'Jacob Colling',
//         },
//       ],
//       meta: {
//         subject: 'Test Document for Signing',
//         message: 'Hi Jacob, please review and sign this test document.',
//       },
//     },
//   });

//   if (createDocResponse.status !== 200) {
//     console.error('❌ Failed to create document from template');
//     console.error('Status:', createDocResponse.status);
//     console.error('Body:', createDocResponse.body);
//     process.exit(1);
//   }

//   const document = createDocResponse.body;
//   console.log('✅ Document created successfully!\n');
//   console.log('Document ID:', document.id);
//   console.log('Title:', document.title);
//   console.log('Status:', document.status);
//   console.log('');

//   // Send the document
//   console.log('📧 Sending document for signing...\n');

//   const sendResponse = await client.sendDocument({
//     params: {
//       id: document.id.toString(),
//     },
//     body: {
//       sendEmail: true,
//     },
//   });

//   if (sendResponse.status !== 200) {
//     console.error('❌ Failed to send document');
//     console.error('Status:', sendResponse.status);
//     console.error('Body:', sendResponse.body);
//     process.exit(1);
//   }

//   console.log('✅ Document sent successfully!\n');
//   console.log('📬 Email should be sent to: jcollingj@gmail.com');
//   console.log('🔗 Document URL:', `${BASE_URL}/documents/${document.id}`);
// };

// main().catch((error) => {
//   console.error('❌ Error:', error);
//   process.exit(1);
// });
