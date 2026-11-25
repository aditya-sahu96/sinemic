package main

import (
	"encoding/json"
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"strings"
)

type Node struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Kind      string `json:"kind"`
	FilePath  string `json:"filePath"`
	StartLine int    `json:"startLine"`
	EndLine   int    `json:"endLine"`
}

type Edge struct {
	From     string `json:"from"`
	To       string `json:"to"`
	Kind     string `json:"kind"`
	Resolved bool   `json:"resolved"`
}

type Coverage struct {
	FilesParsed     int      `json:"filesParsed"`
	FilesSkipped    int      `json:"filesSkipped"`
	SkippedReasons  []string `json:"skippedReasons"`
}

type Graph struct {
	Language string   `json:"language"`
	Nodes    []Node   `json:"nodes"`
	Edges    []Edge   `json:"edges"`
	Coverage Coverage `json:"coverage"`
}

func main() {
	if len(os.Args) < 3 {
		fmt.Println("{}")
		return
	}
	root := os.Args[2]
	moduleName := readModuleName(root)

	fset := token.NewFileSet()
	var files []string
	filepath.Walk(root, func(p string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if info.IsDir() {
			if info.Name() == "vendor" || strings.HasPrefix(info.Name(), ".") {
				return filepath.SkipDir
			}
			return nil
		}
		if strings.HasSuffix(p, ".go") {
			files = append(files, p)
		}
		return nil
	})

	graph := Graph{Language: "go", Nodes: []Node{}, Edges: []Edge{}, Coverage: Coverage{SkippedReasons: []string{}}}

	for _, f := range files {
		rel, _ := filepath.Rel(root, f)
		rel = filepath.ToSlash(rel)
		src, err := os.ReadFile(f)
		if err != nil {
			graph.Coverage.FilesSkipped++
			graph.Coverage.SkippedReasons = append(graph.Coverage.SkippedReasons, rel+": "+err.Error())
			continue
		}
		file := fset.AddFile(f, -1, len(src))
		astFile, err := parser.ParseFile(fset, f, src, parser.ParseComments)
		if err != nil {
			graph.Coverage.FilesSkipped++
			graph.Coverage.SkippedReasons = append(graph.Coverage.SkippedReasons, rel+": "+err.Error())
			continue
		}
		graph.Coverage.FilesParsed++

		// imports
		for _, imp := range astFile.Imports {
			pathVal := strings.Trim(imp.Path.Value, "\"")
			name := ""
			if imp.Name != nil {
				name = imp.Name.Name
			} else {
				parts := strings.Split(pathVal, "/")
				name = parts[len(parts)-1]
			}
			id := rel + "#" + name
			graph.Nodes = append(graph.Nodes, Node{ID: id, Name: name, Kind: "import", FilePath: rel, StartLine: fset.Position(imp.Pos()).Line, EndLine: fset.Position(imp.End()).Line})
			resolved := strings.HasPrefix(pathVal, moduleName)
			graph.Edges = append(graph.Edges, Edge{From: id, To: pathVal, Kind: "imports", Resolved: resolved})
		}

		// functions and methods
		ast.Inspect(astFile, func(n ast.Node) bool {
			switch d := n.(type) {
			case *ast.FuncDecl:
				name := d.Name.Name
				id := rel + "#" + name
				graph.Nodes = append(graph.Nodes, Node{ID: id, Name: name, Kind: "function", FilePath: rel, StartLine: fset.Position(d.Pos()).Line, EndLine: fset.Position(d.End()).Line})
				// calls within func body
				ast.Inspect(d.Body, func(x ast.Node) bool {
					if call, ok := x.(*ast.CallExpr); ok {
						callee := ""
						switch fn := call.Fun.(type) {
						case *ast.Ident:
							callee = fn.Name
						case *ast.SelectorExpr:
							callee = fn.Sel.Name
						}
						if callee != "" {
							graph.Edges = append(graph.Edges, Edge{From: id, To: callee, Kind: "calls", Resolved: false})
						}
					}
					return true
				})
			case *ast.GenDecl:
				if d.Tok == token.TYPE {
					for _, spec := range d.Specs {
						if ts, ok := spec.(*ast.TypeSpec); ok {
							id := rel + "#" + ts.Name.Name
							kind := "type"
							if _, ok := ts.Type.(*ast.StructType); ok {
								kind = "class"
							}
							graph.Nodes = append(graph.Nodes, Node{ID: id, Name: ts.Name.Name, Kind: kind, FilePath: rel, StartLine: fset.Position(ts.Pos()).Line, EndLine: fset.Position(ts.End()).Line})
						}
					}
				}
				if d.Tok == token.VAR || d.Tok == token.CONST {
					for _, spec := range d.Specs {
						if vs, ok := spec.(*ast.ValueSpec); ok {
							for _, name := range vs.Names {
								id := rel + "#" + name.Name
								graph.Nodes = append(graph.Nodes, Node{ID: id, Name: name.Name, Kind: "variable", FilePath: rel, StartLine: fset.Position(vs.Pos()).Line, EndLine: fset.Position(vs.End()).Line})
							}
						}
					}
				}
			}
			return true
		})

		// exports: capitalized names
		ast.Inspect(astFile, func(n ast.Node) bool {
			if fn, ok := n.(*ast.FuncDecl); ok {
				if ast.IsExported(fn.Name.Name) {
					id := rel + "#" + fn.Name.Name
					graph.Edges = append(graph.Edges, Edge{From: id, To: "export:" + fn.Name.Name, Kind: "exports", Resolved: true})
				}
			}
			return true
		})
		_ = file
	}

	out, _ := json.Marshal(graph)
	fmt.Println(string(out))
}

func readModuleName(root string) string {
	data, err := os.ReadFile(filepath.Join(root, "go.mod"))
	if err != nil {
		return ""
	}
	for _, line := range strings.Split(string(data), "\n") {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "module ") {
			return strings.TrimSpace(strings.TrimPrefix(line, "module "))
		}
	}
	return ""
}
