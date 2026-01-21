import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const envelope = await prisma.envelope.findFirst({
    where: { id: 'envelope_kfrrrlmmcramtywf' },
    include: {
      fields: true,
      recipients: true,
      envelopeItems: true,
    },
  });

  if (!envelope) {
    console.log('Envelope not found');
    return;
  }

  console.log('=== ENVELOPE INFO ===');
  console.log('Title:', envelope.title);
  console.log('Status:', envelope.status);
  console.log('');

  // Filter for checkboxes
  const checkboxFields = envelope.fields.filter((f) => f.type === 'CHECKBOX');

  console.log('=== CHECKBOX FIELDS ===');
  console.log('Total checkboxes:', checkboxFields.length);
  console.log('');

  checkboxFields.forEach((field, i) => {
    console.log(`--- Checkbox ${i + 1} ---`);
    console.log('ID:', field.id);
    console.log('Page:', field.page);
    console.log('Position X:', field.positionX.toString());
    console.log('Position Y:', field.positionY.toString());
    console.log('Width:', field.width.toString());
    console.log('Height:', field.height.toString());
    console.log('Field Meta:', JSON.stringify(field.fieldMeta, null, 2));
    console.log('');
  });

  // Filter for text fields
  const textFields = envelope.fields.filter((f) => f.type === 'TEXT');

  console.log('=== TEXT FIELDS ===');
  console.log('Total text fields:', textFields.length);
  console.log('');

  textFields.forEach((field, i) => {
    console.log(`--- Text Field ${i + 1} ---`);
    console.log('ID:', field.id);
    console.log('Page:', field.page);
    console.log('Position X:', field.positionX.toString());
    console.log('Position Y:', field.positionY.toString());
    console.log('Width:', field.width.toString());
    console.log('Height:', field.height.toString());
    console.log('Custom Text:', field.customText || '(empty)');
    console.log('Field Meta:', JSON.stringify(field.fieldMeta, null, 2));
    console.log('');
  });

  // Also show all field types for context
  console.log('=== ALL FIELD TYPES ===');
  const fieldTypes: Record<string, number> = {};
  envelope.fields.forEach((f) => {
    fieldTypes[f.type] = (fieldTypes[f.type] || 0) + 1;
  });
  console.log(fieldTypes);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
