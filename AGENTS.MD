MarketScope --- Agent Instructions

1. Project Purpose

MarketScope is a portfolio-quality financial market intelligence
dashboard whose primary purpose is to demonstrate and learn React
micro-frontends using Webpack 5 Module Federation.

The project should feel like a realistic application, but the
architecture and learning value are more important than building a
production-grade financial platform.

The core architectural goal is:

Build a React application composed of independently built and
independently deployable micro-frontends, with a React host/shell
loading remotes through Webpack 5 Module Federation.

The project is also intended as a learning vehicle. In particular, the
developer wants to understand Webpack 5 and Module Federation
deeply, not merely have AI generate a working configuration.

2. Non-Negotiable Technology Choices

Do not replace these technologies without explicit approval.

Frontend

React

TypeScript

Webpack 5

Webpack 5 Module Federation

React Router

TanStack Query

CSS Modules

Recharts or Apache ECharts for charts

React Testing Library

Vitest

Playwright

Backend

NestJS

TypeScript

PostgreSQL

Redis

PostgreSQL and Redis should be introduced when they provide a concrete
benefit. Do not prematurely build a large backend.

Repository / Tooling

Nx monorepo

npm unless an explicit decision is made otherwise

ESLint

Prettier

GitHub Actions

Docker / Docker Compose

Data providers

Initial providers:

Alpha Vantage for market data

CoinGecko for cryptocurrency data

FRED for economic data

Potential later provider:

European Central Bank (ECB) for European economic / FX data

Data-provider terms, API limits, attribution requirements, and licensing
must be respected. Do not assume that "free API" means unrestricted
commercial redistribution or unlimited requests.

3. Application Structure

The initial applications are:

apps/
  shell/
  markets/
  crypto/
  economy/
  watchlist/

services/
  api/

packages/
  ui/
  types/
  eslint-config/
  tsconfig/

Shell / Host

The shell owns:

application layout

top-level navigation

top-level routing

loading remote applications

global error boundaries

global notifications

user/demo context

shared UI infrastructure

application-level configuration

The shell should NOT own business logic belonging to a domain MFE.

Markets MFE

Owns:

market indices

stocks

ETFs

commodities

FX

historical price charts

top movers

instrument details

Crypto MFE

Owns:

cryptocurrencies

prices

market capitalization

trading volume

rankings

historical prices/performance

Economy MFE

Owns:

inflation

unemployment

interest rates

GDP

historical economic indicators

economic data-source attribution

Watchlist MFE

Owns:

adding/removing instruments

user's watchlist

filtering/sorting

watchlist persistence

compact instrument charts

4. Backend Architecture

NestJS is a BFF / data aggregation layer, not the main product.

The frontend should consume a stable MarketScope API rather than calling
third-party APIs directly.

Conceptually:

React MFE
   |
   v
NestJS API / BFF
   |
   +--> Redis cache
   |
   +--> Alpha Vantage
   +--> CoinGecko
   +--> FRED
   +--> ECB (later)

Example API shape:

GET /api/markets/indices
GET /api/markets/stocks/:symbol
GET /api/markets/stocks/:symbol/history

GET /api/crypto/assets
GET /api/crypto/:id
GET /api/crypto/:id/history

GET /api/economy/inflation
GET /api/economy/unemployment
GET /api/economy/interest-rates
GET /api/economy/gdp

GET /api/watchlist
POST /api/watchlist
DELETE /api/watchlist/:symbol

Exact routes may evolve as implementation progresses.

Backend principles

Hide third-party API keys on the server.

Normalize third-party API responses.

Cache expensive or rate-limited requests.

Keep provider-specific logic out of React MFEs.

Handle upstream failures gracefully.

Do not build unnecessary backend abstractions before they are
needed.

5. Micro-Frontend Architecture

The intended runtime relationship is:

                         Shell / Host
                              |
              +---------------+---------------+
              |               |               |
              v               v               v
           Markets          Crypto          Economy
             MFE              MFE             MFE
              |
              +----------------------+
                                     |
                                  Watchlist
                                     MFE

The shell dynamically loads remotes using Webpack 5 Module Federation.

Each MFE must be capable of being built independently.

The architecture should eventually support independent deployment such
as:

shell.marketscope.app
markets.marketscope.app
crypto.marketscope.app
economy.marketscope.app
watchlist.marketscope.app
api.marketscope.app

The exact hosting provider is not locked in yet.

Shared dependencies

React and React DOM should be treated as singleton shared dependencies.

Do not automatically share every package.

Any shared dependency should have a clear architectural reason.

6. State Management

Do NOT create a giant shared Redux-style application store across all
MFEs.

Use:

Server state

TanStack Query, local to each MFE.

Local UI state

React state/hooks inside each MFE.

Cross-MFE communication

Use explicit browser events / a small event-bus abstraction only when a
real cross-domain event is required.

Example:

window.dispatchEvent(
  new CustomEvent("watchlist.updated", {
    detail: { symbol: "AAPL" },
  }),
);

Avoid arbitrary bidirectional coupling between MFEs.

The preferred principle is:

MFEs should communicate through explicit contracts, not shared
implementation details.

7. Shared UI

Create a small shared UI package:

packages/ui/

It may contain components such as:

Button

Card

Modal

DataTable

Badge

Tabs

Select

Input

Loading/Skeleton

ErrorState

Use CSS Modules.

