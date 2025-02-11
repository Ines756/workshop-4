import { webcrypto } from "crypto";

// #############
// ### Utils ###
// #############

// Function to convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("base64");
}

// Function to convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  var buff = Buffer.from(base64, "base64");
  return buff.buffer.slice(buff.byteOffset, buff.byteOffset + buff.byteLength);
}

// ################
// ### RSA keys ###
// ################

// Generates a pair of private / public RSA keys
type GenerateRsaKeyPair = {
  publicKey: webcrypto.CryptoKey;
  privateKey: webcrypto.CryptoKey;
};
export async function generateRsaKeyPair(): Promise<GenerateRsaKeyPair> {
  // TODO implement this function using the crypto package to generate a public and private RSA key pair.
  //      the public key should be used for encryption and the private key for decryption. Make sure the
  //      keys are extractable.

  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP', 
      modulusLength: 2048, // Length of the key
      publicExponent: new Uint8Array([1, 0, 1]), // Common public exponent
      hash: 'SHA-256', 
    },
    true, // Allow key extraction
    ['encrypt', 'decrypt'] // Public key for encryption, private key for decryption
  );

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey
  };
  // remove this
  //return { publicKey: {} as any, privateKey: {} as any };
}

// Export a crypto public key to a base64 string format
export async function exportPubKey(key: webcrypto.CryptoKey): Promise<string> {
  // TODO implement this function to return a base64 string version of a public key

  const exported = await crypto.subtle.exportKey("spki", key);
  const exportedKeyBuffer = new Uint8Array(exported);
  const base64Key = btoa(String.fromCharCode(...exportedKeyBuffer));

  return base64Key;

  // remove this
  //return "";
}

// Export a crypto private key to a base64 string format
export async function exportPrvKey(key: webcrypto.CryptoKey | null): Promise<string | null> {
  // TODO implement this function to return a base64 string version of a private key

  if (!key) {
    return null; // Si la clé est nulle
  }
  const exportedKey = await crypto.subtle.exportKey('pkcs8', key);
  const exportedKeyBuffer = new Uint8Array(exportedKey);
  const base64Key = btoa(String.fromCharCode(...exportedKeyBuffer));

  return base64Key;

  // remove this
  //return "";
}

// Import a base64 string public key to its native format
export async function importPubKey(
  strKey: string
): Promise<webcrypto.CryptoKey> {
  // TODO implement this function to go back from the result of the exportPubKey function to it's native crypto key object

   // Décoder la chaîne base64 en ArrayBuffer
   const binaryKey = atob(strKey);
   const buffer = new ArrayBuffer(binaryKey.length);
   const view = new Uint8Array(buffer);
 
   // Remplir l'ArrayBuffer avec les données de la chaîne décodée
   for (let i = 0; i < binaryKey.length; i++) {
     view[i] = binaryKey.charCodeAt(i);
   }
 
   // Importer la clé publique au format SPKI
   const key = await crypto.subtle.importKey(
     'spki', // Format SPKI pour une clé publique
     buffer, // ArrayBuffer contenant la clé publique
     {
       name: 'RSA-OAEP', // Le même algorithme utilisé pour la génération de la clé
       hash: 'SHA-256',
     },
     true, // La clé doit être exportable
     ['encrypt'] // La clé publique est utilisée pour l'encryption
   );
 
   return key;
  
  // remove this
  //return {} as any;
}

// Import a base64 string private key to its native format
export async function importPrvKey(
  strKey: string
): Promise<webcrypto.CryptoKey> {
  // TODO implement this function to go back from the result of the exportPrvKey function to it's native crypto key object

  // Décoder la chaîne base64 en ArrayBuffer
  const binaryKey = atob(strKey);
  const buffer = new ArrayBuffer(binaryKey.length);
  const view = new Uint8Array(buffer);

  // Remplir l'ArrayBuffer avec les données de la chaîne décodée
  for (let i = 0; i < binaryKey.length; i++) {
    view[i] = binaryKey.charCodeAt(i);
  }

  // Importer la clé privée au format PKCS#8
  const key = await crypto.subtle.importKey(
    'pkcs8', // Format PKCS#8 pour une clé privée
    buffer, // ArrayBuffer contenant la clé privée
    {
      name: 'RSA-OAEP', // Le même algorithme utilisé pour la génération de la clé
      hash: 'SHA-256',
    },
    true, // La clé doit être exportable
    ['decrypt'] // La clé privée est utilisée pour la décryption
  );

  return key;

  // remove this
  //return {} as any;
}

// Encrypt a message using an RSA public key
export async function rsaEncrypt(
  b64Data: string,
  strPublicKey: string
): Promise<string> {
  // TODO implement this function to encrypt a base64 encoded message with a public key
  // tip: use the provided base64ToArrayBuffer function

  // remove this
  return "";
}

// Decrypts a message using an RSA private key
export async function rsaDecrypt(
  data: string,
  privateKey: webcrypto.CryptoKey
): Promise<string> {
  // TODO implement this function to decrypt a base64 encoded message with a private key
  // tip: use the provided base64ToArrayBuffer function

  // remove this
  return "";
}

// ######################
// ### Symmetric keys ###
// ######################

// Generates a random symmetric key
export async function createRandomSymmetricKey(): Promise<webcrypto.CryptoKey> {
  // TODO implement this function using the crypto package to generate a symmetric key.
  //      the key should be used for both encryption and decryption. Make sure the
  //      keys are extractable.

  // remove this
  return {} as any;
}

// Export a crypto symmetric key to a base64 string format
export async function exportSymKey(key: webcrypto.CryptoKey): Promise<string> {
  // TODO implement this function to return a base64 string version of a symmetric key

  // remove this
  return "";
}

// Import a base64 string format to its crypto native format
export async function importSymKey(
  strKey: string
): Promise<webcrypto.CryptoKey> {
  // TODO implement this function to go back from the result of the exportSymKey function to it's native crypto key object

  // remove this
  return {} as any;
}

// Encrypt a message using a symmetric key
export async function symEncrypt(
  key: webcrypto.CryptoKey,
  data: string
): Promise<string> {
  // TODO implement this function to encrypt a base64 encoded message with a public key
  // tip: encode the data to a uin8array with TextEncoder

  return "";
}

// Decrypt a message using a symmetric key
export async function symDecrypt(
  strKey: string,
  encryptedData: string
): Promise<string> {
  // TODO implement this function to decrypt a base64 encoded message with a private key
  // tip: use the provided base64ToArrayBuffer function and use TextDecode to go back to a string format

  return "";
}
