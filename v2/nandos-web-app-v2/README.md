# Nandos Web App V2

## Development

```bash
# Start development server
npm run dev

# Start Storybook
npm run storybook
```

## Code Formatting with Prettier

This project uses Prettier for code formatting. Prettier is configured with custom rules in `.prettierrc.js` and ignores files specified in `.prettierignore`.

### Available Commands

```bash
# Format all files in src/ directory
npm run format

# Check if files in src/ directory are formatted correctly (without making changes)
npm run format:check

# Format all files in the project
npm run format:all
```

### Configuration

Prettier configuration is defined in `.prettierrc.js`. You can modify these settings to match your team's coding style preferences.

### Pre-commit Hook (Recommended)

For the best experience, consider setting up a pre-commit hook using Husky and lint-staged to automatically format files before committing.
