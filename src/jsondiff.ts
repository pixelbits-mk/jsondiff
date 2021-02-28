export enum Type {
    Array = 'Array',
    Number = 'Number',
    String = 'String',
    Boolean = 'Boolean',
    Date = 'Date',
    Object = 'Object',
    Null = 'Null',
    Undefined = 'Undefined'
}
export enum Category {
    Root = 'Root',
    Stem = 'Stem',
    Leaf = 'Leaf'
}
export interface MetaData {
    type: Type,
    category: Category,
    level: number
}
export interface MetaType {
    key: string,
    meta: MetaData,
    value?: any
}
export enum ActionType {
    Add = 'Add',
    Remove = 'Remove',
    Update = 'Update'
}
export interface ActionMetaType {
    key: string,
    action: ActionType,
    meta: MetaData[],
    value: any[]
}
export enum MergeDirection {
    Left,
    Right,
    Both
}
export function _parse(obj: any, arr: any[], key: string, level: number): MetaData {
    if (obj === null) {
        return { type: Type.Null, category: Category.Leaf, level: level }
    }
    if (obj === undefined) {
        return { type: Type.Undefined, category: Category.Leaf, level: level }
    }
    if (typeof obj === 'string') {
        return { type: Type.String, category: Category.Leaf, level: level }
    }
    if (typeof obj === 'boolean') {
        return { type: Type.Boolean, category: Category.Leaf, level: level } 
    }
    if (typeof obj === 'number') {
        return { type: Type.Number, category: Category.Leaf, level: level }
    }
    if (Object.prototype.toString.call(obj) === "[object Date]") {
        return { type: Type.Date, category: Category.Leaf, level: level }
    }

    Object.keys(obj).forEach(t => {
        const propName = key + '.' + t
        const meta = _parse(obj[t], arr, propName, level + 1)
        arr.push({ key: propName, meta: meta, value: obj[t]})
    })
    if (Array.isArray(obj)) {
        return { type: Type.Array, category: Category.Stem, level: level }
    }
    return { type: Type.Object, category: Category.Stem, level: level }
}

export function parse(obj: any): MetaType[] {
    const arr = []
    const prop = '$'
    const level = 0
    const meta = _parse(obj, arr, prop, level)
    meta.category = Category.Root
    arr.push({ key: prop, meta: meta })
    arr.sort((a, b) => a.key.localeCompare(b.key) ? a.key.localeCompare(b.key) : a.meta.level - b.meta.level)
    return arr;
}

export function diff(obj1: any, obj2: any, direction: MergeDirection = MergeDirection.Both) {
    const p1 = parse(obj1);
    const p2 = parse(obj2);
    const p3 = merge(p1, p2, direction);
    return create(p3);
}
export function getMergeKeys(arr1: string[], arr2: string[], direction: MergeDirection) {
    switch(direction) {
        case MergeDirection.Left:
            return arr2;
        case MergeDirection.Right:
            return arr1;
        default: {
            return uniqueArray([...arr1, ...arr2]).sort()
        }
    }
}
export function _merge(arr1: MetaType[], arr2: MetaType[], direction: MergeDirection): ActionMetaType[] {
    const mergeKeys = getMergeKeys(arr1.map(t => t.key), arr2.map(t => t.key), direction)

    const arr = [];
    let i = 0, j = 0;
    while (i < arr1.length || j < arr2.length) {
        const item1 = arr1[i];
        const item2 = arr2[j];
        if (item1 && item2) {
            const result = item1.key.localeCompare(item2.key);
            if (result < 0) {
                if (search(mergeKeys, item1.key) >= 0) {
                    arr.push({ key: item1.key, meta: [item1.meta, null], value: [item1.value, null], action: ActionType.Remove })    
                }
                i = i + 1;
            }   
            if (result === 0) {
                if (search(mergeKeys, item1.key) >= 0) {
                    arr.push({ key: item1.key, meta: [item1.meta, item2.meta], value: [item1.value, item2.value], action: ActionType.Update })
                }
                i = i + 1;
                j = j + 1;
            }
            if (result > 0) {
                if (search(mergeKeys, item2.key) >= 0) {
                    arr.push({ key: item2.key, meta: [null, item2.meta], value: [null, item2.value], action: ActionType.Add })
                }
                j = j + 1;
            }    
        } else {
            if (item1) {
                if (search(mergeKeys, item1.key) >= 0) {
                    arr.push({ key: item1.key, meta: [item1.meta, null], value: [item1.value, null], action: ActionType.Remove })
                }
                i = i + 1
            }
            if (item2) {
                if (search(mergeKeys, item2.key) >= 0) { 
                    arr.push({ key: item2.key, meta: [null, item2.meta], value: [null, item2.value], action: ActionType.Add })
                }
                j = j + 1
            }
        }
        
    }
    return arr
}

