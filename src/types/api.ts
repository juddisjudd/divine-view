export type ApiResponse<T = void> = {
  success: boolean;
  message?: string;
  data?: T;
};

export type FilterResponse = {
  id: string;
  name: string;
  description?: string | null;
  githubUrl: string;
  downloads: number;
  tags: string[];
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  votes: {
    upvotes: number;
    downvotes: number;
    userVote?: number;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type CreateFilterInput = {
  name: string;
  description?: string;
  githubUrl: string;
  tags: string[];
};

export type UpdateFilterInput = Partial<CreateFilterInput>;

export type VoteInput = {
  value: 1 | -1;
};
