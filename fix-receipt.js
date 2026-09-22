const fs = require('fs');
let schema = fs.readFileSync('server/prisma/schema.prisma', 'utf8');

const newModel = `
model MaterialReceipt {
  id             String    @id @default(uuid())
  poId           String
  purchaseOrder  PurchaseOrder @relation(fields: [poId], references: [id])
  materialId     String
  material       Material  @relation(fields: [materialId], references: [id])
  
  orderedQty     Float
  deliveredQty   Float
  isMismatch     Boolean   @default(false)
  mismatchReason String?
  receivedBy     String
  status         String    @default("VERIFIED")
  
  dateReceived   DateTime  @default(now())
}
`;

if (!schema.includes('model MaterialReceipt')) {
  schema = schema.replace('items          Json?', 'items          Json?\n  receipts       MaterialReceipt[]');
  schema = schema.replace('allocations    ProjectMaterialAllocation[]', 'allocations    ProjectMaterialAllocation[]\n  receipts       MaterialReceipt[]');
  fs.writeFileSync('server/prisma/schema.prisma', schema + newModel);
}

