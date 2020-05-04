import { Override, Injector } from '../inject';
import Melvor from './bindings';
import App from '../components/App';
import { typedKeys } from '../util';

export default Melvor;

export class MelvorInjector extends Injector {
    app!: App;
    trackingEnabled = true;

    @Override()
    addXP(skill: number, xp: number): void {
        if (this.trackingEnabled) {
            this.app.trackObject('skill', skill, xp);
        }
        return this.__original.addXP(skill, xp);
    }

    @Override()
    addItemToBank(itemID: number, quantity: number, found = true, showNotification = true) {
        if (this.trackingEnabled && showNotification) {
            this.app.trackObject('item', itemID, quantity);
        }
        return this.__original.addItemToBank(itemID, quantity, found, showNotification);
    }

    @Override()
    unequipItem(equipmentSlot: number, equipmentSet: number) {
        return this.doNotTrack(() => this.__original.unequipItem(equipmentSlot, equipmentSet));
    }

    @Override()
    unequipFood() {
        return this.doNotTrack(() => this.__original.unequipFood());
    }

    @Override()
    updateOffline(continueAction = true) {
        return this.doNotTrack(() => this.__original.updateOffline(continueAction));
    }

    @Override()
    lootAll() {
        return this.doNotTrack(() => this.__original.lootAll());
    }

    @Override()
    dropLoot(enemy: number) {
        // Convert array to map
        const lootPerItem = (loot: typeof Melvor.droppedLoot) => {
            const result: { [itemID: number]: number } = {};
            loot.forEach((x) => (result[x.itemID] = (result[x.itemID] || 0) + x.qty));
            return result;
        };

        const lastGP = Melvor.gp;
        const lastDroppedLoot = lootPerItem(Melvor.droppedLoot);

        this.__original.dropLoot(enemy);

        if (!this.trackingEnabled) {
            return;
        }

        const addedGP = Melvor.gp - lastGP;
        if (addedGP > 0) {
            this.app.trackObject('coins', 1, addedGP);
        }

        const newDroppedLoot = lootPerItem(Melvor.droppedLoot);
        for (const itemID of typedKeys(newDroppedLoot)) {
            const addedItemQty = newDroppedLoot[itemID] - (lastDroppedLoot[itemID] || 0);
            if (addedItemQty != 0) {
                this.app.trackObject('item', itemID, addedItemQty);
            }
        }
    }

    doNotTrack<T>(callback: () => T): T {
        const tmp = this.trackingEnabled;
        this.trackingEnabled = false;
        const result = callback();
        this.trackingEnabled = tmp;
        return result;
    }
}
