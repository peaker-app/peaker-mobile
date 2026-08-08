# Proyecto iOS

Generado en B7b con `npm install @capacitor/ios && npx cap add ios`. **Funcionó desde Windows**:
Capacitor 8 declara los plugins con Swift Package Manager (`App/CapApp-SPM/Package.swift`) en vez
de CocoaPods, así que no hay `pod install` que ejecutar y el riesgo que `MOBILE.md` §B7 anticipaba
no se materializó. Los siete plugins quedaron registrados.

Lo que **no** se puede hacer desde Windows es compilar ni firmar: eso exige macOS con Xcode, y lo
cubre el job `ios` de `.github/workflows/ci.yml` sobre `macos-latest`.

## Un paso pendiente que exige Xcode

Las tres descripciones de permiso están en `App/App/Info.plist` **en inglés**, que es lo que evita
que iOS cierre la aplicación al abrir la cámara o pedir la ubicación. Sus traducciones a los cinco
idiomas ya están escritas en `App/App/<idioma>.lproj/InfoPlist.strings`, pero **todavía no forman
parte del target**: `App.xcodeproj/project.pbxproj` usa grupos clásicos, así que un fichero suelto
en el disco no entra en la compilación hasta que se declara como *variant group* con sus regiones.

Registrarlas a mano son cuatro ediciones coordinadas del `project.pbxproj` que desde Windows **no
se pueden compilar para comprobarlas**, y un `project.pbxproj` roto tumbaría el job de CI. En Xcode
es un minuto:

1. Abrir `App.xcworkspace` y seleccionar `Info.plist` en el navegador.
2. En el inspector de ficheros, **Localize…**, y marcar los cinco idiomas.
3. Xcode crea las entradas de `knownRegions` y el *variant group*, y recoge los
   `InfoPlist.strings` que ya están en disco.

Comprobación: cambiar el idioma del dispositivo y verificar que el diálogo de permiso sale
traducido. Mientras tanto sale en inglés en todos los idiomas, que es degradado pero no roto.

## `CFBundleLocalizations`

Está declarado en `Info.plist` con los cinco idiomas. Es lo que hace que la App Store liste la
aplicación como localizada y que `Device.getLanguageCode()` devuelva el idioma esperado.