The shared UI package should contain presentation primitives, not
domain-specific market logic.

For example:

Good:

DataTable
PriceBadge
Card

Avoid:

StockPortfolioTable
FedRateWidget
BitcoinMarketCard

unless there is a strong reason.

8. Authentication

Authentication is NOT an initial priority.

Start with a mock/demo user and keep authentication behind an
abstraction so a real provider can be introduced later.

Do not add Auth0, Clerk, Keycloak, Cognito, etc. unless explicitly
requested.

9. Persistence

Do not introduce PostgreSQL merely because it is in the technology
stack.

For the earliest version, the watchlist may use localStorage.

PostgreSQL should be introduced later when persistent user/watchlist
data becomes useful.

Redis should be introduced when external API caching/rate-limit
protection becomes useful.

10. Styling

Use:

CSS Modules

a small shared design system

responsive layouts

accessible HTML

dark mode eventually

Do not introduce Tailwind unless explicitly approved.

11. Testing

Use:

Vitest for unit tests

React Testing Library for component behavior

Playwright for end-to-end flows

Important E2E scenarios should eventually include:

Shell loads successfully.

Remote MFE loads successfully.

Navigation between MFEs works.

A remote failure does not take down the shell.

API failure produces a useful UI state.

Watchlist changes propagate correctly.

The application remains usable at narrow viewport sizes.

12. Learning Mode --- CRITICAL

This project is explicitly being built to teach the developer Webpack
5 and Module Federation.

For Webpack and Module Federation work, the AI MUST use a teaching-first
workflow.

Do NOT

Generate a large Webpack configuration and tell the developer to
paste it.

Make many related configuration changes at once.

Hide important configuration behind generated abstractions.

Say "Webpack needs this" without explaining why.

Automatically repair configuration problems without explaining the
cause.

Move on after a successful build without explaining what happened.

DO

For each important Webpack / Module Federation step:

Explain the concept.

Explain why MarketScope needs it.

Make one small change.

Ask the developer to make the change themselves where practical.

Have the developer run the relevant command.

Inspect/discuss the result.

Explain what Webpack did.

Only then move to the next concept.

Prefer tiny increments such as:

Step 1: Create the host app.
Step 2: Understand a Webpack entry point.
Step 3: Add the Webpack config.
Step 4: Understand output/bundling.
Step 5: Add ModuleFederationPlugin.
Step 6: Understand name/exposes/remotes.
Step 7: Create the first remote.
Step 8: Load the remote from the host.
Step 9: Share React as a singleton.

The developer should understand every significant Module Federation
configuration field before it is introduced.

When teaching Module Federation, explicitly explain concepts including:

host

remote

container

remoteEntry.js

ModuleFederationPlugin

name

filename

remotes

exposes

shared

singleton dependencies

version negotiation

runtime loading

independently built remotes

deployment/version compatibility

remote failure

caching

public paths / asset loading

development vs production behavior

Do not assume prior Webpack knowledge.

13. General AI Coding Behavior

Before changing architecture

Explain the tradeoff and ask for confirmation if the decision is not
already established in this document.

Before large changes

Provide a concise plan.

Prefer incremental commits

When appropriate, suggest logical commits such as:

chore: initialize Nx workspace
feat: create shell webpack build
feat: create markets remote
feat: load markets remote from shell
feat: share react as singleton

Do not over-engineer

Prefer the smallest implementation that demonstrates the architectural
concept.

Keep code understandable

This is a learning project.

Avoid clever abstractions that obscure:

Webpack

Module Federation

React

API communication

caching

state ownership

Explain unfamiliar code

When introducing a non-obvious piece of code, explain:

what it does

why it exists

what would break without it

what alternative approaches exist

14. Architecture Showcase / Failure Demo

Eventually provide a developer-only panel capable of simulating:

MFE failure

API timeout

slow network

stale data

Redis unavailable

The goal is to demonstrate failure isolation.

For example:

Markets MFE     ERROR
Crypto MFE      HEALTHY
Economy MFE     HEALTHY
Watchlist MFE   HEALTHY

The shell must remain functional when an individual remote fails.

15. Data and Financial Disclaimer

This is a demonstration/portfolio application.

It is NOT a trading platform and must not imply that its data is
suitable for trading or investment decisions.

Market data may be delayed, cached, incomplete, or subject to provider
limitations.

Display appropriate source attribution where required.

Never fabricate market data and never silently present mock data as live
data.

16. Initial Scope

The first milestone is intentionally small:

Shell
  |
  +--> Markets MFE
           |
           +--> NestJS API
                    |
                    +--> one real market-data provider

The first useful vertical slice should prove:

React application works.

Webpack 5 builds the shell.

Webpack 5 Module Federation builds a remote.

Shell loads the remote.

React is correctly shared.

Remote can render a real market-data chart.

The developer understands each of those steps.

Do not start by implementing all five MFEs.

17. Definition of Done for the Initial Architecture

The initial architecture is successful when:

Shell and Markets are separate Webpack builds.

Markets is loaded by the Shell through Module Federation.

The Shell does not contain Markets implementation code.

React is shared correctly.

Markets can be rebuilt independently.

A remote failure is contained by the Shell.

The Markets MFE obtains data through NestJS.

Third-party API credentials are not exposed to the browser.

The developer can explain remoteEntry.js, host/remote, exposes,
remotes, and shared.

Visual examples are in the /planning folder.