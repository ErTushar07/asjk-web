const crypto = require('crypto');

const creds = [
  { email: 'amin.ganai@asfjk.org', pass: 'AdminPassword2026!#', salt: '7a91f3c8e42b1096d5a23f1e8c9b4a70' },
  { email: 'michael.carter@asfjk.org', pass: 'FinancePassword2026!#', salt: '8b92f4d9e53c2197e6b34f2f9d0c5b81' },
  { email: 'daniel.wilson@asfjk.org', pass: 'ProjectPassword2026!#', salt: '9c03f5eaf64d3208f7c45f30ae1d6c92' },
  { email: 'david.thompson@example.com', pass: 'DonorPassword2026!', salt: '6f80e2b7d31a0985c4912e0d7b8a396f' }
];

creds.forEach(c => {
  const hash = crypto.pbkdf2Sync(c.pass, c.salt, 100000, 32, 'sha256').toString('hex');
  console.log(`${c.email}: ${hash}`);
});
