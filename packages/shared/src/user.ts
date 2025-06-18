export interface User {
  id: number;
  name: string;
  email: string;
}

export const createUser = (name: string, email: string): User => ({
  id: Math.floor(Math.random() * 1000),
  name,
  email
});
