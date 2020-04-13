import React, { Component } from 'react';
import Melvor from '../melvor';
import styles from '../styles.scss';

export type ObjectType = 'skill' | 'item';

export interface TrackedObject {
    type: ObjectType;
    key: string;
    id: number;
    lastUpdated: number;
    valuePerSecond: number;
    values: { time: number; value: number }[];
    valueIdx: number;
}

export class TrackedSkill extends Component<TrackedObject> {
    render() {
        const skillId = this.props.id;
        const expPerSecond = this.props.valuePerSecond;
        if (expPerSecond === 0) return null;
        const expPerHour = Math.floor(expPerSecond * 60 * 60);

        let nextLevel = null;
        const currentLevel = Melvor.skillLevel[skillId];
        if (currentLevel < 99) {
            const expToNextLevel = Melvor.exp.level_to_xp(currentLevel + 1);
            const currentExp = Melvor.skillXP[skillId];
            const expNeeded = expToNextLevel - currentExp;
            const timeTillNextLevel = expNeeded / expPerSecond;
            const h = Math.floor(timeTillNextLevel / 60 / 60);
            const m = Math.floor(timeTillNextLevel / 60) % 60;
            const s = Math.floor(timeTillNextLevel) % 60;
            nextLevel = (
                <small>
                    {`${h > 0 ? h + 'h' : ''}
                    ${m > 0 ? m + 'm' : ''}
                    ${h + m > 0 ? '' : s + 's'}
                    till next level`}
                </small>
            );
        }

        const skillName = Melvor.skillName[skillId];
        const skillNameLower = skillName.toLowerCase();
        const media = `assets/media/skills/${skillNameLower}/${skillNameLower}.svg`;

        return (
            <div className="nav-main-item">
                <a className={'nav-main-link ' + styles.statContainer}>
                    <img className="nav-img" src={media} />
                    <div className={styles.statDetails}>
                        <span className="nav-main-link-name">{skillName}</span>
                        <small>{`${Melvor.numberWithCommas(expPerHour)} exp/hr`}</small>
                        {nextLevel}
                    </div>
                </a>
            </div>
        );
    }
}

export class TrackedItem extends Component<TrackedObject> {
    render() {
        const itemId = this.props.id;
        const itemsPerSecond = this.props.valuePerSecond;
        if (itemsPerSecond === 0) return null;
        const itemsPerHour = Math.floor(itemsPerSecond * 60 * 60);

        const itemDef = Melvor.items[itemId];
        const goldPerHour = itemDef.sellsFor * itemsPerHour;

        return (
            <div className="nav-main-item">
                <a className={'nav-main-link ' + styles.statContainer}>
                    <img className="nav-img" src={itemDef.media} />
                    <div className={styles.statDetails}>
                        <span className="nav-main-link-name">{itemDef.name}</span>
                        <small>{`${Melvor.numberWithCommas(itemsPerHour)} items/hr`}</small>
                        <small>{`${Melvor.numberWithCommas(goldPerHour)} gold/hr`}</small>
                    </div>
                </a>
            </div>
        );
    }
}
