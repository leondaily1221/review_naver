
export async function encryptData(data: string, password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const passwordKey = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const aesKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const encryptedContent = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    aesKey,
    enc.encode(data)
  );

  const bufferToBase64 = (buffer: ArrayBuffer) =>
    btoa(String.fromCharCode(...new Uint8Array(buffer)));

  return JSON.stringify({
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    data: bufferToBase64(encryptedContent),
  });
}

export async function decryptData(encryptedJson: string, password: string): Promise<string> {
  try {
    const parsed = JSON.parse(encryptedJson);
    const base64ToBuffer = (str: string) =>
      Uint8Array.from(atob(str), (c) => c.charCodeAt(0));

    const salt = base64ToBuffer(parsed.salt);
    const iv = base64ToBuffer(parsed.iv);
    const data = base64ToBuffer(parsed.data);

    const enc = new TextEncoder();
    const passwordKey = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    const aesKey = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      passwordKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    const decryptedContent = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      aesKey,
      data
    );

    return new TextDecoder().decode(decryptedContent);
  } catch (error) {
    throw new Error("복호화 실패: 비밀번호가 틀리거나 파일이 손상되었습니다.");
  }
}
