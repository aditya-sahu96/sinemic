import ast, json, os, sys

def main():
    root = sys.argv[1]
    nodes = []
    edges = []
    skipped = []
    files_parsed = 0
    all_files = []
    for dirpath, _, files in os.walk(root):
        for f in files:
            if f.endswith(".py"):
                all_files.append(os.path.join(dirpath, f))

    for full in all_files:
        rel = os.path.relpath(full, root).replace(os.sep, "/")
        try:
            with open(full, "r", encoding="utf-8") as fh:
                src = fh.read()
            tree = ast.parse(src, filename=full)
        except Exception as e:
            skipped.append({"file": rel, "reason": str(e)})
            continue
        files_parsed += 1
        # collect module-level names for import resolution
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef) or isinstance(node, ast.AsyncFunctionDef):
                nodes.append({"id": f"{rel}#{node.name}", "name": node.name, "kind": "function", "filePath": rel, "startLine": node.lineno, "endLine": getattr(node, "end_lineno", node.lineno)})
            elif isinstance(node, ast.ClassDef):
                nodes.append({"id": f"{rel}#{node.name}", "name": node.name, "kind": "class", "filePath": rel, "startLine": node.lineno, "endLine": getattr(node, "end_lineno", node.lineno)})
        # imports
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    name = alias.asname or alias.name.split(".")[-1]
                    nodes.append({"id": f"{rel}#{name}", "name": name, "kind": "import", "filePath": rel, "startLine": node.lineno, "endLine": node.lineno})
                    # resolved only if target file exists
                    target_mod = alias.name.replace(".", "/") + ".py"
                    target_path = os.path.join(root, target_mod)
                    resolved = os.path.exists(target_path)
                    edges.append({"from": f"{rel}#{name}", "to": alias.name, "kind": "imports", "resolved": resolved})
            elif isinstance(node, ast.ImportFrom):
                mod = node.module or ""
                for alias in node.names:
                    name = alias.asname or alias.name
                    nodes.append({"id": f"{rel}#{name}", "name": name, "kind": "import", "filePath": rel, "startLine": node.lineno, "endLine": node.lineno})
                    target_mod = (mod.replace(".", "/") if mod else "") + ".py"
                    target_path = os.path.join(root, target_mod) if mod else None
                    resolved = bool(target_path and os.path.exists(target_path))
                    edges.append({"from": f"{rel}#{name}", "to": (mod + "." + alias.name) if mod else alias.name, "kind": "imports", "resolved": resolved})
        # calls: simple name-based, resolved false
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                callee = None
                if isinstance(node.func, ast.Name):
                    callee = node.func.id
                elif isinstance(node.func, ast.Attribute):
                    callee = node.func.attr
                if callee:
                    # find enclosing function by line range (best effort: attach to nearest preceding function)
                    pass
        # attach calls to functions: for each function node, walk its body for calls
        for fn in [n for n in ast.walk(tree) if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))]:
            for c in ast.walk(fn):
                if isinstance(c, ast.Call):
                    callee = None
                    if isinstance(c.func, ast.Name):
                        callee = c.func.id
                    elif isinstance(c.func, ast.Attribute):
                        callee = c.func.attr
                    if callee:
                        edges.append({"from": f"{rel}#{fn.name}", "to": callee, "kind": "calls", "resolved": False})
        # exports: names without leading underscore at module level are considered exported (heuristic)
        for node in tree.body:
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                if not node.name.startswith("_"):
                    edges.append({"from": f"{rel}#{node.name}", "to": f"export:{node.name}", "kind": "exports", "resolved": True})

    out = {
        "language": "python",
        "nodes": nodes,
        "edges": edges,
        "coverage": {
            "filesParsed": files_parsed,
            "filesSkipped": len(skipped),
            "skippedReasons": [f"{s['file']}: {s['reason']}" for s in skipped],
        },
    }
    print(json.dumps(out))

if __name__ == "__main__":
    main()
