# 📚 MakTab (MaTab) - Islamic Education Platform

**MakTab** (derived from *Maktab*, meaning "place of learning") is an intelligent, cross-platform educational management system designed specifically for **Islamiyya schools** and **Qur’anic memorization centers (Tahfeez)**. 

Built with a modern tech stack, MakTab bridges classical Islamic pedagogy with cutting-edge technology to reduce administrative burden, eliminate data loss, and enhance the learning experience for students, teachers, and administrators.

---

## 🚀 Vision & Mission

### Vision
To revolutionize Islamic and Qur’anic education management in Africa by integrating technology that enhances both academic excellence and spiritual development.

### Mission
- **Save Time**: Automate repetitive administrative tasks for teachers and school owners.
- **Track Progress**: Provide structured data on student memorization and academic performance.
- **Preserve Quality**: Use digital tools to maintain the integrity of traditional teaching methods.
- **Accessibility**: Ensure seamless usage across smartphones, tablets, and desktops.

---

## 🎨 Design Philosophy: "Matured Modernism"
MakTab follows a **Luxury Tech / Calm Design** aesthetic. It uses a sophisticated palette of **Sky Blue**, **Dark Teal**, and **Glassmorphism** effects to create a professional yet respectful environment suitable for Islamic education.

---

## 🧠 Key Features

### 👤 For Students
- **Personal Dashboard**: View daily schedules, revision plans, and performance metrics.
- **Quran & Murāja’a**: Track memorization progress and structured revision (Murāja’a) schedules.
- **Practice Log**: Record daily learning and spiritual activities.
- **Qibla Finder**: Integrated tool for spiritual convenience.
- **Interactive Feedback**: Receive audio and text feedback from teachers on recitation and assignments.

### 👨‍🏫 For Teachers
- **Class Management**: Digital attendance and performance tracking for *halaqāt*.
- **Assessment Tools**: Easy entry for tests, exams, and Tajwīd evaluations.
- **Voice Feedback**: Record and send audio corrections for student recitations.
- **Student Insights**: Real-time analytics on student weak points and recurring mistakes.

### 🏛️ For Management
- **School Dashboard**: High-level overview of school-wide performance.
- **Teacher & Student Management**: Centralized registration and role assignment.
- **Automated Reporting**: Generate termly and session-based report cards with one click.
- **Customizable Curriculum**: Integrate various Islamic subjects (Tawheed, Fiqh, Hadith, Arabic, etc.).

---

## 🛠️ Technical Stack

- **Framework**: [React 18](https://reactjs.org/) (TypeScript)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **State Management & Routing**: [React Router 6](https://reactrouter.com/)
- **Styling**: Vanilla CSS (Custom design system with CSS Variables)
- **Internationalization**: [i18next](https://www.i18next.com/) (Supports English, Arabic, and Hausa)
- **PWA**: [Vite PWA Plugin](https://vite-pwa-org.netlify.app/) (Offline support & installable on mobile)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🏗️ Project Structure

```text
src/
├── components/      # Reusable UI components (Common, Onboarding, etc.)
├── pages/           # Core page components (Auth, Dashboard, Quran, etc.)
│   ├── management/  # School administration pages
│   └── teacher/     # Teacher-specific workflows
├── i18n/            # Internationalization configurations
├── styles/          # Global styles and design tokens
├── types/           # TypeScript interfaces and types
├── data/            # Static data and mock assets
└── App.tsx          # Main application routing
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MakTab-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

### Type Checking
To run the TypeScript compiler and check for errors:
```bash
npm run typecheck
```

---

## 📱 Progressive Web App (PWA)
MakTab is designed as a PWA. When running in a supported browser, users will be prompted to "Install" the app, allowing it to:
- Work offline or in low-connectivity environments.
- Launch from the home screen like a native mobile app.
- Provide a full-screen, immersive experience.

---

## 🔐 Security & Privacy
MakTab follows a security-first approach:
- **Role-Based Access Control (RBAC)**: Ensuring users only see the data relevant to their role.
- **Privacy Awareness**: Localized data handling where possible and secure communication channels.

---

## 📜 License
This project is licensed under the MIT License.

---
Built with purpose by **Ibrahim Aliyu S. Kamina**
