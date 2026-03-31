import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

export async function getPackageJsonMetadata(dir: string) {
  try {
    const packageJson = await readFile(resolve(dir, 'package.json'), 'utf-8')
    const parsed = JSON.parse(packageJson)
    return {
      name: parsed.name,
      description: parsed.description
    }
  } catch {
    return {
      name: 'docs'
    }
  }
}
