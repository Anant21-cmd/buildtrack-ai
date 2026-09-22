const fs = require('fs');
let schema = fs.readFileSync('server/prisma/schema.prisma', 'utf8');

schema = schema.replace(
  'role           Role\\n  isEmailVerified Boolean   @default(false)\\n  verificationCode String?\\n  verificationCodeExpires DateTime?',
  'role           Role\n  isEmailVerified Boolean   @default(false)\n  verificationCode String?\n  verificationCodeExpires DateTime?'
);

fs.writeFileSync('server/prisma/schema.prisma', schema);
