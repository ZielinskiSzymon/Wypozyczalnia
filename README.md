# Wypożyczalnia Aut

Nowoczesna aplikacja web do wypożyczania samochodów zbudowana w React + Node.js + Supabase.

## Technologie

- **Frontend**: React, Vite, Bootstrap CSS
- **Backend**: Express.js, Node.js
- **Baza danych**: Supabase (PostgreSQL)
- **Autentykacja**: Supabase Auth

## Instalacja

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm start
```

Backend będzie dostępny na `http://localhost:3000`
Frontend będzie dostępny na `http://localhost:5173`

## Zmienne środowiskowe

### Frontend (.env)

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Backend (.env)

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Struktura projektu

```
Projekcik/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── utils/
│   │   └── supabase.js
│   └── data/
│       ├── cars.csv
│       └── cars.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AuthZone.jsx
    │   │   ├── Header.jsx
    │   │   ├── CarCard.jsx
    │   │   └── CarsList.jsx
    │   ├── hooks/
    │   │   ├── useAuth.js
    │   │   └── useCars.js
    │   ├── services/
    │   │   └── rentService.js
    │   ├── utils/
    │   │   └── supabase.js
    │   ├── App.jsx
    │   ├── App.css
    │   ├── main.jsx
    │   └── index.html
    ├── package.json
    ├── vite.config.js
    └── .env
```

## Funkcje

- 🔐 Autentykacja użytkowników (rejestracja/logowanie)
- 🚗 Przeglądanie dostępnych samochodów
- 🔍 Wyszukiwanie pojazdów
- 📅 Wypożyczanie samochodów na 3 dni
- 📊 Status dostępności w czasie rzeczywistym
- 💾 Dane przechowywane w Supabase

## Licencja

MIT
