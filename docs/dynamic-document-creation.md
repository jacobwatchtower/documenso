Our central goal in using Documenso is to create documents dynamically based on user information. Each document will require N "AOACountyDetailPages" and 1 "AOASigningPage". These are in the /document-templates folder.

We want to do a target experiment to see if we can create these documents dynmaically. We're going to do this in 3 steps:

1. First, we need to figure out how to place fields dynamically when creating a document.
You should be able to introspect this document to figure it out
http://localhost:3000/t/personal_kxmtbctzfnibtcwa/templates/envelope_vmcrbmhetlwconlw/edit?step=addFields
This should have some guidance. We can use this to start and then figure it out from there.

2. Create a document that has 2 AOACountyDetailPages and 1 AOASigning page.

We'll want to create a type for this and function that can handle the whole logic. This can be a test script for now.
For the AOACountyDetail page we should have:
county_name: "Dallas",
client_address: "2840 Blake St"
properties {account_number, address}[]: [{account_number: "1234567890", address: "2840 Blake St"}]

And then create a secodn page with similar details.

And then create the signing page.

# End Goal
For this test, we want to see if it's possible to create a document with two AOA pages and 1 signature page.
You can send it to jcollingj@gmail.com for now.

# Implementation
We want to create a bun ts script that hits the API endpoints directly. This will be an external integration. So we don't want to use the internal logic of the app. It should all be driven through the API.