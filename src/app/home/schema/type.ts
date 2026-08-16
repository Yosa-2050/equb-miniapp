// Types for Equb and related data
export interface Equb {
  id: string;
  name: string;
  monthlyAmount: number;
  durationMonths: number;
  inviteCode: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  isPublic: boolean;
  admin: {
    id: string;
    fullName: string;
    username: string;
  };
  membersCount: number;
  createdAt: string;
}

export interface CreateEqubDto {
  name: string;
  monthlyAmount: number;
  durationMonths: number;
  isPublic: boolean;
}