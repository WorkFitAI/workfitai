export interface Skill {
  skillId: number;
  name: string;
}

export type SkillResponse = {
  result: Skill[];
  meta: {
    page: number;
    pages: number;
    total: number;
  };
};