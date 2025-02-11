import CryptoJS from 'crypto-js';

// const SECRET_KEY = CryptoJS.enc.Utf8.parse('1234567890123456'); // ✅ 16 字节密钥
const SECRET_KEY = CryptoJS.enc.Utf8.parse(import.meta.env.VITE_CRYPTO_SECRET_KEY);

export const aesEncrypt = (text: string): string => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY, {
    mode: CryptoJS.mode.ECB, // ✅ 明确指定 ECB
    padding: CryptoJS.pad.Pkcs7 // ✅ 使用 PKCS7 填充
  }).toString();
};
