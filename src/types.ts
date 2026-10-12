export type Locale = 'vi' | 'en';

export interface EducationInfo {
  major: string;
  year: string;
  school: string;
}

export interface ProjectItem {
  id: string;
  index?: number;
  title: string;
  category: string;
  status: 'live' | 'wip';
  year: string | number;
  description: string;
  tags: string[];
  github?: string;
  demo?: string;
  figureCaption: string;
}

export interface SkillGroup {
  name: string;
  category: string;
  description: string;
  tools: string[];
}

export interface SocialLink {
  name: string;
  label: string;
  url: string;
  icon: 'github' | 'linkedin' | 'email';
}

export interface NavLink {
  label: string;
  href: string;
  sectionId: string;
}

export interface UILabels {
  header: {
    notebookSuffix: string;
    themeAria: string;
    themeTitle: string;
    menuOpenAria: string;
    menuCloseAria: string;
    langAria: string;
    langTargetLabel: string;
  };
  hero: {
    researchId: string;
    viewProjects: string;
    contact: string;
  };
  about: {
    sectionTag: string;
    secSub: string;
    heading: string;
    goalLabel: string;
    specSheetTitle: string;
    specSheetBadge: string;
    eduLabel: string;
    schoolLabel: string;
    locLabel: string;
    focusLabel: string;
    focusValue: string;
    focusSub: string;
    statusLabel: string;
    statusValue: string;
    directReachLabel: string;
  };
  projects: {
    sectionTag: string;
    secSub: string;
    sourceCode: string;
    viewDemo: string;
  };
  skills: {
    sectionTag: string;
    secSub: string;
    toolsLabel: string;
  };
  contact: {
    sectionTag: string;
    secSub: string;
    heading: string;
    intro: string;
    emailLabel: string;
    directReach: string;
    copyEmail: string;
    copied: string;
    copiedLive: string;
    manualCopyPrompt: string;
    socialsTitle: string;
  };
  footer: {
    builtWith: string;
    backToTop: string;
  };
  notFound: {
    title: string;
    desc: string;
    tag: string;
    heading: string;
    message: string;
    backBtn: string;
  };
}

export interface ProfileContent {
  name: string;
  displayName: string;
  tagline: string;
  bio: string[];
  currently: string;
  email: string;
  location: string;
  education: EducationInfo;
  statusText: string;
  siteUrl: string;
  navLinks: NavLink[];
  skills: SkillGroup[];
  projects: ProjectItem[];
  socials: SocialLink[];
  ui: UILabels;
}
