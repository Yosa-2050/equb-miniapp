export interface Profile {
  id: string;
  fullName: string;
  telegramUsername: string;
  phone: string;
  avatarUrl: string;
  language: "en" | "am";
  createdEqubs: number;
  joinedEqubs: number;
  totalSaved: number;
}