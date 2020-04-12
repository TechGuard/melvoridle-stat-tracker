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

// Injects the 'overrides' into the global functions
export function Inject(overrides: FunctionSignatures) {
    const originals: FunctionSignatures = {} as any;

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
