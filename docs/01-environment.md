# HW06 - Environment Check

## Source EShop

- **Source path:** `E:\KiemThu\HW06\eshop-sut`
- **Git repository root:** `E:/KiemThu/HW06/eshop-sut`
- **Git commit:** `85af3ba875c88283615e22cb108f13e2fccaf0e9`
- **Main structure:**

  ```text
  eshop-sut/
  |-- backend/
  |-- frontend-admin/
  |-- frontend-mobile/
  |-- frontend-web/
  |-- api_specification.md
  |-- README.md
  |-- setup_guide.md
  `-- run_servers.sh
  ```

- **API specification source:** `E:\KiemThu\HW06\eshop-sut\api_specification.md`
- **API specification copy:** `E:\KiemThu\HW06\specs\api_specification.md`
- The copied specification's SHA-256 matches the source file.
- **README:** `E:\KiemThu\HW06\eshop-sut\README.md`
- **Setup guide:** `E:\KiemThu\HW06\eshop-sut\setup_guide.md`
- **Backend package manifest:** `E:\KiemThu\HW06\eshop-sut\backend\package.json`

## Backend Requirements

- The setup guide requires Node.js `>=18.x` and npm.
- The backend uses CommonJS and declares `express`, `body-parser`, `cors`, `jsonwebtoken`, and `sqlite3` dependencies. `package.json` has no `start` script; the setup guide's server command is `node server.js`.
- The setup guide describes installing backend dependencies with `npm install` in `backend/`. No dependencies were installed during this check.
- The backend uses a local SQLite database at `backend/database.sqlite`; no separate database service is listed as a prerequisite.

## Installed Tools

| Tool | Status | Version / finding |
| --- | --- | --- |
| Git | AVAILABLE | 2.51.2.windows.1 |
| Node.js | AVAILABLE | v24.11.1; meets the documented `>=18.x` requirement |
| npm | AVAILABLE | 11.6.2 |
| Postman | AVAILABLE | 11.117.0 |
| Newman | MISSING | `newman` command not found; no global Newman package found |
| Newman HTML reporter | MISSING | No global `newman-reporter-htmlextra` or `newman-reporter-html` package found |

## Database Status

- `backend/database.sqlite` already exists (36,864 bytes; last modified 2026-10-13 17:04 local time). Its contents and data state were not inspected.
- `database.js` opens this file and calls `initDatabase()` when the module is loaded. That initializer drops and recreates tables, then seeds sample records.
- Database initialization was not run. **Do not run `node database.js` against the existing database without first deciding how to preserve its current data**, because the documented initialization path is destructive.

## Issues And Follow-Up

- Newman and an HTML reporter are not currently available; no installations were performed.
- The existing SQLite file's data state is unknown, and the initialization script would replace its tables/data.
- The backend package manifest has no `start` script; use the documented direct Node command when server startup is later authorized.
- Setup documentation contains example login details; no credential values are reproduced in this report.

## Review Status

**Human review status: PENDING**