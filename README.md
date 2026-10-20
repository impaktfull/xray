<p align="center">
  <img src="https://raw.githubusercontent.com/impaktfull/xray/main/assets/logo_full.png" alt="xRay (inspector)" height="250" />
</p>

<p align="center">
  <a href="https://pub.dev/packages/xray_inspector"><img src="https://img.shields.io/pub/v/xray_inspector?label=pub.dev&labelColor=333940&logo=dart&color=00589B" alt="pub"></a>
  <a href="https://github.com/impaktfull/xray"><img src="https://img.shields.io/github/stars/impaktfull/xray?style=flat&label=stars&labelColor=333940&color=8957e5&logo=github" alt="github"></a>
</p>

<p align="center">
  <a href="https://docs.page/impaktfull/xray">Documentation</a> •
  <a href="https://docs.page/impaktfull/xray/getting-started">Quick Start</a> •
  <a href="https://docs.page/impaktfull/xray/app/desktop-app">Desktop app</a> •
  <a href="https://xrayinspector.dev">Website</a>
</p>

<p align="center">
  <a href="https://docs.page/impaktfull/xray/app/install-macos">macOS</a> •
  <a href="https://docs.page/impaktfull/xray/app/install-windows">Windows</a> •
  <a href="https://docs.page/impaktfull/xray/app/install-linux">Linux</a>
</p>

# xRay (inspector)

**xRay is a desktop inspector for Flutter teams.** Developers, QA and product people connect the xRay desktop app (macOS, Windows, Linux) to a running debug build on the local network, and see its network calls (HTTP, GraphQL, WebSockets, Serverpod), logs, key-value storage and files on one timeline. They can act on the device (appearance, locale, deep links, simulated pushes, feature flags) and record a session to hand a reproducible bug to a teammate.

- **It stays on your network.** What the inspectors capture goes straight from your app to the desktop app, never to a cloud. Only your sign-in goes to the xRay platform.
- **Protected and encrypted by default**, with a pairing code, a password or trusted desktops.
- **Debug builds only**, unless you explicitly allow a protected internal build.
- **Free during the alpha** for approved testers. The desktop app needs an impaktfull account with approved access: see [Account and access](https://docs.page/impaktfull/xray/app/account-and-access).

## Quick start

```yaml
dependencies:
  xray_inspector: ^0.1.0
  xray_network_dio_interceptor: ^0.1.0 # if you use Dio
```

```dart
import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:xray_inspector/xray_inspector.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  if (!kReleaseMode) {
    final networkInspector = XRayNetworkInspector(enableHttpOverride: true);
    final logInspector = XRayLogInspector();
    await XRayInspectorServer(
      config: XRayInspectorServerConfig(
        deviceName: () => 'Pixel 8',
        appName: () => 'Shop',
        inspectors: [networkInspector, logInspector],
      ),
    ).start();
  }
  runApp(const MyApp());
}
```

Run your app, open **Add Connection** in the xRay desktop app, pick your app and enter the pairing code it printed in its console. See the [Quick Start guide](https://docs.page/impaktfull/xray/getting-started) for the full setup.

## Desktop apps

| Platform | Install |
| -------- | ------- |
| macOS 12 or later | [Homebrew or DMG](https://docs.page/impaktfull/xray/app/install-macos) |
| Windows 10 or 11 | [Installer](https://docs.page/impaktfull/xray/app/install-windows) |
| Linux (x86_64) | [AppImage](https://docs.page/impaktfull/xray/app/install-linux) |

Downloads are on the [releases page](https://github.com/impaktfull/xray/releases).

## Packages

| Package | What it adds |
| ------- | ------------ |
| [`xray_inspector`](https://pub.dev/packages/xray_inspector) | The inspectors and the protected server. Start here |
| [`xray_network_dio_interceptor`](https://pub.dev/packages/xray_network_dio_interceptor) | Records Dio calls, including requests other interceptors stop |
| [`xray_serverpod_interceptor`](https://pub.dev/packages/xray_serverpod_interceptor) | Shows Serverpod calls by endpoint and method |
| [`xray_shared_preferences_inspector`](https://pub.dev/packages/xray_shared_preferences_inspector) | SharedPreferences in the Key-Value tab |
| [`xray_secure_storage_inspector`](https://pub.dev/packages/xray_secure_storage_inspector) | flutter_secure_storage in the Key-Value tab |
| [`xray_device_actions`](https://pub.dev/packages/xray_device_actions) | Device actions: appearance, locale, text size, animations, debug overlays |
| [`xray_inspector_core`](https://pub.dev/packages/xray_inspector_core) | Shared models, included with `xray_inspector` |

## Roadmap and feedback

Planned features are [issues labelled `roadmap`](https://github.com/impaktfull/xray/issues?q=is%3Aissue+is%3Aopen+label%3Aroadmap). Vote with a 👍, or open an issue to suggest a feature or report a bug.

---

> **Disclaimer:** This is a commercial package. To use it, you need either a
> commercial xRay license or a free xRay Community License. The xRay desktop
> apps for macOS, Windows and Linux are the authorized UI clients for this
> library. See the [License](https://docs.page/impaktfull/xray/license) and the
> [Terms & Conditions](https://docs.page/impaktfull/xray/terms-and-conditions).
