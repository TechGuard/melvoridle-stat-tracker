import { Override, Injector } from '../inject';
import Melvor from './bindings';
import App from '../components/App';

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

    doNotTrack<T>(callback: () => T): T {
        const tmp = this.trackingEnabled;
        this.trackingEnabled = false;
        const result = callback();
        this.trackingEnabled = tmp;
        return result;
    }
}
