import fs from "node:fs";
import path from "node:path";
import * as ts from "typescript";
import type { LanguageAdapter, StackInfo, SymbolGraph, SymbolNode, SymbolEdge, CheckCommand, LanguageId } from "../../../contracts/types";
import { detectStack } from "../../stack";

function toRel(p: string, root: string): string {
  return p.replace(root, "").replace(/^[\\/]/, "").split(path.sep).join("/");
}

function nodeId(rel: string, name: string): string {
  return `${rel}#${name}`;
}

export const typescriptAdapter: LanguageAdapter = {
  id: "typescript",
  detect(projectPath: string): StackInfo | null {
    if (!fs.existsSync(path.join(projectPath, "tsconfig.json"))) return null;
    return detectStack(projectPath);
  },
  extract(projectPath: string): SymbolGraph {
    const configPath = ts.findConfigFile(projectPath, ts.sys.fileExists, "tsconfig.json");
    if (!configPath) {
      return { language: "typescript", nodes: [], edges: [], coverage: { filesParsed: 0, filesSkipped: 0, skippedReasons: ["no tsconfig.json"] } };
    }
    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
    const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configPath));
    const program = ts.createProgram(parsed.fileNames, parsed.options);
    const checker = program.getTypeChecker();

    const nodes: SymbolNode[] = [];
    const edges: SymbolEdge[] = [];
    const nodeIds = new Set<string>();

    function addNode(n: SymbolNode) {
      if (!nodeIds.has(n.id)) {
        nodeIds.add(n.id);
        nodes.push(n);
      }
    }

    const sourceFiles = program.getSourceFiles().filter((sf) => !sf.isDeclarationFile);

    for (const sf of sourceFiles) {
      const rel = toRel(sf.fileName, projectPath);
      const visit = (node: ts.Node, enclosing: string | null) => {
        if (ts.isFunctionDeclaration(node) && node.name) {
          const name = node.name.text;
          addNode({ id: nodeId(rel, name), name, kind: "function", filePath: rel, startLine: sf.getLineAndCharacterOfPosition(node.getStart()).line + 1, endLine: sf.getLineAndCharacterOfPosition(node.getEnd()).line + 1 });
          enclosing = name;
        } else if (ts.isClassDeclaration(node) && node.name) {
          const name = node.name.text;
          addNode({ id: nodeId(rel, name), name, kind: "class", filePath: rel, startLine: sf.getLineAndCharacterOfPosition(node.getStart()).line + 1, endLine: sf.getLineAndCharacterOfPosition(node.getEnd()).line + 1 });
        } else if (ts.isTypeAliasDeclaration(node)) {
          addNode({ id: nodeId(rel, node.name.text), name: node.name.text, kind: "type", filePath: rel, startLine: sf.getLineAndCharacterOfPosition(node.getStart()).line + 1, endLine: sf.getLineAndCharacterOfPosition(node.getEnd()).line + 1 });
        } else if (ts.isInterfaceDeclaration(node)) {
          addNode({ id: nodeId(rel, node.name.text), name: node.name.text, kind: "type", filePath: rel, startLine: sf.getLineAndCharacterOfPosition(node.getStart()).line + 1, endLine: sf.getLineAndCharacterOfPosition(node.getEnd()).line + 1 });
        } else if (ts.isVariableStatement(node)) {
          for (const decl of node.declarationList.declarations) {
            if (ts.isIdentifier(decl.name)) {
              const name = decl.name.text;
              const isFn = !!decl.initializer && (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer));
              addNode({ id: nodeId(rel, name), name, kind: isFn ? "function" : "variable", filePath: rel, startLine: sf.getLineAndCharacterOfPosition(decl.getStart()).line + 1, endLine: sf.getLineAndCharacterOfPosition(decl.getEnd()).line + 1 });
            }
          }
        } else if (ts.isImportDeclaration(node)) {
          const moduleSpec = (node.moduleSpecifier as ts.StringLiteral).text;
          const clause = node.importClause;
          if (clause) {
            const bindings: string[] = [];
            if (clause.name) bindings.push(clause.name.text);
            if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
              for (const el of clause.namedBindings.elements) bindings.push(el.name.text);
            }
            for (const b of bindings) {
              const id = nodeId(rel, b);
              addNode({ id, name: b, kind: "import", filePath: rel, startLine: sf.getLineAndCharacterOfPosition(node.getStart()).line + 1, endLine: sf.getLineAndCharacterOfPosition(node.getEnd()).line + 1 });
              edges.push({ from: id, to: `${moduleSpec}#${b}`, kind: "imports", resolved: false });
            }
          }
        } else if (ts.isExportDeclaration(node)) {
          // handled via edges below
        }
        ts.forEachChild(node, (c) => visit(c, enclosing));
      };

      // calls detection via separate pass
      const callVisitor = (node: ts.Node) => {
        if (ts.isCallExpression(node)) {
          const expr = node.expression;
          let calleeName: string | null = null;
          if (ts.isIdentifier(expr)) calleeName = expr.text;
          else if (ts.isPropertyAccessExpression(expr)) calleeName = expr.name.text;
          if (calleeName) {
            // find enclosing function name by walking up? We'll attach later; push marker
            callSites.push({ file: rel, callee: calleeName, pos: node.getStart() });
          }
        }
        ts.forEachChild(node, callVisitor);
      };

      visit(sf, null);
      callVisitor(sf);
    }

    // Resolve call edges: map position to enclosing function node
    // Re-walk to assign calls to enclosing functions
    for (const sf of sourceFiles) {
      const rel = toRel(sf.fileName, projectPath);
      let currentFn: string | null = null;
      const walk = (node: ts.Node) => {
        let pushed = false;
        if (ts.isFunctionDeclaration(node) && node.name) { currentFn = node.name.text; pushed = true; }
        else if (ts.isVariableStatement(node)) {
          // detect arrow functions handled loosely; skip
        }
        if (ts.isCallExpression(node)) {
          const expr = node.expression;
          let callee: string | null = null;
          if (ts.isIdentifier(expr)) callee = expr.text;
          else if (ts.isPropertyAccessExpression(expr)) callee = expr.name.text;
          if (callee && currentFn) {
            const fromId = nodeId(rel, currentFn);
            if (nodeIds.has(fromId)) {
              edges.push({ from: fromId, to: callee, kind: "calls", resolved: nodeIds.has(callee) || false });
            }
          }
        }
        ts.forEachChild(node, walk);
        if (pushed) currentFn = null;
      };
      walk(sf);
    }

    // exports edges: for each export statement declaration
    for (const sf of sourceFiles) {
      const rel = toRel(sf.fileName, projectPath);
      const walkExports = (node: ts.Node) => {
        if (ts.isExportDeclaration(node)) {
          // namespace/default export of module
        }
        if (ts.canHaveModifiers(node)) {
          const mods = ts.getModifiers(node);
          if (mods && mods.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
            let name: string | null = null;
            if (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) {
              name = node.name ? node.name.text : null;
            } else if (ts.isVariableStatement(node)) {
              const d = node.declarationList.declarations[0];
              if (d && ts.isIdentifier(d.name)) name = d.name.text;
            }
            if (name) {
              const id = nodeId(rel, name);
              if (nodeIds.has(id)) {
                edges.push({ from: id, to: `export:${name}`, kind: "exports", resolved: true });
              }
            }
          }
        }
        ts.forEachChild(node, walkExports);
      };
      walkExports(sf);
    }

    // unused callSites variable cleanup
    void callSites;

    const filesParsed = sourceFiles.length;
    const filesSkipped = parsed.fileNames.length - sourceFiles.length;

    return {
      language: "typescript",
      nodes,
      edges,
      coverage: { filesParsed, filesSkipped, skippedReasons: [] },
    };
  },
  checks(projectPath: string): CheckCommand[] {
    return [
      { name: "typecheck", command: ["npx", "tsc", "--noEmit"], cwd: projectPath, timeoutMs: 120000 },
      { name: "test", command: ["npx", "vitest", "run"], cwd: projectPath, timeoutMs: 120000 },
    ];
  },
};

// placeholder to avoid unused
const callSites: { file: string; callee: string; pos: number }[] = [];

export function buildGraph(language: LanguageId, graph: Omit<SymbolGraph, "language">): SymbolGraph {
  return { language, ...graph };
}

export default typescriptAdapter;
export { typescriptAdapter as adapter };
