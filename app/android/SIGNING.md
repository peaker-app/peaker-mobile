# Firma de release

`app/build.gradle` firma el build de release **solo si encuentra un keystore**. Lo busca en dos
sitios, en este orden:

1. `android/keystore.properties`, para tu máquina. Está en `.gitignore`.
2. Las variables `ANDROID_KEYSTORE_PATH`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` y
   `ANDROID_KEY_PASSWORD`, que es por donde entra en CI.

Si no encuentra ninguno, `assembleRelease` sigue funcionando y produce
`app-release-unsigned.apk`. Es deliberado: quien clone el repositorio puede compilar release sin
tener secretos, y el job de CI no se cae cuando faltan.

## Crear el keystore

**El keystore de subida lo generas tú, y no se comparte.** Perderlo significa no poder volver a
actualizar la aplicación en Google Play con la misma identidad.

```bash
keytool -genkeypair -v \
  -keystore peaker-release.jks \
  -alias peaker \
  -keyalg RSA -keysize 4096 -validity 10000 \
  -dname "CN=Peaker, O=Peaker, C=ES"
```

Guárdalo **fuera del repositorio**. Copia `keystore.properties.example` a `keystore.properties` y
rellena las cuatro líneas con la ruta absoluta y las contraseñas.

Comprobación:

```bash
cd android && ./gradlew assembleRelease
apksigner verify --print-certs app/build/outputs/apk/release/app-release.apk
```

## Secretos de CI

| Secreto | Cómo se obtiene |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | `base64 -w0 peaker-release.jks` |
| `ANDROID_KEYSTORE_PASSWORD` | La del `-storepass` |
| `ANDROID_KEY_ALIAS` | `peaker` |
| `ANDROID_KEY_PASSWORD` | La del `-keypass` |

El workflow reconstruye el fichero en `$RUNNER_TEMP` y exporta `ANDROID_KEYSTORE_PATH`. Si el
secreto no está, el paso se salta y el APK sale sin firmar en vez de romper la ejecución.

## Numeración

`versionName` sale de `app/package.json`, así que la versión de la aplicación y la del paquete npm
no pueden divergir. `versionCode` sale de `ANDROID_VERSION_CODE`, que en CI es
`github.run_number`; en local, si no está, vale `1`.

## La huella para los App Links

`assetlinks.json` necesita la huella SHA-256 **de este keystore**:

```bash
keytool -list -v -keystore peaker-release.jks -alias peaker | grep "SHA256:"
```

Se copia con los dos puntos incluidos en `app/.well-known/assetlinks.json`. Hasta entonces el
fichero lleva un marcador y la verificación de App Links falla, cosa que ya documenta
`app/.well-known/README.md`.

## Sobre `minifyEnabled`

Está activado desde B7b y **reduce el APK a la mitad**: 7,2 MB → 3,6 MB. R8 no rompe los plugins
de Capacitor porque el AAR trae sus propias reglas de consumidor, que conservan las clases
anotadas con `@CapacitorPlugin`, y se verificó en dispositivo.

`shrinkResources` **no** está activado, a propósito. El plugin del splash resuelve su drawable por
nombre con `getIdentifier()`, y el reductor de recursos no ve esa referencia: encendería la mecha
de un fallo que solo aparecería en release. La ganancia extra no compensa ese riesgo.
