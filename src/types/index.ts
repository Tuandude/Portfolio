export interface Profile {
  name: string;
  displayName: string;
  tagline: string;
  bio: string[];
  currently: string;
  email: string;
  location: string;
  education: {
    school: string;
    major: string;
    year: string;
  };
}

export interface Skill {
  number: string;
  name: string;
  description: string;
}

export interface Project {
  id: string;
  index: number;          // 1, 2, 3... (hiển thị 01, 02, 03)
  title: string;
  category: string;       // VD: "Machine Learning", "Web App"
  description: string;
  tech: string[];         // ["Python", "TensorFlow", ...]
  status: "live" | "wip" | "archived";
  year: number;
  github?: string;
  demo?: string;
  accent?: string;        // optional gradient override
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}
