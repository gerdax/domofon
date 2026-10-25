# Domofon

Interaktywny panel na bazie dostarczonego zdjęcia Proel KDC 1905M. HTML, CSS, JavaScript i Web Audio API, bez backendu i zależności produkcyjnych.

## Uruchomienie

W katalogu projektu: `python3 -m http.server 8080 --directory dist`, następnie otwórz http://localhost:8080. Testy: `npm test` (Node.js 22+).

## Obsługa

- Cyfry wybierają lokal; po 3 sekundach ciszy rozpoczyna się 12-sekundowe wywołanie.
- X / Escape / Backspace kasuje wpis lub anuluje wywołanie.
- Kluczyk / Enter rozpoczyna wpisywanie kodu. Demonstracyjny kod: **1234**.
- Przyciski grają przez 100 ms: 1=A♯5, 2=B5, 3=C6, 4=C♯6, 5=D6, 6=D♯6, 7=E6, 8=F6, 9=F♯6, 0=A♯5, klucz=G♯6, X=G6. Strój równomierny, A4=440 Hz; B w notacji międzynarodowej. Dźwięki są syntetyczną interpretacją, nie nagraniem urządzenia.
- Pomoc i wyciszenie w prawym dolnym rogu. Aplikacja nie łączy się z fizycznym domofonem.

## PWA

Po pierwszym pełnym załadowaniu aplikacja działa offline. Instaluj z menu przeglądarki; iOS: Udostępnij → Do ekranu początkowego. Service worker wymaga HTTPS lub localhost. Zwiększ wersję cache w `dist/sw.js` przy aktualizacji zasobów. Aktualizacja aktywuje nowy cache od razu; aplikacja odświeża się przy zmianie kontrolera service workera. W wersjach sprzed tej obsługi należy odświeżyć lub ponownie otworzyć aplikację.

## GitHub Pages

Settings → Pages → Source: **GitHub Actions**. Workflow publikuje zawartość `dist` po każdym pushu do `main`. Wszystkie ścieżki są względne, również scope PWA, więc aplikacja działa w podkatalogu `/domofon/`.

Fotografia dostarczona przez użytkownika; oznaczenia producenta pozostają częścią zdjęcia. Repozytorium nie udziela odrębnej licencji do fotografii ani znaków towarowych.
