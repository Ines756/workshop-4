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
}

// Export a crypto public key to a base64 string format
export async function exportPubKey(key: webcrypto.CryptoKey): Promise<string> {
  // TODO implement this function to return a base64 string version of a public key

  const exported = await crypto.subtle.exportKey("spki", key);
  const exportedKeyBuffer = new Uint8Array(exported);
  const base64Key = btoa(String.fromCharCode(...exportedKeyBuffer));

  return base64Key;
}

// Export a crypto private key to a base64 string format
export async function exportPrvKey(key: webcrypto.CryptoKey | null): Promise<string | null> {
  // TODO implement this function to return a base64 string version of a private key

  if (!key) {
    return null; 
  }
  const exportedKey = await crypto.subtle.exportKey('pkcs8', key);
  const exportedKeyBuffer = new Uint8Array(exportedKey);
  const base64Key = btoa(String.fromCharCode(...exportedKeyBuffer));

  return base64Key;
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
 
   // Importer la clé publique
   const key = await crypto.subtle.importKey(
     'spki', 
     buffer, 
     {
       name: 'RSA-OAEP', 
       hash: 'SHA-256',
     },
     true,
     ['encrypt'] 
   );
 
   return key;
}

// Import a base64 string private key to its native format
export async function importPrvKey(
  strKey: string
): Promise<webcrypto.CryptoKey> {
  // TODO implement this function to go back from the result of the exportPrvKey function to it's native crypto key object

  const binaryKey = atob(strKey);
  const buffer = new ArrayBuffer(binaryKey.length);
  const view = new Uint8Array(buffer);

  for (let i = 0; i < binaryKey.length; i++) {
    view[i] = binaryKey.charCodeAt(i);
  }

  // Importer la clé privée au format PKCS#8
  const key = await crypto.subtle.importKey(
    'pkcs8', 
    buffer, 
    {
      name: 'RSA-OAEP', 
      hash: 'SHA-256',
    },
    true, 
    ['decrypt'] 
  );

  return key;
}

// Encrypt a message using an RSA public key
export async function rsaEncrypt(
  b64Data: string,
  strPublicKey: string
): Promise<string> {
  // TODO implement this function to encrypt a base64 encoded message with a public key
  // tip: use the provided base64ToArrayBuffer function

  const publicKey = await importPubKey(strPublicKey);
  const dataBuffer = base64ToArrayBuffer(b64Data);
  const encryptedData = await webcrypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    dataBuffer
  );
  return arrayBufferToBase64(encryptedData);
}

// Decrypts a message using an RSA private key
export async function rsaDecrypt(
  data: string,
  privateKey: webcrypto.CryptoKey
): Promise<string> {
  const dataBuffer = base64ToArrayBuffer(data);
  const decryptedData = await webcrypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    privateKey, 
    dataBuffer 
  );
  return arrayBufferToBase64(decryptedData);
}


// ######################
// ### Symmetric keys ###
// ######################

// Generates a random symmetric key
export async function createRandomSymmetricKey(): Promise<webcrypto.CryptoKey> {
  // TODO implement this function using the crypto package to generate a symmetric key.
  //      the key should be used for both encryption and decryption. Make sure the
  //      keys are extractable.

  const key = await webcrypto.subtle.generateKey(
    {
      name: "AES-CBC",
      length: 256, 
    },
    true, 
    ["encrypt", "decrypt"] 
  );

  return key;  
}

// Export a crypto symmetric key to a base64 string format
export async function exportSymKey(key: webcrypto.CryptoKey): Promise<string> {
  // TODO implement this function to return a base64 string version of a symmetric key
  const exportedKey = await webcrypto.subtle.exportKey("raw", key);
  return arrayBufferToBase64(exportedKey);
}

// Import a base64 string format to its crypto native format
export async function importSymKey(
  strKey: string
): Promise<webcrypto.CryptoKey> {
  // TODO implement this function to go back from the result of the exportSymKey function to it's native crypto key object

  const keyBuffer = base64ToArrayBuffer(strKey);
  const key = await webcrypto.subtle.importKey(
    "raw", 
    keyBuffer, 
    {
      name: "AES-CBC", 
    },
    true, 
    ["encrypt", "decrypt"] 
  );

  return key;
}

// Encrypt a message using a symmetric key
export async function symEncrypt(
  key: webcrypto.CryptoKey,
  data: string
): Promise<string> {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const encryptedData = await webcrypto.subtle.encrypt(
    {
      name: "AES-CBC",
      iv: iv, // Le vecteur d'initialisation 
    },
    key, // La clé symétrique
    encodedData // Les données à chiffrer
  );
  // Combiner l'IV et les données chiffrées en un seul ArrayBuffer
  const combinedBuffer = new Uint8Array(iv.byteLength + encryptedData.byteLength);
  combinedBuffer.set(new Uint8Array(iv), 0);
  combinedBuffer.set(new Uint8Array(encryptedData), iv.byteLength);
  const encryptedBase64 = arrayBufferToBase64(combinedBuffer.buffer);

  return encryptedBase64;
}

// Decrypt a message using a symmetric key
export async function symDecrypt(
  strKey: string,
  encryptedData: string
): Promise<string> {
  const key = await importSymKey(strKey);
  const encryptedDataBuffer = base64ToArrayBuffer(encryptedData);

  // Extraire l'IV des données 
  const iv = encryptedDataBuffer.slice(0, 16); 
  const dataBuffer = encryptedDataBuffer.slice(16); 

  // Déchiffrer les données
  const decryptedData = await webcrypto.subtle.decrypt(
    {
      name: "AES-CBC",
      iv: iv,
    },
    key,
    dataBuffer
  );
  // Décoder les données déchiffrées en texte
  const decoder = new TextDecoder();
  return decoder.decode(decryptedData);
}
