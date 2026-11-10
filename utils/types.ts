export interface User {
  fullName: string;
  username: string;
  email: string;
  passwordHash: string; // Stored securely (hashed)
}

export interface Session {
  username: string;
  fullName: string;
}