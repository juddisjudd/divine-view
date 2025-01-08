export type FilterTag =
  | "Leveling"
  | "Intermediate"
  | "Endgame"
  | "Cosmetic Only"
  | "Warrior"
  | "Witch"
  | "Ranger"
  | "Sorceress"
  | "Mercenary"
  | "Monk"
  | "Druid"
  | "Huntress"
  | "Shadow"
  | "Templar"
  | "Marauder"
  | "Duelist";

export interface CommunityFilter {
  id: string;
  name: string;
  tags: FilterTag[];
  author: {
    id: string;
    name: string;
  };
  githubUrl: string;
  downloads: number;
  upvotes: number;
  downvotes: number;
  createdAt: string;
}
