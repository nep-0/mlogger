# 🍆💦 MLogger

A private, mobile-first masturbation logger and tracker. Monitor your habits, track streaks, and visualize your data with beautiful calendars and charts.

## ✨ Features

- **Quick Logging**: Log sessions with duration, rating (heart-based), and notes.
- **Privacy First**: All data is stored locally in your browser's `localStorage`.
- **Cloud Sync**: Optional anonymous sync via a private Sync ID (Cloudflare Workers backend).
- **Data Visualization**:
  - GitHub-style activity heatmap integrated into the calendar.
  - Detailed charts for frequency and duration trends (Weekly/Monthly/Yearly).
- **Data Portability**: Export and import your history as JSON files.
- **Mobile First**: Optimized for use as a PWA or in mobile browsers.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/nep-0/mlogger.git
   cd mlogger
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Component Lib**: React Day Picker v9

## ☁️ Backend Sync

The app uses a lightweight backend built with **Cloudflare Workers** and **KV Storage**. 
- **Endpoint**: `https://mlogger-api.jeff4f5da2.workers.dev`
- **Logic**: Manual push/pull using a unique Sync ID. No personal data or accounts required.

## 📦 Deployment

Currently configured for **GitHub Pages** deployment via GitHub Actions.
Defined in `.github/workflows/deploy.yml`.

To deploy:
1. Push your code to the `main` branch.
2. In GitHub Repository Settings -> Pages, set "Build and deployment" source to **GitHub Actions**.

## 📄 License

MIT
