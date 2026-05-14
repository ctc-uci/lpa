# La Peña Reservations Portal

<img width="1400" height="1098" alt="image" src="https://github.com/user-attachments/assets/6667036c-2ab5-424e-a2e0-fcbda4f7ea53" />

This project is from the [Commit The Change](https://ctc-uci.com/) 2024-2025 Cohort and is currently deployed for use by [La Peña](https://lapena.org/).

## Who is La Peña?
Over time, La Peña has evolved into more than a physical space. It is a hub for BIPOC communities across the globe. Through music, art, and education, La Peña has fostered social justice initiatives and cultural understanding, creating an inclusive environment where marginalized voices can thrive. As it continues to engage with issues of cultural resistance, social equity, and political action, La Peña remains an enduring symbol of the power of community and solidarity.

## Current Problem
As we conducted research, our key findings were:

- Iterative schedules are difficult to track of, leading to error cases with double-booking venues.
- Invoice system is nonexistent, so program coordinators experience frustration with handling all their finances in a spreadsheet.
- There is a backlog of overdue payments, and manually creating invoices can be unreliable if the event schedule changed.

## Our Solution
To improve La Peña’s workflow, Commit the Change created a customizable administrative portal with the following features:

Event Scheduling System

Administrators can create recurring programs and one-time sessions and edit them anytime in the platform. Each program and session stores contact information about the client paying for the event, lead artists, and location data. This alleviates cognitive load and streamlines the scheduling process.

Google Calendar Synchronization

Every program automatically syncs with the administrative Google Calendar, allowing collective communication with staff and external members. All parties will have the same date and time reflected on the shared calendar.

Automated Invoices

Each program will automatically generate a monthly invoice to send to the client and lead artists associated with the event. This will significantly reduce labor costs, time, and allow for staff to focus on higher-priority tasks.

The product’s data is synced across different sections. For instance, when updates are made to a program (such as changing dates or locations) those changes are automatically reflected in the financial system. This integration reduces the risk of human error and ensures that financial documents are reliable.

Payment Notifications

Payment notifications alert admins about upcoming and overdue payments, showing exactly how late a payment is. This allows the team to act quickly and avoid miscommunications.

## Learn More
To learn more about this project, please read our [Project Overview](https://medium.com/@committhechange.uci/project-overview-la-peña-cultural-center-53f2fa5ddb34) on Medium!

## Google Calendar — server OAuth (optional)

For production-style OAuth, the API can store **Google refresh tokens only on the server** (never the client secret or refresh token in the browser). Short-lived access tokens are issued with `grant_type=refresh_token` at `https://oauth2.googleapis.com/token` and cached in memory per user on the server until shortly before `expires_in`.

1. In [Google Cloud Console](https://console.cloud.google.com/), create or select an OAuth **Client ID** of type **Web application**. Under **Authorized redirect URIs**, add the exact URL users return to after consent (for example `http://localhost:3000/oauth/google-calendar/callback` in development). The same string must be set as `VITE_GOOGLE_OAUTH_REDIRECT_URI` on the server.
2. Run the SQL migration `server/db/migrations/20260514_add_google_calendar_refresh_token.sql` against Postgres (adds nullable `google_calendar_refresh_token` on `users`).
3. Set server env vars: `VITE_GOOGLE_OAUTH_CLIENT_ID`, `VITE_GOOGLE_OAUTH_CLIENT_SECRET`, `VITE_GOOGLE_OAUTH_REDIRECT_URI`, and preferably `VITE_GOOGLE_OAUTH_STATE_SECRET` (HMAC for OAuth `state`). Keep these in **server** `.env` only (never in the Vite client env file, or secrets would ship to the browser). Do not log refresh tokens or the client secret.
4. Set client `VITE_GOOGLE_CALENDAR_USE_BACKEND=true` and ensure `VITE_DEV_BACKEND_HOSTNAME` / `VITE_PROD_BACKEND_HOSTNAME` match your API origin. Calendar API calls use `GET /google-calendar/access-token` with `credentials: 'include'`; the SPA route `/oauth/google-calendar/callback` must match your registered redirect URI.

With the flag off, the app keeps using Google Identity Services in the browser (existing behavior).

## Project setup steps from NPO Project Template:
<details>
  <summary>Project setup</summary>

  

A simple React, Vite, and Node.js monorepo built with Yarn workspaces. Uses Firebase for authentication, Chakra UI for components, and your choice of database (i.e. Postgres).

## Getting Started

### 1. Clone this repository, then `cd` into the directory

```shell
  git clone https://github.com/ctc-uci/npo-template-merged.git
  cd npo-template-merged
```

> [!WARNING]
> If you're a developer, you probably won't be cloning `npo-template-merged`. Replace `npo-template-merged` with the name of your team's repository.

> [!TIP]
> `npo-template-merged` is a template repository. [You can create a copy through Github.](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template)

### 2. Install dependencies

Install [Node.js, (version 18.20.4)](https://nodejs.org/en/download/package-manager). 

> [!TIP]
> On MacOS and Linux, installing Node with `nvm` is recommended!

Install [Yarn](https://classic.yarnpkg.com/lang/en/), our package manager of choice.

```shell
  > npm install --global yarn
```

Now, install packages:

```shell
  > yarn install
```

> [!TIP]
> This monorepo uses [Yarn Workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/) to manage dependencies across repositories. Unless you know what you're doing, you should install dependencies (`yarn install`) at the root of the repository (i.e. not in `/client` or `/server`).
> 
> However, you should add _new_ dependencies (`yarn add`) in the directory which actually uses them.

### 3. Get environment secrets

Both the `client` and `server` directories have their own `.env.local` and `.env` files, respectively. These secrets should be provided to you by your tech leads. 

**Client**

The `client` `.env` consists primarily of your Firebase secrets. An example is provided in `/client/.env.example`. Copy the contents into a new file named `.env.local`, then fill in the keys with the appropriate values.

> [!TIP]
> The code block below is an example of what your `.env.local` should (partially) look like.

```shell
VITE_FIREBASE_APIKEY=my-api-key
VITE_FIREBASE_AUTHDOMAIN=my-project.firebaseapp.com
VITE_FIREBASE_PROJECTID=my-project-id
...
```

**Server**

The `server` `.env` consists primarily of your database secrets. An example is provided in `/server/.env.example`. Copy the contents into a new file named `.env`, then fill in the keys with the appropriate values.

### 4. Start developing!

Start the development server by running this command:

```shell
  yarn run dev
```
</details>
