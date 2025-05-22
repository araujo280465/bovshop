# BovShop

A Next.js application for managing livestock lots, images, users, and clients.

## Features

- User authentication and authorization
- Livestock lot management
- Image upload and management for lots
- User management
- Client management
- Responsive Material-UI interface

## Tech Stack

- Next.js
- React
- Material-UI
- Supabase (Database and Storage)
- NextAuth.js

## Getting Started

1. Clone the repository:
```bash
git clone [your-repository-url]
cd bovshop
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

The following environment variables are required:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `NEXTAUTH_SECRET`: Secret key for NextAuth.js
- `NEXTAUTH_URL`: URL of your application (http://localhost:3000 for development)

## License

This project is licensed under the MIT License. 