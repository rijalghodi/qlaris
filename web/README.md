# Qlaris Web

Tech Stack: pnpm, Next.js, Tailwind, ShadCN, react-query, axios, react-hook-formm, zod

## Guide for Code Assistant

### Folder structure:

- app: pages
- components/ui: statis components
- components/<features-name>: features component
- services: api client
- lib: constant, helpers, utils
- lib/services: endpoints, api hook

### Guide

- Flow: create service api (if required) -> create feature and intergate API (if required) -> export feature in page -> insert page in App.tsx
- For every command I make, search src/services and src/features first if exisit, use it.
- Always install package using pnpm, or pnpm dlx
- Always use lucide-react icon if possible
- Always use export NON-default react component
- Always use UI commponent from "@workspace/ui/components"
- Always use global hooks from "@workspace/ui/hooks"
- Always use ShadCN component. If not exisit, install it by `pnpm dlx shadn@latest add ...`
- Always create feature component in "business/src/features/<feature-name>"
- Always use axios and react-query when fetching data and create a function in "business/src/services/"
- Always use react-hook-form when handle form
- Always use tailwind class for style if possible. And use class (color) provided in `@workspace/ui/src/styles/global.css`

### Exisitng Pattern

- This project follow pattern of `@workspacee/school` project, but only different in:
  - React router instead of next.js
  - Business usecase instead of school usecase
- The Facescan and fingerscan is similar to `@workspace/school` so use it

## TODO

- [x] Authentication
- [x] Company Management
- [x] Account Management
- [x] Applicant Management
- [x] Job Management
- [ ] Job match algorithm
- [ ] Chat AI
