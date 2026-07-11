import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const githubRepositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base =
  process.env.GITHUB_PAGES === 'true' && githubRepositoryName
    ? `/${githubRepositoryName}/`
    : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.{ts,tsx}'],
  },
})
