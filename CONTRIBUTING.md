# Contributing to Formatter

All submissions to this project must be made under the [Developer Certificate of Origin](https://developercertificate.org/). All commits must include a `Signed-off-by` line. Use `git commit -s` to add it automatically.

We welcome contributions including:

- Bug reports
- Bug fixes
- New features
- Documentation improvements
- Ideas and feedback

To help maintain quality with limited maintainer bandwidth, please follow the guidelines below.

## Reporting Issues

Search the [issue tracker](https://github.com/CairnCMS/directus-extension-formatter/issues) for an existing or closely related issue before creating a new one. Include closed issues in your search.

If an open issue already exists, read through the discussion. If you can add something helpful, do so. Add a 👍 if you'd like to see it prioritized.

If no issue exists, create one with the bug report form. Include steps to reproduce, error output, relevant configuration, and your environment details.

For security vulnerabilities, do not open a public issue. See our [security policy](https://github.com/CairnCMS/directus-extension-formatter/security/policy) or email security@cairncms.dev.

## Pull Requests

Before starting work, check for an existing issue or open one. This creates the opportunity to discuss the approach before you spend time on implementation.

The formatting engine in `src/lib` is shared with CairnCMS Formatter and kept identical to it. Engine changes are made first in the [CairnCMS extensions repository](https://github.com/CairnCMS/extensions) and then copied here, so open pull requests for `src/lib` there. Pull requests in this repository cover the Directus integration, tests, and documentation.

If you want to use AI tools in your contribution, review our [AI Policy](https://github.com/CairnCMS/cairncms/blob/main/AI_POLICY.md) before submitting.

To improve the chance of your pull request being merged:

- Be focused in scope. One PR per concern.
- Include a clear description of what changed and why.
- Reference the related issue.
- Add or update tests where appropriate.
- Make sure `npm test` and `npm run lint` pass before submitting.

Pull requests will be reviewed by a maintainer. Be prepared to answer questions about your changes and to make adjustments based on feedback.

## Source Use and Clean Implementations

Contributors are responsible for ensuring they have the right to submit their work under GPLv3.

You may learn from public documentation, standards, issue discussions, CVE/GHSA disclosures, release notes, and observed product behavior. You must not copy code, tests, comments, helper structure, naming, or distinctive implementation shape from source that is not available to this project under GPL-compatible terms. This includes Directus core.

If you inspect non-GPL-compatible source to understand behavior, write the implementation independently. Use later comparison only to verify behavior, not as a guide for structure or code shape.

If a contribution adapts code from a compatible open-source project, preserve any required notices and mention the source in the PR. Maintainers may ask what sources informed a change, especially for security fixes.

## Development Setup

This repository holds a single Directus operation extension, built with the Directus extensions SDK on Node.js 22. Install dependencies with `npm ci`. Then `npm run build` builds the extension, `npm run validate` runs the Directus extension checks, and `npm run typecheck`, `npm test`, and `npm run lint` run the same checks as CI. See the [Directus extensions documentation](https://directus.com/docs/guides/extensions/overview) for the toolchain. To test the operation end to end, build it, run `npm pack`, and unpack the package into a local Directus instance's extensions folder, following the README's installation steps.

## Conduct

Please review our [code of conduct](https://github.com/CairnCMS/cairncms/blob/main/CODE_OF_CONDUCT.md).

## Discussions

For questions, ideas, or general conversation, visit [GitHub Discussions](https://github.com/CairnCMS/directus-extension-formatter/discussions).
