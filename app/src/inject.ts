//
// Inject into global functions
//

// Function signatures
export interface FunctionSignatures {
    addXP: (skill: number, xp: number) => void;
    addItemToBank: (itemID: number, quantity: number, found: boolean, showNotification: boolean) => boolean;

    [key: string]: Function;
}

interface InjectedFunction extends Function {
    __injected: boolean;
}

const GLOBAL: {
    [key: string]: Function;
} = window as any;

const STRIP_COMMENTS = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/gm;
const ARGUMENT_NAMES = /([^\s,]+)/g;

function getFunctionArguments(func: Function) {
    const fnStr = func.toString().replace(STRIP_COMMENTS, '');
    return fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
}

function checkSignature(funcA: Function, funcB: Function) {
    const argsA = getFunctionArguments(funcA);
    const argsB = getFunctionArguments(funcB);
    if (!argsA || !argsB || argsA.length != argsB.length) {
        return false;
    }
    for (let i = 0; i < argsA.length; i++) {
        if (argsA[i] != argsB[i]) {
            return false;
        }
    }
    return true;
}

// Injects the 'overrides' into the global functions
export function Inject(overrides: FunctionSignatures) {
    const originals: FunctionSignatures = {} as any;

    // Validate function signatures
    for (const functionName in overrides) {
        originals[functionName] = GLOBAL[functionName];
        if (!checkSignature(originals[functionName], overrides[functionName])) {
            throw `Failed to override function '${functionName}': signatures do not match.`;
        }
    }

    // Override functions
    for (const functionName in overrides) {
        const override = overrides[functionName] as InjectedFunction;
        override.__injected = true;

        GLOBAL[functionName] = overrides[functionName];
    }

    return originals;
}

// Restores the injected functions with the 'originals'
export function Eject(originals: FunctionSignatures) {
    // Restore functions if they were overriden
    for (const functionName in originals) {
        const override = GLOBAL[functionName] as InjectedFunction;
        if (override.__injected) {
            GLOBAL[functionName] = originals[functionName];
        }
    }
}
