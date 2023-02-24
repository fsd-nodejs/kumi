# Kumi

Koa + Umi = Kumi, an framework for Chrome extension

## Directory structure

```bash
├── config # Build and Environment Configuration
├── mock
├── public # Static resources
└── src
    ├── assets # Media resources, including img, svg
    ├── components # Frontend Public components
    │   ├── AccountInfo
    │   └── Guide
    ├── constants # Static data structures
    ├── extension # Chrome extension files
    │   ├── background # Service worker
    │   ├── common # some common tools or structures for Service Worker and content script
    │   └── content # Content scripts, inject to WebSite
    ├── models # Front-end status containers
    ├── pages # Front-end pages (Popup UIs)
    │   ├── Access
    │   ├── Create
    │   ├── Home
    │   ├── Send
    │   └── Table
    ├── services # Front-end services (API definition)
    │   └── demo
    └── utils # Front-end utilities
        └── tools
```
