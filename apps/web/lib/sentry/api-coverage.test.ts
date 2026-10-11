// @vitest-environment node
import { describe, expect, it } from 'vitest';
import ts from 'typescript';

// Guard against a future API route silently returning an unreported 5xx.
const routes = import.meta.glob('../../app/api/**/route.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;
const methods = new Set([
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
]);

describe('API monitoring coverage', () => {
  it.each(Object.entries(routes))(
    'covers exported handlers in %s',
    (path, source) => {
      const sourceFile = ts.createSourceFile(
        path,
        source,
        ts.ScriptTarget.Latest,
        true
      );
      const route = path.replace('../../app', '').replace('/route.ts', '');
      let handlers = 0;
      for (const statement of sourceFile.statements) {
        const exported =
          ts.canHaveModifiers(statement) &&
          ts
            .getModifiers(statement)
            ?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
        if (!exported) continue;
        if (
          ts.isFunctionDeclaration(statement) &&
          statement.name &&
          methods.has(statement.name.text)
        ) {
          expect.fail(
            `${path}: ${statement.name.text} needs API failure reporting`
          );
        }
        if (!ts.isVariableStatement(statement)) continue;
        for (const declaration of statement.declarationList.declarations) {
          if (
            !ts.isIdentifier(declaration.name) ||
            !methods.has(declaration.name.text)
          )
            continue;
          handlers++;
          const call = declaration.initializer;
          expect(
            call && ts.isCallExpression(call),
            'handler must use the shared reporter'
          ).toBe(true);
          if (!call || !ts.isCallExpression(call)) continue;
          expect(call.expression.getText(sourceFile)).toBe('withSentryApiErrors');
          expect(call.arguments[1].getText(sourceFile)).toMatch(
            new RegExp(
              `^['"]${route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]$`
            )
          );
          expect(call.arguments[2].getText(sourceFile)).toBe(
            `'${declaration.name.text}'`
          );
        }
      }
      expect(handlers).toBeGreaterThan(0);
    }
  );
});
