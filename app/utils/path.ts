export type Path = string[]
export type PathSegment = { [key: string]: any }

export function getValueAtPath(root: PathSegment, path: Path): any {
    return path.reduce((node, key) => node?.[key] ?? {}, root);
}

export function getParentForPath(root: { [key: string]: any }, path: Path) {
    return getValueAtPath(root, path.slice(0, -1));
}

export function setValueAtPath(root: PathSegment, path: Path, value: any) {
    const lastKey = path.pop();
    if (lastKey === undefined) throw new Error('Path cannot be empty');
    const parent = path.reduce((node, key) => node[key] ??= {}, root);
    parent[lastKey] = value;
    return root;
}