# App Links — fichero de verificación

`assetlinks.json` **no lo sirve esta aplicación**. Android lo descarga de
`https://<dominio>/.well-known/assetlinks.json` con el dominio que declara el `intent-filter` de
`AndroidManifest.xml` (`@string/app_links_host`). Vive aquí porque es el repositorio que conoce el
`package_name` y la huella del certificado, no porque se empaquete: `webDir` es `dist/` y Vite no
copia esta carpeta.

## Está incompleto a propósito

Faltan dos cosas, y ninguna es código:

1. **La huella SHA-256 del keystore de release**, que B7b genera. Hasta entonces el valor es un
   marcador que Android rechazará.
2. **Un dominio con HTTPS**. `peaker.app` no está registrado: hoy es el valor por defecto de
   `VITE_SITE_URL` y de `lib/seo.ts`. Sin dominio servido, `autoVerify` **falla**, y Android trata
   el enlace como un enlace web normal en vez de abrir la aplicación.

Mientras tanto el flujo de confirmación de correo se prueba con el esquema propio, que no depende
de ningún dominio:

```bash
adb shell am start -a android.intent.action.VIEW \
  -d "app.peaker.mobile://confirm-email?token=<token>"
```

## Cómo se completa

```bash
keytool -list -v -keystore <release.jks> -alias <alias> | grep "SHA256:"
```

Se copia la huella —los dos puntos incluidos— en `sha256_cert_fingerprints`, se publica el fichero
en el dominio con `Content-Type: application/json` y sin redirecciones, y se comprueba con:

```bash
adb shell pm verify-app-links --re-verify app.peaker.mobile
adb shell pm get-app-links app.peaker.mobile
```

El estado tiene que decir `verified`. Si dice `legacy_failure` o `1024`, el fichero no se está
sirviendo como Android espera.
