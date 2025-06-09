// helpers/queryNormalizer.js

// Bảng từ đồng nghĩa
const synonyms = {
    "full_time": ["full_time", "full time", "toàn thời gian", "toan thoi gian", "full-time"],
    "part_time": ["part_time", "part time", "bán thời gian", "ban thoi gian", "part-time"],
    "internship": ["thực tập", "intern", "internship"],
    "developer": ["developer", "lập trình viên", "dev", "coder"],
    "manager": ["manager", "quản lý", "trưởng phòng", "leader"],
    "frontend": [
    "frontend", "front-end", "front end", "lập trình viên frontend",
    "frontend developer", "front end developer", "developer giao diện",
    "ui developer", "html/css", "reactjs", "angular", "vuejs", "frontend coder",
    "frontend engineer", "chuyên viên giao diện", "thiết kế frontend"
  ],

  // Backend-related terms
  "backend": [
    "backend", "back-end", "back end", "lập trình viên backend",
    "backend developer", "server developer", "server-side developer",
    "nodejs", "expressjs", "python backend", "php developer", "java backend",
    "chuyên viên backend", "backend coder", "kỹ sư backend", "backend engineer",
    "database developer"
  ],

  // Fullstack-related terms
  "fullstack": [
    "fullstack", "full-stack", "full stack", "lập trình viên fullstack",
    "fullstack developer", "developer toàn diện", "kỹ sư fullstack",
    "frontend và backend", "fullstack engineer", "mern stack", "mean stack",
    "react và nodejs", "frontend và backend coder"
  ],

  // Tools & Frameworks (Frontend + Backend)
  "reactjs": ["reactjs", "react", "lập trình viên reactjs", "react developer"],
  "angular": ["angular", "lập trình viên angular", "angular developer"],
  "vuejs": ["vuejs", "vue", "lập trình viên vuejs", "vue developer"],
  "nodejs": ["nodejs", "node.js", "node", "backend nodejs", "nodejs developer"],
  "expressjs": ["expressjs", "express", "lập trình viên express", "express backend"],
  "django": ["django", "python django", "django developer", "lập trình viên django"],
  "laravel": ["laravel", "php laravel", "laravel developer", "lập trình viên laravel"],
  "spring": ["spring", "spring boot", "java spring", "spring developer"],
  
  // APIs
  "rest_api": [
    "rest api", "restful api", "api developer", "lập trình api",
    "backend api", "restful services"
  ],
  "graphql": ["graphql", "graphql api", "graphql developer"],

  // Database
  "database": [
    "database", "cơ sở dữ liệu", "sql", "mysql", "postgresql",
    "nosql", "mongodb", "oracle database", "redis", "database developer",
    "chuyên viên cơ sở dữ liệu"
  ],

  // Mobile Development
  "mobile": [
    "mobile developer", "lập trình viên di động", "ios developer",
    "android developer", "flutter developer", "react native", "xamarin",
    "mobile app developer", "kỹ sư ứng dụng di động"
  ],

  // DevOps
  "devops": [
    "devops", "kỹ sư devops", "ci/cd", "docker", "kubernetes", "aws",
    "azure", "google cloud", "terraform", "devops engineer", "automation engineer"
  ],

  // QA/QC
  "qa": [
    "qa", "quality assurance", "kiểm thử phần mềm", "tester", "test engineer",
    "manual tester", "automation tester", "qa engineer"
  ],
  "qc": [
    "qc", "quality control", "kiểm tra chất lượng", "chuyên viên qc"
  ],

  // Security
  "security": [
    "security", "cybersecurity", "chuyên viên bảo mật", "network security",
    "pentester", "ethical hacker", "information security", "cloud security",
    "application security"
  ],

  // Other relevant roles
  "web_developer": [
    "web developer", "lập trình viên web", "web coder", "fullstack web developer",
    "frontend và backend developer", "website developer", "developer web"
  ],
  "software_engineer": [
    "software engineer", "kỹ sư phần mềm", "chuyên gia phần mềm",
    "software developer", "software coder", "developer phần mềm"
  ], 
  // Roles
  "developer": [
    "developer", "lập trình viên", "dev", "coder", "programmer",
    "software developer", "web developer", "ứng viên IT", "kỹ sư phần mềm"
  ],
  "frontend_developer": [
    "frontend developer", "lập trình viên frontend", "frontend dev",
    "frontend coder", "web UI developer"
  ],
  "backend_developer": [
    "backend developer", "lập trình viên backend", "backend coder",
    "server-side developer", "backend engineer"
  ],
  "fullstack_developer": [
    "fullstack developer", "lập trình viên fullstack", "full-stack",
    "developer toàn diện", "kỹ sư fullstack"
  ],
  "mobile_developer": [
    "mobile developer", "lập trình viên di động", "mobile dev",
    "android developer", "ios developer", "flutter developer",
    "react native developer"
  ],
  "data_scientist": [
    "data scientist", "nhà khoa học dữ liệu", "chuyên gia dữ liệu",
    "data analyst", "phân tích dữ liệu"
  ],
  "manager": [
    "manager", "quản lý", "trưởng phòng", "leader", "team leader",
    "chuyên viên quản lý", "project manager", "program manager"
  ],
  "ui_ux_designer": [
    "ui designer", "ux designer", "ui/ux designer", "thiết kế giao diện",
    "ux/ui specialist", "thiết kế trải nghiệm người dùng"
  ],
  "qa_tester": [
    "qa tester", "quality assurance", "tester", "kiểm thử phần mềm",
    "chuyên viên kiểm thử", "software tester"
  ],

  // IT-related terms
  "cloud_engineer": [
    "cloud engineer", "kỹ sư đám mây", "chuyên gia cloud", "cloud computing specialist",
    "aws engineer", "azure specialist", "google cloud expert"
  ],
  "cybersecurity": [
    "cybersecurity", "an ninh mạng", "chuyên gia bảo mật", "security analyst",
    "security engineer", "bảo mật thông tin"
  ],
  "ai_engineer": [
    "ai engineer", "kỹ sư trí tuệ nhân tạo", "machine learning engineer",
    "deep learning specialist", "chuyên gia AI", "kỹ sư học máy"
  ],
  "devops": [
    "devops", "chuyên gia devops", "devops engineer", "sysadmin",
    "kỹ sư hệ thống", "automation engineer"
  ],

  // Tools/Skills
  "python": [
    "python", "lập trình python", "python developer", "chuyên gia python",
    "kỹ sư python"
  ],
  "javascript": [
    "javascript", "js", "lập trình javascript", "developer javascript",
    "nodejs developer", "reactjs developer", "angular developer"
  ],
  "java": [
    "java", "lập trình java", "java developer", "chuyên gia java",
    "kỹ sư java"
  ],
  "csharp": [
    "c#", "csharp", "c-sharp", "lập trình c#", "developer c#",
    "kỹ sư c#", ".net developer"
  ],
  "database": [
    "database", "cơ sở dữ liệu", "chuyên viên cơ sở dữ liệu",
    "sql", "mysql", "postgresql", "nosql", "mongodb", "oracle database",
    "database admin", "dba"
  ],
  "networking": [
    "networking", "quản trị mạng", "network engineer", "chuyên viên mạng",
    "cisco specialist", "network administrator", "wireless networking"
  ],
  "graphic_design": [
    "graphic design", "thiết kế đồ họa", "designer", "graphic designer",
    "3d designer", "creative designer", "digital artist"
  ],
  "product_manager": [
    "product manager", "quản lý sản phẩm", "trưởng nhóm sản phẩm",
    "product owner", "chuyên viên sản phẩm"
  ],

  // Other job categories
  "hr": [
    "human resources", "nhân sự", "hr manager", "chuyên viên nhân sự",
    "quản lý nhân sự", "tuyển dụng", "recruiter"
  ],
  "marketing": [
    "marketing", "chuyên viên marketing", "digital marketing",
    "content marketing", "social media", "seo", "google ads",
    "facebook ads"
  ]
  };
  
  // Hàm chuẩn hóa từ khóa
  const normalizeQuery = (query) => {
    if (!query) return query;
  
    // Duyệt qua các từ đồng nghĩa
    for (const [standard, variants] of Object.entries(synonyms)) {
      if (variants.some((variant) => query.toLowerCase().includes(variant.toLowerCase()))) {
        return standard; // Trả về giá trị chuẩn hóa
      }
    }
  
    return query; // Không thay đổi nếu không khớp
  };
  
  // Xuất hàm
  module.exports = { normalizeQuery };
  