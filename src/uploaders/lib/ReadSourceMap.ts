import path from 'path'
import { promises as fs } from 'fs'
import stringifyFileAccessError from './StringifyFileAccessError'
import { Logger } from '../../Logger'

export default async function readSourceMap (sourceMapPath: string, basePath: string, logger: Logger): Promise<[string, string]> {
  logger.debug(`Reading source map "${sourceMapPath}"`)
  const fullSourceMapPath = path.resolve(basePath, sourceMapPath)
  try {
    let content = await fs.readFile(fullSourceMapPath, 'utf-8')
    if (content.startsWith(')]}')) {
      content = content.slice(4)
    }
    return [ content, fullSourceMapPath ]
  } catch (e) {
    logger.error(`The source map "${sourceMapPath}" could not be found. ${stringifyFileAccessError(e)}\n\n  "${fullSourceMapPath}"`)
    throw e
  }
}