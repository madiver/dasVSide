# Data Model: Dependency Graph and Navigation

## ScriptNode
- **path**: Workspace-relative .das path (canonical identity)
- **id**: Optional keymap id
- **label**: Optional keymap label
- **outboundRefs**: List of resolved dependency edges
- **inboundRefs**: List of resolved dependency edges

## DependencyEdge
- **fromPath**: Caller script path
- **toPath**: Callee script path
- **referenceType**: ExecHotkey | DasPathLiteral
- **locations**: Zero or more source locations (line/column if available)

## GraphReport
- **nodes**: ScriptNode[]
- **edges**: DependencyEdge[]
- **findings**: Finding[]
- **metadata**: Analysis timestamp, script count, parse warnings

## Finding
- **type**: Cycle | DeadScript | MissingReference
- **message**: Human-readable summary
- **details**: Structured info (cycle path, missing target, etc.)
