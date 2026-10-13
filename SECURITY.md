# Security Policy

## Supported Versions

Mandaxing is pre-1.0 and under active development. Only the latest commit on `main` is supported with security fixes.

## Reporting a Vulnerability

Please do not report security vulnerabilities through public GitHub issues.

Report vulnerabilities privately through GitHub's private vulnerability reporting:

1. Open the **Security** tab of this repository.
2. Click **Report a vulnerability**.
3. Include a description, reproduction steps, and an impact assessment.

## Scope

Mandaxing is a fully client-side application. Relevant reports include:

- Cross-site scripting through imported or remotely fetched data
- Supply-chain issues in dependencies or build tooling
- Microphone, audio processing, or data-privacy flaws
- Content Security Policy or permissions-header bypasses on the deployed site

## Response

Reports are triaged as quickly as possible. Accepted issues are fixed on `main` and deployed with the next release of the static site.
