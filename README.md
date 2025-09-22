# React TypeScript App with Supabase and Tailwind CSS

A simple React TypeScript application with Supabase integration and Tailwind CSS styling.

## Features

- ⚛️ React 18 with TypeScript
- 🎨 Tailwind CSS for styling
- 🗄️ Supabase client integration
- 📦 Create React App (no Vite)
- 🎯 Modern UI components

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- A Supabase project (optional for basic setup)

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Supabase Configuration (Optional)

To connect to Supabase:

1. Create a `.env.local` file in the root directory
2. Add your Supabase credentials:
```
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Get these values from your Supabase project dashboard:
   - Go to Settings > API
   - Copy the Project URL and anon/public key

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
src/
├── lib/
│   └── supabase.ts      # Supabase client configuration
├── App.tsx              # Main application component
├── index.tsx            # Application entry point
└── index.css            # Global styles with Tailwind imports
```

## Technologies Used

- **React** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend as a Service
- **Create React App** - React application boilerplate

## Development

The app includes a simple example that demonstrates:
- TypeScript usage with React hooks
- Tailwind CSS styling
- Supabase client integration
- Modern UI components with hover effects and transitions

## License

This project is open source and available under the [MIT License](LICENSE).