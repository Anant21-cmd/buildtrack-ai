const fs = require('fs');
const content = `
model MaterialMarketPrice {
  id              String   @id @default(uuid())
  materialName    String
  brand           String?
  specification   String?
  unit            String
  price           Float
  minPrice        Float?
  maxPrice        Float?
  city            String   @default("Madurai")
  district        String   @default("Madurai")
  state           String   @default("Tamil Nadu")
  country         String   @default("India")
  sourceName      String
  sourceUrl       String?
  publishedAt     DateTime?
  retrievedAt     DateTime @default(now())
  status          String   @default("FRESH")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  history         MaterialPriceHistory[]
}

model MaterialPriceHistory {
  id              String   @id @default(uuid())
  marketPriceId   String
  marketPrice     MaterialMarketPrice @relation(fields: [marketPriceId], references: [id], onDelete: Cascade)
  price           Float
  unit            String
  city            String
  district        String
  state           String
  country         String
  sourceName      String
  sourceUrl       String?
  retrievedAt     DateTime @default(now())
  createdAt       DateTime @default(now())
}
`;
fs.appendFileSync('server/prisma/schema.prisma', content);

