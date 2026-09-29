import type { Profile, Skill, Project, SocialLink } from "@/types";

export const profile: Profile = {
  name: "Tuấn Đặng",
  displayName: "Đặng Văn Bảo Tuấn",
  tagline: "AI Student · Vibe Coder · Builder",
  bio: [
    "Sinh viên năm 2 ngành Trí Tuệ Nhân Tạo, đam mê Machine Learning và Computer Vision.",
    "Thích vibe coding — biến ý tưởng thành sản phẩm nhanh chóng với công nghệ hiện đại.",
    "Đang tìm kiếm cơ hội thực tập để áp dụng kiến thức vào thực tế.",
  ],
  currently: "Đang học Deep Learning và xây dựng portfolio projects",
  email: "dudenoblade@gmail.com",
  location: "Ho Chi Minh City, Vietnam",
  education: {
    school: "University",
    major: "Artificial Intelligence",
    year: "Year 2 — 2025–2029",
  },
};

export const skills: Skill[] = [
  {
    number: "01",
    name: "Machine Learning",
    description:
      "Building and training neural networks with PyTorch, TensorFlow, and Scikit-learn. From data preprocessing to model deployment.",
  },
  {
    number: "02",
    name: "Web Development",
    description:
      "Full-stack web applications with React, TypeScript, and modern tooling. Responsive, accessible, and performant.",
  },
  {
    number: "03",
    name: "Computer Vision",
    description:
      "Real-time image processing and object detection using OpenCV, MediaPipe, and custom CNN architectures.",
  },
  {
    number: "04",
    name: "Problem Solving",
    description:
      "Data analysis, algorithm design, and system thinking. Breaking complex problems into clean, maintainable solutions.",
  },
];

export const projects: Project[] = [
  {
    id: "project-1",
    index: 1,
    title: "MNIST Digit Classifier",
    category: "Machine Learning",
    status: "live",
    year: 2025,
    description: "CNN model nhận diện chữ số viết tay đạt 99.2% accuracy trên test set. Triển khai web inference thời gian thực.",
    tech: ["PyTorch", "CNN", "TensorFlow.js"],
    github: "https://github.com/Tuandude",
    demo: "https://github.com/Tuandude",
  },
  {
    id: "project-2",
    index: 2,
    title: "Vietnamese Sentiment Analysis",
    category: "NLP",
    status: "wip",
    year: 2026,
    description: "Phân tích cảm xúc bình luận tiếng Việt sử dụng PhoBERT transformer fine-tuned trên tập dữ liệu đánh giá thực tế.",
    tech: ["PhoBERT", "HuggingFace", "Python", "FastAPI"],
    github: "https://github.com/Tuandude",
  },
  {
    id: "project-3",
    index: 3,
    title: "Real-time Face Landmarks",
    category: "Computer Vision",
    status: "wip",
    year: 2026,
    description: "Ứng dụng nhận diện khuôn mặt và ước lượng tư thế 3D thời gian thực đạt tốc độ 30+ FPS trên luồng webcam.",
    tech: ["OpenCV", "MediaPipe", "Python"],
    github: "https://github.com/Tuandude",
  },
];

export const socialLinks: SocialLink[] = [
  {
    platform: "GitHub",
    url: "https://github.com/Tuandude",
    icon: "github",
  },
  {
    platform: "Email",
    url: "mailto:dudenoblade@gmail.com",
    icon: "mail",
  },
];
