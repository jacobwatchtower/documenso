# Creating Documents from Templates via API

This guide shows how to use the Documenso API v1 to create and send documents from existing templates.

## Prerequisites

- API token (generate from account settings)
- Template ID (get from API or UI)
- Running Documenso instance

## Step 1: Get Available Templates

First, fetch all available templates to find the one you want to use:

```bash
curl -X GET "http://localhost:3000/api/v1/templates?page=1&perPage=10" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "templates": [
    {
      "id": 9,
      "title": "50-162.pdf",
      "userId": 5,
      "teamId": 5,
      "createdAt": "2025-11-20T00:21:44.374Z",
      "Recipient": [...],
      "Field": [...]
    }
  ],
  "totalPages": 1
}
```

Note the `id` and `Recipient.id` from the template - you'll need these.

## Step 2: Create Document from Template

Use the template ID to generate a new document:

```bash
curl -X POST "http://localhost:3000/api/v1/templates/9/generate-document" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Document for Jacob",
    "recipients": [
      {
        "id": 23,
        "email": "jcollingj@gmail.com",
        "name": "Jacob Colling"
      }
    ],
    "meta": {
      "subject": "Test Document - Please Sign",
      "message": "Hi Jacob, please review and sign this test document."
    }
  }'
```

**Request Body Fields:**
- `title` - Custom title for the document (overrides template title)
- `recipients` - Array of recipients
  - `id` - Recipient ID from the template (use the template's recipient ID)
  - `email` - Recipient's email address (replaces template recipient email)
  - `name` - Recipient's name
- `meta` - Email metadata
  - `subject` - Email subject line
  - `message` - Email body message

**Response:**
```json
{
  "documentId": 26,
  "recipients": [
    {
      "recipientId": 33,
      "name": "Jacob Colling",
      "email": "jcollingj@gmail.com",
      "token": "-bwPivTXCjL-AuYcdWI7q",
      "role": "SIGNER",
      "signingOrder": 1,
      "signingUrl": "http://localhost:3000/sign/-bwPivTXCjL-AuYcdWI7q"
    }
  ]
}
```

Note the `documentId` - you'll need it to send the document.

## Step 3: Send Document for Signing

Send the document to recipients via email:

```bash
curl -X POST "http://localhost:3000/api/v1/documents/26/send" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sendEmail": true
  }'
```

**Request Body Fields:**
- `sendEmail` - Set to `true` to send email via SMTP, or `false` to skip sending email (you'd manually share the signing URL)

**Response:**
```json
{
  "message": "Document sent for signing successfully",
  "id": 26,
  "title": "Test Document for Jacob",
  "status": "PENDING",
  "recipients": [
    {
      "id": 33,
      "email": "jcollingj@gmail.com",
      "name": "Jacob Colling",
      "signingUrl": "http://localhost:3000/sign/-bwPivTXCjL-AuYcdWI7q",
      "sendStatus": "NOT_SENT",
      "signingStatus": "NOT_SIGNED"
    }
  ]
}
```

## Complete Example

Here's a complete bash script to create and send a document:

```bash
#!/bin/bash

API_TOKEN="api_wllqm03u7s3evgyo"
BASE_URL="http://localhost:3000"
TEMPLATE_ID=9
RECIPIENT_ID=23  # Get this from the template

# Create document from template
RESPONSE=$(curl -s -X POST "${BASE_URL}/api/v1/templates/${TEMPLATE_ID}/generate-document" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Contract for Review",
    "recipients": [
      {
        "id": '${RECIPIENT_ID}',
        "email": "client@example.com",
        "name": "Client Name"
      }
    ],
    "meta": {
      "subject": "Please review and sign this contract",
      "message": "Hi, please review and sign the attached contract at your earliest convenience."
    }
  }')

# Extract document ID
DOCUMENT_ID=$(echo $RESPONSE | jq -r '.documentId')

echo "Document created with ID: $DOCUMENT_ID"

# Send document
curl -X POST "${BASE_URL}/api/v1/documents/${DOCUMENT_ID}/send" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "sendEmail": true
  }'

echo "Document sent successfully!"
```

## Important Notes

### Recipient ID Mapping

When creating a document from a template, you **must** provide the recipient `id` from the original template. This maps the new recipient email to the correct template recipient (which has fields assigned to it).

**Incorrect:**
```json
{
  "recipients": [
    {
      "email": "new@example.com",  // Missing 'id' field
      "name": "New Person"
    }
  ]
}
```

**Correct:**
```json
{
  "recipients": [
    {
      "id": 23,  // ID from template's Recipient array
      "email": "new@example.com",
      "name": "New Person"
    }
  ]
}
```

### Field Prefilling

You can prefill template fields when creating the document. See the API documentation for field prefilling options.

### SMTP Configuration

The `sendEmail: true` option uses your configured SMTP server (see `aws-ses-smtp-setup.md`). Ensure your SMTP settings are configured in `.env` before sending documents.

## API Documentation

For complete API documentation, see:
- OpenAPI docs: http://localhost:3000/api/v1/openapi.json
- API examples: `packages/api/v1/examples/`

## Troubleshooting

### "Failed to create document"
- Verify your API token is valid
- Ensure the template ID exists
- Check that recipient ID matches a recipient in the template

### "Email not sent"
- Check SMTP configuration in `.env`
- Verify sender email is verified in AWS SES (if using SES)
- Check application logs for email errors

### "Recipient not found"
- Make sure you're using the correct recipient `id` from the template
- Fetch the template details first to get the correct recipient ID
