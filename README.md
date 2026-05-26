# Wypożyczalnia Aut

Nowoczesna aplikacja webowa do wypożyczania samochodów, zbudowana przy użyciu React, Node.js oraz Supabase. Aplikacja umożliwia użytkownikom przeglądanie, filtrowanie i rezerwowanie pojazdów na wybrany okres.

## Kluczowe Funkcje

-   **Uwierzytelnianie Użytkowników:** Bezpieczna rejestracja i logowanie za pomocą Supabase Auth.
-   **Przeglądanie Floty:** Dostęp do listy dostępnych samochodów z kluczowymi informacjami.
-   **Zaawansowane Filtrowanie:** Możliwość filtrowania pojazdów według kategorii, ceny, rodzaju paliwa i skrzyni biegów.
-   **Wyszukiwanie:** Szybkie wyszukiwanie aut po marce lub modelu.
-   **System Rezerwacji:** Interaktywny kalendarz do wyboru dat wynajmu z dynamicznym obliczaniem ceny. Zajęte terminy są blokowane w czasie rzeczywistym.
-   **Historia Wypożyczeń:** Dedykowana strona, na której zalogowani użytkownicy mogą przeglądać swoje przeszłe rezerwacje.

## Stos Technologiczny

-   **Frontend:** React, Vite, React Router, Bootstrap
-   **Backend:** Node.js, Express.js
-   **Baza Danych i Autentykacja:** Supabase

## Konfiguracja i Uruchomienie

### Wymagania

-   Node.js (wersja 18 lub nowsza)
-   npm

### Zmienne Środowiskowe

Przed uruchomieniem aplikacji, utwórz pliki `.env` w folderach `frontend` i `backend`, a następnie uzupełnij je swoimi kluczami Supabase.

#### Frontend (`frontend/.env`)

```
VITE_SUPABASE_URL=twoj_supabase_url
VITE_SUPABASE_ANON_KEY=twoj_klucz_anon
```

#### Backend (`backend/.env`)

```
SUPABASE_URL=twoj_supabase_url
SUPABASE_ANON_KEY=twoj_klucz_anon
SUPABASE_SERVICE_ROLE_KEY=twoj_klucz_service_role
```

### Instalacja i Uruchomienie

#### Backend

1.  Przejdź do folderu `backend`:
    ```bash
    cd backend
    ```
2.  Zainstaluj zależności:
    ```bash
    npm install
    ```
3.  Uruchom serwer:
    ```bash
    npm start
    ```
    Serwer backendu nasłuchuje na `http://localhost:3000`.

#### Frontend

1.  Przejdź do folderu `frontend`:
    ```bash
    cd frontend
    ```
2.  Zainstaluj zależności:
    ```bash
    npm install
    ```
3.  Uruchom aplikację deweloperską:
    ```bash
    npm run dev
    ```
    Aplikacja frontendowa będzie dostępna pod adresem `http://localhost:5173`.

## Struktura Projektu

```
wypozyczalnia/
├── backend/
│   ├── server.js           # Główny plik serwera Express.js
│   ├── package.json
│   ├── utils/
│   │   └── supabase.js     # Konfiguracja klienta Supabase dla backendu
│   └── data/
│       └── cars.json       # Przykładowe dane samochodów
└── frontend/
    ├── src/
    │   ├── components/     # Komponenty React (AuthZone, CarCard, Filters, etc.)
    │   ├── hooks/          # Haki React (useAuth, useCars)
    │   ├── services/       # Logika komunikacji z backendem (rentService)
    │   ├── utils/
    │   │   └── supabase.js # Konfiguracja klienta Supabase dla frontendu
    │   ├── App.jsx         # Główny komponent aplikacji
    │   └── main.jsx        # Punkt wejścia aplikacji, routing
    └── package.json
```

## Licencja

Projekt jest udostępniony na licencji [MIT](https://opensource.org/licenses/MIT).