export function merge(arr1: MetaType[], arr2: MetaType[], direction: MergeDirection): MetaType[] {
    const result = _merge(arr1, arr2, direction);
    const changes = result.map(t => {
        if (t.action === ActionType.Remove) {
            if (t.value[0]) {
                return { key: t.key, meta: t.meta[0], value: t.value[1] }
            }
        }
        if (t.action === ActionType.Add) {
            if (t.value[1]) {
                return { key: t.key, meta: t.meta[1], value: t.value[1]}
            }
        }
        if (t.action === ActionType.Update) {
            if (t.meta[0].category === Category.Leaf || t.meta[1].category === Category.Leaf) {
                if (t.value[0] != t.value[1]) {
                    return { key: t.key, meta: t.meta[1], value: t.value[1]}
                }
            } 
            return null           
        }
        return null
    })
    .filter(t => t != null )

    const keyChanges = changes.map(t => t.key);
    const keyPrefixes = generateKeys(keyChanges);
    return result.reduce((p, c) => {
        if (keyChanges.indexOf(c.key) >= 0) {
            p.push(changes.find(t => t.key === c.key))
        } else {
            if (keyPrefixes.indexOf(c.key) >= 0) {
                p.push({ key: c.key, meta: c.meta[1] })
            }
        }
        return p;
    }, []);
    
}
export function uniqueArray(arr: any[]) {
    return arr.filter((item, pos, self) => {
        return self.indexOf(item) == pos;
    })
}

export function generateKeys(keys: string[]) {
    const allKeys = keys.reduce((p, c) => { 
        const t = generateKeysPrefixes(c.split('.'));
        p.push(...t)
        return p;
    },[])
    return uniqueArray(allKeys);
}

export function generateKeysPrefixes(keys: string[]) {
    const values = keys.reduce((p, c) => {
        if (p.length > 0) {
            p.push(p[p.length - 1] + '.' + c)
            return p
        } 
        else {
            p.push(c);
            return p;
        }
    }, []);
    return values;
}

export function create(metaTypes:  MetaType[]) {
    return metaTypes.reduce((p, c) => {
        if (c.meta.category === Category.Stem) {
            createPropertyObj(p, c.key, c.meta.type)
        }
        if (c.meta.category === Category.Leaf) {
            const path = getObjectPath(c.key)
            const prop = getPropertyName(c.key)
            const obj = getPropertyObj(p, path)
            if (Array.isArray(obj)) {
                obj.push(c.value)
            } else {
                if (obj) {
                    obj[prop] = c.value
           
                }                
            }
        }
        return p
    }, {})
}

export function getObjectPath(key: string) {
    const keys = key.split('.');
    return keys.slice(1, keys.length - 1)
}

export function getPropertyName(key: string) {
    const keys = key.split('.');
    return keys[keys.length-1]
}

export function createPropertyObj(obj: any, key: string, type: Type) {
    const keys = getObjectPath(key);
    const prop = getPropertyName(key);
    obj = keys.reduce((p, c) => p[c], obj);
    obj[prop] = type == Type.Array ? [] : {};
    return obj
}
export function getPropertyObj(obj: any, path: string[]) {
   return path.reduce((p, c) => p[c], obj)
}
function search(ar: string[], el: string) {
    return ar.indexOf(el);
}