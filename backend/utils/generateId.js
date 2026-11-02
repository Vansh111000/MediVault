const crypto = require('crypto');

/**
 * Generate unique MediVault ID in format MV-XXXXX (e.g., MV-84920)
 */
const generateMediVaultId = () => {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `MV-${num}`;
};

/**
 * Generate secure random activation code for unclaimed patients (e.g. ACT-839201)
 */
const generateActivationCode = () => {
  const code = Math.floor(100000 + Math.random() * 900000);
  return `ACT-${code}`;
};

/**
 * Hash activation code for secure storage
 */
const hashActivationCode = (code) => {
  return crypto.createHash('sha256').update(code).digest('hex');
};

module.exports = {
  generateMediVaultId,
  generateActivationCode,
  hashActivationCode
};
