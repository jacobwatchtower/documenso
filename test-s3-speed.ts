// #!/usr/bin/env bun
// import { S3Client } from "bun";

// // Load credentials from environment
// const credentials = {
//   accessKeyId: process.env.NEXT_PRIVATE_UPLOAD_ACCESS_KEY_ID!,
//   secretAccessKey: process.env.NEXT_PRIVATE_UPLOAD_SECRET_ACCESS_KEY!,
//   bucket: process.env.NEXT_PRIVATE_UPLOAD_BUCKET!,
//   endpoint: process.env.NEXT_PRIVATE_UPLOAD_ENDPOINT!,
//   region: process.env.NEXT_PRIVATE_UPLOAD_REGION || "us-east-1",
// };

// const client = new S3Client(credentials);

// // Get the file key from command line argument, or list files first
// const fileKey = process.argv[2];

// if (!fileKey) {
//   console.log("❌ Please provide a file key as an argument");
//   console.log("\nUsage: bun test-s3-speed.ts <file-key>");
//   console.log("\nListing available files...\n");

//   const result = await S3Client.list({ maxKeys: 10 }, credentials);

//   if (result.contents && result.contents.length > 0) {
//     console.log("Available files:");
//     for (const obj of result.contents) {
//       const sizeKB = (obj.size / 1024).toFixed(2);
//       console.log(`  • ${obj.key} (${sizeKB} KB)`);
//     }
//     console.log(`\nExample: bun test-s3-speed.ts "${result.contents[0].key}"`);
//   }
//   process.exit(1);
// }

// console.log(`🎯 Fetching: ${fileKey}`);
// console.log(`📍 Endpoint: ${credentials.endpoint}`);
// console.log(`📦 Bucket: ${credentials.bucket}\n`);

// const file = client.file(fileKey);

// // Test 1: Check if exists (HEAD request)
// console.log("1️⃣  Testing HEAD request (exists check)...");
// const existsStart = performance.now();
// const exists = await file.exists();
// const existsEnd = performance.now();
// const existsTime = (existsEnd - existsStart).toFixed(2);

// if (!exists) {
//   console.log(`❌ File does not exist: ${fileKey}`);
//   process.exit(1);
// }

// console.log(`   ✅ File exists`);
// console.log(`   ⏱️  Time: ${existsTime}ms\n`);

// // Test 2: Get file stats (HEAD request with metadata)
// console.log("2️⃣  Testing stat() - get metadata...");
// const statStart = performance.now();
// const stat = await file.stat();
// const statEnd = performance.now();
// const statTime = (statEnd - statStart).toFixed(2);

// const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);
// const sizeKB = (stat.size / 1024).toFixed(2);
// const sizeDisplay = stat.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;

// console.log(`   📊 Size: ${sizeDisplay} (${stat.size.toLocaleString()} bytes)`);
// console.log(`   📝 Type: ${stat.type}`);
// console.log(`   🔖 ETag: ${stat.etag}`);
// console.log(`   📅 Last Modified: ${stat.lastModified}`);
// console.log(`   ⏱️  Time: ${statTime}ms\n`);

// // Test 3: Download full file
// console.log("3️⃣  Testing full download (GET request)...");
// const downloadStart = performance.now();
// const data = await file.arrayBuffer();
// const downloadEnd = performance.now();
// const downloadTime = (downloadEnd - downloadStart).toFixed(2);

// const downloadedMB = (data.byteLength / (1024 * 1024)).toFixed(2);
// const throughputMBps = (data.byteLength / (1024 * 1024) / (downloadTime / 1000)).toFixed(2);

// console.log(`   ✅ Downloaded: ${downloadedMB} MB`);
// console.log(`   ⏱️  Time: ${downloadTime}ms`);
// console.log(`   🚀 Throughput: ${throughputMBps} MB/s\n`);

// // Test 4: Partial read (first 1KB)
// console.log("4️⃣  Testing partial read (first 1KB with Range header)...");
// const partialStart = performance.now();
// const partial = await file.slice(0, 1024).arrayBuffer();
// const partialEnd = performance.now();
// const partialTime = (partialEnd - partialStart).toFixed(2);

// console.log(`   ✅ Downloaded: ${partial.byteLength} bytes`);
// console.log(`   ⏱️  Time: ${partialTime}ms\n`);

// // Test 5: Presign URL (synchronous - no network request)
// console.log("5️⃣  Testing presign URL generation (no network)...");
// const presignStart = performance.now();
// const presignedUrl = file.presign({ expiresIn: 3600 });
// const presignEnd = performance.now();
// const presignTime = (presignEnd - presignStart).toFixed(3);

// console.log(`   ✅ Generated presigned URL`);
// console.log(`   ⏱️  Time: ${presignTime}ms (synchronous, no network call)`);
// console.log(`   🔗 URL: ${presignedUrl.slice(0, 80)}...\n`);

// // Summary
// console.log("📈 Summary:");
// console.log(`   HEAD (exists):     ${existsTime}ms`);
// console.log(`   HEAD (stat):       ${statTime}ms`);
// console.log(`   GET (full file):   ${downloadTime}ms (${throughputMBps} MB/s)`);
// console.log(`   GET (1KB partial): ${partialTime}ms`);
// console.log(`   Presign (sync):    ${presignTime}ms`);
// console.log(`\n   Total file size:   ${sizeDisplay}`);
