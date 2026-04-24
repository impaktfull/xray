<p align="center">
  <img src="https://raw.githubusercontent.com/impaktfull/xray/main/assets/logo_full.png" alt="xRay (inspector)" height="250" />
</p>

<p align="center">
  <a href="https://pub.dev/packages/xray_inspector"><img src="https://img.shields.io/pub/v/xray_inspector?label=pub.dev&labelColor=333940&logo=dart&color=00589B" alt="pub"></a>
  <a href="https://github.com/impaktfull/xray"><img src="https://img.shields.io/github/stars/impaktfull/xray_inspector?style=flat&label=stars&labelColor=333940&color=8957e5&logo=github" alt="github"></a>
</p>

<p align="center">
  <a href="https://docs.page/impaktfull/xray">Documentation</a> •
  <a href="https://docs.page/impaktfull/xray/getting-started">Quick Start</a> •
  <a href="https://docs.page/impaktfull/xray/guides/network-inspection">Network Inspection</a>
</p>

<p align="center">
  <a href="https://xrayinspector.dev/install?platform=macos">macOS App</a> •
</p>

# xRay (inspector)

> A comprehensive Flutter debugging toolkit that captures and displays **network calls**, **logs**, and **key-value storage** — all inspectable in real-time via the xRay app.

- 🔍 **Why?**: Debugging Flutter apps shouldn't require print statements or platform-specific tools. xRay (inspector) gives you a live, structured view of everything happening inside your app.
- 👥 **Who?**: Built for Flutter developers who need deep insight into network traffic, app logs, and persistent storage during development and QA.
- 🚀 **What?**: A composable, dependency-injection-friendly inspection layer that runs an HTTP/WebSocket server inside your app and lets the xRay app connect to it in real-time.

### Core Features

- 🌐 **Network inspection**: Capture every HTTP request, response, and error with full headers and body.
- 📋 **Log inspection**: Structured log levels (verbose, debug, info, warning, error) with real-time streaming.
- 🗄️ **Key-value inspection**: Browse, edit, and delete entries from SharedPreferences and flutter_secure_storage — live.
- 📡 **Remote UI**: Connect the xRay app (macOS, iOS, Android) over the local network via UDP discovery — no config needed.
- ♻️ **Reactive**: All data exposed as `ValueNotifier` for seamless Flutter rebuilds.
- 🧩 **Composable**: Add only the inspectors you need. No forced singletons, no hidden globals.

---

> **Disclaimer:** This is a commercial package. To use this package, you need
> to have either a commercial xRay license or a free xRay Community License.
> The xRay macOS, iOS, and Android apps are the authorized UI clients for this library.
> For more details, please check the [LICENSE](https://xrayinspector.dev/license) file.

## Apps

| Platform | Download                                                       |
| -------- | -------------------------------------------------------------- |
| macOS    | [Download](https://xrayinspector.dev/install?platform=macos)   |

## Packages

| Package                                                                                           | Description                                       |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| [`xray_inspector`](https://pub.dev/packages/xray_inspector)                                       | Core package — inspectors + HTTP/WebSocket server |
| [`xray_network_dio_interceptor`](https://pub.dev/packages/xray_network_dio_interceptor)           | Dio HTTP interceptor                              |
| [`xray_shared_preferences_inspector`](https://pub.dev/packages/xray_shared_preferences_inspector) | SharedPreferences key-value inspector             |
| [`xray_secure_storage_inspector`](https://pub.dev/packages/xray_secure_storage_inspector)         | flutter_secure_storage inspector                  |

## Architecture

```
Your Flutter app
       │
       ├── XRayNetworkInspector   ◄── XRayNetworkDioInterceptor
       ├── XRayLogInspector
       ├── XRaySharedPreferencesInspector
       └── XRaySecureStorageInspector
                        │
              XRayInspectorServer  (HTTP + WebSocket + UDP discovery)
                        │
                  xRay App (macOS / iOS / Android)
```

The inspector server runs inside your app and broadcasts data over HTTP and WebSocket. The xRay app connects to it automatically via UDP discovery — no configuration needed.

## Quick Start

Add the packages you need:

```yaml
dependencies:
  xray_inspector: ^0.0.1
  xray_network_dio_interceptor: ^0.0.1 # if you use Dio
  xray_shared_preferences_inspector: ^0.0.1 # optional
  xray_secure_storage_inspector: ^0.0.1 # optional
```

Set up inspectors at app startup:

```dart
final networkInspector = XRayNetworkInspector();
final logInspector = XRayLogInspector();

final dio = Dio()
  ..interceptors.add(
    XRayNetworkDioInterceptor(inspector: networkInspector),
  );

final server = XRayInspectorServer(
  config: XRayInspectorServerConfig(
    inspectors: [networkInspector, logInspector],
  ),
);

await server.start();
```

Then open the xRay app on macOS, iOS, or Android — it will auto-discover your running server on the local network.

See the [Quick Start guide](https://docs.page/impaktfull/xray/getting-started) for the full setup.

## Design Principles

- **No singletons** — all dependencies are passed explicitly via constructors.
- **No disk I/O** — all captured data lives in memory only.
- **Composable** — add only the inspectors you need.
