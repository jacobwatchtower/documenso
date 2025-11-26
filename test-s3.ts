// import { S3Client } from 'bun';

// // Load credentials from environment
// const credentials = {
//   accessKeyId: process.env.NEXT_PRIVATE_UPLOAD_ACCESS_KEY_ID!,
//   secretAccessKey: process.env.NEXT_PRIVATE_UPLOAD_SECRET_ACCESS_KEY!,
//   bucket: process.env.NEXT_PRIVATE_UPLOAD_BUCKET!,
//   endpoint: process.env.NEXT_PRIVATE_UPLOAD_ENDPOINT!,
//   region: process.env.NEXT_PRIVATE_UPLOAD_REGION || 'us-east-1',
// };
// console.log(credentials);

// console.log('🔧 S3 Configuration:');
// console.log(`   Endpoint: ${credentials.endpoint}`);
// console.log(`   Bucket: ${credentials.bucket}`);
// console.log(`   Region: ${credentials.region}`);
// console.log(`   Access Key: ${credentials.accessKeyId?.slice(0, 8)}...`);
// console.log('');

// try {
//   console.log('📋 Listing objects in bucket...');
//   const client = new S3Client({
//     accessKeyId: process.env.NEXT_PRIVATE_UPLOAD_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.NEXT_PRIVATE_UPLOAD_SECRET_ACCESS_KEY!,
//     bucket: process.env.NEXT_PRIVATE_UPLOAD_BUCKET!,
//     endpoint: process.env.NEXT_PRIVATE_UPLOAD_ENDPOINT!,
//     region: process.env.NEXT_PRIVATE_UPLOAD_REGION || 'us-east-1',
//   });
//   // List all objects in the bucket
//   const result = await S3Client.list(
//     {
//       maxKeys: 1000,
//       fetchOwner: false,
//     },
//     credentials,
//   );
//   console.log('Done with response');

//   if (!result.contents || result.contents.length === 0) {
//     console.log('❌ No objects found in bucket');
//   } else {
//     console.log(`✅ Found ${result.contents.length} object(s):\n`);

//     let totalSize = 0;

//     for (const obj of result.contents) {
//       const sizeKB = (obj.size / 1024).toFixed(2);
//       const sizeMB = (obj.size / (1024 * 1024)).toFixed(2);
//       const sizeDisplay = obj.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;

//       console.log(`📄 ${obj.key}`);
//       console.log(`   Size: ${sizeDisplay} (${obj.size.toLocaleString()} bytes)`);
//       console.log(`   Last Modified: ${obj.lastModified}`);
//       console.log(`   ETag: ${obj.etag}`);
//       console.log('');

//       totalSize += obj.size;
//     }

//     const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
//     console.log(`📊 Total storage used: ${totalMB} MB (${totalSize.toLocaleString()} bytes)`);

//     if (result.isTruncated) {
//       console.log('\n⚠️  More objects available (result truncated at 1000)');
//     }
//   }

//   // Test reading a specific file if any exist
//   if (result.contents && result.contents.length > 0) {
//     console.log('\n🔍 Testing file access...');
//     const testKey = result.contents[0].key;
//     console.log(`   Attempting to read: ${testKey}`);

//     const client = new S3Client(credentials);
//     const file = client.file(testKey);

//     // Check if file exists
//     const exists = await file.exists();
//     console.log(`   ✅ File exists: ${exists}`);

//     // Get file stats
//     const stat = await file.stat();
//     console.log(`   Size: ${stat.size} bytes`);
//     console.log(`   Type: ${stat.type}`);
//     console.log(`   ETag: ${stat.etag}`);

//     // Generate a presigned URL
//     const presignedUrl = file.presign({
//       expiresIn: 3600, // 1 hour
//     });
//     console.log(`   🔗 Presigned URL (expires in 1 hour):`);
//     console.log(`      ${presignedUrl.slice(0, 100)}...`);
//   }
// } catch (error) {
//   console.error('❌ Error accessing S3:', error);

//   if (error instanceof Error) {
//     console.error(`   Message: ${error.message}`);
//     console.error(`   Name: ${error.name}`);
//   }

//   process.exit(1);
// }
