# CookieConsent – Widget de consimțământ cookie

Un script JavaScript autonom pentru gestionarea consimțământului utilizatorului privind cookie-urile. Permite activarea/dezactivarea automată a scripturilor și iframe-urilor în funcție de preferințe.

## Funcționalități
- Categorii cookie:
  - **necessary** – mereu activate, esențiale.
  - **analytics** – statistici (ex. Google Analytics).
  - **thirdParty** – embed-uri, reclame, video.
- Preferințele se salvează în `localStorage` și `cookie`.
- Evenimente disponibile:
  - `cookieConsentChanged`
  - `cookieConsentApplied`
- Buton plutitor pentru redeschidere modal.

## Instalare
1. Creează fișierul `cookie-consent.js` și pune codul scriptului.
2. Include-l în HTML:
```html
<script src="cookie-consent.js"></script>
```
3. Marchează scripturile care depind de consimțământ:
```html
<script type="text/plain" data-cookie-category="analytics">
  console.log("GA ar porni aici...");
</script>
```

## Personalizare
```javascript
window.cookieConsent = new CookieConsent({
    labels: {
        title: "Setări cookie",
        acceptAll: "Acceptă toate",
        policyUrl: "/cookie-policy.html"
    },
    autoApply: true
});
```

## Exemple
- Apăsând butonul plutitor din dreapta-jos, utilizatorul poate modifica preferințele.
- Scripturile marcate corespunzător nu se vor încărca dacă utilizatorul nu le acceptă.

