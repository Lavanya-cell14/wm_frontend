# Warehouse Management System - Frontend

This is the frontend application for the Warehouse Management System, providing the user interface for operators, managers, and system administrators. It integrates tightly with the Django backend and the FastAPI RAG service to offer features such as real-time 3D digital twins, intelligent document search, and inventory management.

## 🚀 Tech Stack

- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: React Router DOM
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **3D Visualization (Digital Twin)**: [Three.js](https://threejs.org/) & [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/) / [@react-three/drei](https://github.com/pmndrs/drei)
- **Icons**: Lucide React

## 📦 Project Structure

```
wm_frontend/
├── public/              # Static assets
├── src/                 # Source code
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page-level components
│   ├── services/        # API integration with Backend & RAG
│   ├── store/           # Global state management
│   ├── styles/          # Global CSS & Tailwind configuration
│   ├── utils/           # Helper functions
│   ├── App.jsx          # Root component and routing
│   └── main.jsx         # Application entry point
├── .env.example         # Example environment variables
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind configuration
└── vite.config.js       # Vite configuration
```

## 🛠️ Local Setup

1. **Install Node.js**: Ensure you have Node.js 18+ installed.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Copy the example environment file and update the variables if necessary.
   ```bash
   cp .env.example .env
   ```
   **Typical `.env` values**:
   ```env
   VITE_API_BASE_URL=http://127.0.0.1:8000/api
   VITE_RAG_API_URL=http://127.0.0.1:8000/api/ai
   ```
4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173/`.

## 📜 Available Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Bundles the app into static files for production.
- `npm run preview`: Bootstraps a local web server to serve the production build.
- `npm run lint`: Runs ESLint to identify and report on patterns found in ECMAScript/JavaScript code.

## 🔗 Integration Points

- **Backend API**: Connects to the Django backend for authentication, user management, and warehouse data (racks, bins, inventory).
- **RAG API**: Sends queries to the FastAPI RAG service when operators use the AI search feature.
- **Digital Twin**: Uses layout endpoints (`/api/twin/layout`) to dynamically render 3D meshes for racks and zones using `react-three-fiber`.
