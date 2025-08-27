// JWT Configuration
export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
  console.log('JWT Config: Using secret length:', secret.length, 'First 10 chars:', secret.substring(0, 10));
  return secret;
};

export const getJwtExpiresIn = (): string => {
  return process.env.JWT_EXPIRES_IN || '7d';
};
