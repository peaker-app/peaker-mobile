# Fichas de tienda

Textos e imágenes para Google Play y App Store, en los cinco idiomas que habla la aplicación.
Un fichero por idioma en `listings/`, con los campos de las dos tiendas juntos porque comparten
casi todo el contenido y así no se desincronizan.

## Límites que hay que respetar

| Campo | Google Play | App Store |
|---|---|---|
| Nombre | 30 | 30 |
| Subtítulo | — | 30 |
| Descripción corta | 80 | — |
| Texto promocional | — | 170 |
| Descripción | 4000 | 4000 |
| Palabras clave | — | 100, separadas por comas y sin espacios |

`scripts/check-store.mjs` los valida; entra en `npm run verify`, así que una ficha que se pase de
largo rompe la compilación en vez de descubrirse al subirla.

## Imágenes

| Recurso | Tamaño | Estado |
|---|---|---|
| Icono de Play | 512×512 PNG | ✅ `assets/play-icon-512.png` |
| Gráfico destacado de Play | 1024×500 PNG | ✅ `assets/play-feature-graphic-1024x500.png` |
| Icono de App Store | 1024×1024 PNG | Lo genera Xcode desde `Assets.xcassets` |
| Capturas de teléfono | 2 a 8, mínimo 1080 px de ancho | ⬜ Pendientes |

Las dos primeras se generan desde `../assets/icon.svg`, que es el único origen de la marca.

**Las capturas siguen pendientes a propósito.** Las del AVD sirven técnicamente —1080×2400 entra en
lo que piden las dos tiendas— pero muestran datos de prueba (`b5demo`, «Tresmiles del Pirineo») y
un catálogo a medio ingerir. Antes de subirlas hay que sembrar una cuenta presentable. La receta
para capturarlas está en `MOBILE.md` §B7a.

## Lo que falta y no es texto

- **Política de privacidad publicada en una URL.** `privacy-policy.md` tiene el borrador, y las dos
  tiendas exigen que esté servida en HTTPS. Depende del dominio, que sigue sin registrar.
- **URL de soporte**, obligatoria en App Store.
- **Cuestionario de seguridad de los datos** de Play y **App Privacy** de Apple: los dos hay que
  rellenarlos a mano en la consola, y `privacy-policy.md` §2 lleva la tabla con las respuestas.
- Las cuentas: Apple Developer Program 99 $/año y Google Play Console 25 $ una vez (§4).
