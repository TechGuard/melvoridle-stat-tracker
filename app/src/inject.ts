//
// Inject into global functions
//

export class Injector {
    __original: any;
}

// Decorator
export function Override() {
    return (target: Object, functionName: string, desc: PropertyDescriptor) => {
        // Register function name
        const overrides = Object.getOwnPropertyDescriptor(target, overridesPropertyKey);
        if (overrides) {
            overrides.value.push(functionName);
        } else {
            Object.defineProperty(target, overridesPropertyKey, {
                enumerable: false,
                value: [functionName],
            });
        }

        // Wrap function to check if it has been overwritten and log function.
        const method = desc.value;
        desc.value = function (...args: any[]) {
            const injector = this as Injector;
            if (!injector || !injector.__original || !injector.__original[functionName]) {
                throw `Override function ${functionName} called but the function is not overwritten!`;
            }
            if (DEBUG_LOG) {
                console.debug(`${functionName}(${args})`);
            }
            return method.apply(this, args);
        };
        return desc;
    };
}

export function Inject(injector: Injector) {
    // Check if injector is valid
    const overrides = injector as any;
    const overrideKeys = overrides[overridesPropertyKey];
    if (!overrideKeys) {
        throw 'Invalid injector object given.';
    }

    // Store originals
    Object.defineProperty(injector, '__original', {
        enumerable: false,
        value: {},
    });

    // Override functions
    for (const functionName of overrideKeys) {
        const override: InjectedFunction = overrides[functionName].bind(injector);
        override.__injected = true;

        injector.__original[functionName] = GLOBAL[functionName];
        GLOBAL[functionName] = override;
    }
}

// Restores the injected functions with the originals
export function Eject(injector: Injector) {
    // Checck if the injector is valid
    if (!injector.__original) {
        throw 'Invalid injector object given.';
    }

    // Restore functions if they were overriden
    for (const functionName in injector.__original) {
        const override = GLOBAL[functionName] as InjectedFunction;
        if (override.__injected) {
            GLOBAL[functionName] = injector.__original[functionName];
        }
    }
}

declare var DEBUG_LOG: boolean;

const overridesPropertyKey = '__overrides';

interface InjectedFunction extends Function {
    __injected: boolean;
}

const GLOBAL: {
    [key: string]: Function;
} = window as any;
