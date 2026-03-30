<p align="center">
  <img src="https://raw.githubusercontent.com/impaktfull/impaktfull_inspector/main/images/logo.png" alt="Impaktfull Inspector" height="120" />
</p>

<p align="center">
  <a href="https://pub.dev/packages/impaktfull_inspector"><img src="https://img.shields.io/pub/v/impaktfull_inspector?label=pub.dev&labelColor=333940&logo=dart&color=00589B" alt="pub"></a>
  <a href="https://github.com/impaktfull/impaktfull_inspector"><img src="https://img.shields.io/github/stars/impaktfull/impaktfull_inspector?style=flat&label=stars&labelColor=333940&color=8957e5&logo=github" alt="github"></a>
  <a href="https://github.com/impaktfull/impaktfull_inspector/actions"><img src="https://img.shields.io/github/actions/workflow/status/impaktfull/impaktfull_inspector/test.yml?branch=main&label=tests&labelColor=333940&logo=github" alt="tests"></a>
</p>

<p align="center">
  <a href="https://docs.page/impaktfull/xray">Documentation</a> •
  <a href="https://docs.page/impaktfull/xray/getting-started">Quick Start</a> •
  <a href="https://docs.page/impaktfull/xray/guides/network-inspection">Network Inspection</a> •
  <a href="https://docs.page/impaktfull/xray/guides/remote-ui">Remote UI</a>
</p>

# Impaktfull Inspector

> A comprehensive Flutter debugging toolkit that captures and displays **network calls**, **logs**, and **key-value storage** — all inspectable in real-time via a remote UI.

- 🔍 **Why?**: Debugging Flutter apps shouldn't require print statements or platform-specific tools. Impaktfull Inspector gives you a live, structured view of everything happening inside your app.
- 👥 **Who?**: Built for Flutter developers who need deep insight into network traffic, app logs, and persistent storage during development and QA.
- 🚀 **What?**: A composable, dependency-injection-friendly inspection layer that runs an HTTP/WebSocket server inside your app and lets any remote UI connect to it in real-time.

### Core Features

- 🌐 **Network inspection**: Capture every HTTP request, response, and error with full headers and body.
- 📋 **Log inspection**: Structured log levels (verbose, debug, info, warning, error) with real-time streaming.
- 🗄️ **Key-value inspection**: Browse, edit, and delete entries from SharedPreferences and flutter_secure_storage — live.
- 📡 **Remote UI**: A separate Flutter app or debug panel connects over the local network via UDP discovery — no config needed.
- ♻️ **Reactive**: All data exposed as `ValueNotifier` for seamless Flutter rebuilds.
- 🧩 **Composable**: Add only the inspectors you need. No forced singletons, no hidden globals.

## Packages

| Package | Description |
|---|---|
| [`impaktfull_inspector`](https://pub.dev/packages/impaktfull_inspector) | Core package — inspectors + HTTP/WebSocket server |
| [`impaktfull_network_dio_interceptor`](https://pub.dev/packages/impaktfull_network_dio_interceptor) | Dio HTTP interceptor |
| [`impaktfull_network_serverpod_interceptor`](https://pub.dev/packages/impaktfull_network_serverpod_interceptor) | Serverpod HTTP client interceptor |
| [`impaktfull_shared_preferences_inspector`](https://pub.dev/packages/impaktfull_shared_preferences_inspector) | SharedPreferences key-value inspector |
| [`impaktfull_secure_storage_inspector`](https://pub.dev/packages/impaktfull_secure_storage_inspector) | flutter_secure_storage inspector |
| [`impaktfull_inspector_ui`](https://pub.dev/packages/impaktfull_inspector_ui) | Flutter UI that connects to a running inspector server |
| [`impaktfull_inspector_core`](https://pub.dev/packages/impaktfull_inspector_core) | Pure Dart models and protocol constants (no Flutter dependency) |

## Architecture

```
Your Flutter app
       │
       ├── ImpaktfullNetworkInspector   ◄── ImpaktfullNetworkDioInterceptor
       ├── ImpaktfullLogInspector
       ├── ImpaktfullSharedPreferencesInspector
       └── ImpaktfullSecureStorageInspector
                        │
              ImpaktfullInspectorServer  (HTTP + WebSocket + UDP discovery)
                        │
              ImpaktfullInspectorUiController  (separate app or debug panel)
                        │
                Inspector UI screens
```

The inspector server runs inside your app and broadcasts data over HTTP and WebSocket. A separate UI — another device, simulator, or embedded debug panel — connects to it automatically via UDP discovery.

## Quick Start

Add the packages you need:

```yaml
dependencies:
  impaktfull_inspector: ^0.0.1
  impaktfull_network_dio_interceptor: ^0.0.1        # if you use Dio
  impaktfull_shared_preferences_inspector: ^0.0.1   # optional
  impaktfull_secure_storage_inspector: ^0.0.1       # optional
  impaktfull_inspector_ui: ^0.0.1                   # for the remote UI
```

Set up inspectors at app startup:

```dart
final networkInspector = ImpaktfullNetworkInspector();
final logInspector = ImpaktfullLogInspector();

final dio = Dio()
  ..interceptors.add(
    ImpaktfullNetworkDioInterceptor(inspector: networkInspector),
  );

final server = ImpaktfullInspectorServer(
  config: ImpaktfullInspectorServerConfig(
    inspectors: [networkInspector, logInspector],
  ),
);

await server.start();
```

Connect the remote UI:

```dart
final controller = ImpaktfullInspectorUiController();
await controller.connectLocal(); // auto-discovers on the local network

Navigator.push(
  context,
  MaterialPageRoute(
    builder: (_) => InspectorSettingsScreen(controller: controller),
  ),
);
```

See the [Quick Start guide](https://docs.page/impaktfull/impaktfull_inspector/getting-started) for the full setup.

## Design Principles

- **No singletons** — all dependencies are passed explicitly via constructors.
- **ValueNotifier reactivity** — all data exposed as `ValueNotifier` for Flutter rebuilds.
- **No disk I/O** — all captured data lives in memory only.
- **Composable** — add only the inspectors you need.

## Directories

- **/docs**: Documentation hosted at [docs.page/impaktfull/impaktfull_inspector](https://docs.page/impaktfull/impaktfull_inspector).
- **/website**: Landing page assets and static site.
