import { Category, Region } from "./types";

export const CATEGORY_COLORS: Record<Category, string> = {
  "AI & Robotics": "hsl(180, 100%, 50%)", // Cyan
  "Science & Technology": "hsl(220, 100%, 60%)", // Blue
  "Society & Policy": "hsl(270, 100%, 60%)", // Purple
  "Society & Culture": "hsl(320, 100%, 60%)", // Pink
  "Space": "hsl(30, 100%, 60%)", // Orange
  "Environment": "hsl(140, 100%, 50%)", // Green
  "Other": "hsl(210, 20%, 50%)", // Slate
};

export const CATEGORIES: Category[] = [
  "AI & Robotics",
  "Science & Technology",
  "Society & Policy",
  "Society & Culture",
  "Space",
  "Environment",
  "Other"
];

export const REGIONS: Region[] = ["Global", "USA", "EU", "China", "India", "Africa", "Other"];
