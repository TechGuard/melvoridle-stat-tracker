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

type ObjectRenderData = {
    type: ObjectType | 'group';
    key: string;
    id: number;
    valuePerSecond: number;
    valuePerHour: number;
    goldPerHour?: number;
    objects?: ObjectRenderData[];
};

const HIDDEN_ITEMS = [
    Melvor.CONSTANTS.item.Mastery_Token_Cooking,
    Melvor.CONSTANTS.item.Mastery_Token_Crafting,
    Melvor.CONSTANTS.item.Mastery_Token_Farming,
    Melvor.CONSTANTS.item.Mastery_Token_Firemaking,
    Melvor.CONSTANTS.item.Mastery_Token_Fishing,
    Melvor.CONSTANTS.item.Mastery_Token_Fletching,
    Melvor.CONSTANTS.item.Mastery_Token_Mining,
    Melvor.CONSTANTS.item.Mastery_Token_Runecrafting,
    Melvor.CONSTANTS.item.Mastery_Token_Smithing,
    Melvor.CONSTANTS.item.Mastery_Token_Thieving,
    Melvor.CONSTANTS.item.Mastery_Token_Woodcutting,
    Melvor.CONSTANTS.item.Mastery_Token_Herblore,
];

const CATEGORIES = [
    {
        name: 'Junk',
        items: [
            Melvor.CONSTANTS.item.Old_Boot,
            Melvor.CONSTANTS.item.Old_Hat,
            Melvor.CONSTANTS.item.Seaweed,
            Melvor.CONSTANTS.item.Rusty_Key,
            Melvor.CONSTANTS.item.Shell,
            Melvor.CONSTANTS.item.Rope,
            Melvor.CONSTANTS.item.Glass_Bottle,
            Melvor.CONSTANTS.item.Rubber_Ducky,
        ],
    },
    {
        name: 'Gems',
        items: [
            Melvor.CONSTANTS.item.Topaz,
            Melvor.CONSTANTS.item.Sapphire,
            Melvor.CONSTANTS.item.Ruby,
            Melvor.CONSTANTS.item.Emerald,
            Melvor.CONSTANTS.item.Diamond,
        ],
    },
];

export class TrackedObjectList extends Component<{ trackedObjects: TrackedObject[] }> {
    render() {
        let trackedObjects: ObjectRenderData[] = [];

        const valueToHour = (value: number) => Math.floor(value * 3600);

        this.props.trackedObjects
            .slice()
            .sort((a, b) => b.lastUpdated - a.lastUpdated)
            .forEach((o) => {
                if (o.type === 'item') {
                    // Do not show hidden items
                    if (HIDDEN_ITEMS.find((id) => id === o.id)) {
                        return;
                    }

                    // Invalid item id given
                    const itemDef = Melvor.items[o.id];
                    if (itemDef === undefined) {
                        return;
                    }

                    // Convert to RenderData
                    const renderData: ObjectRenderData = {
                        type: o.type,
                        key: o.key,
                        id: o.id,
                        valuePerSecond: o.valuePerSecond,
                        valuePerHour: valueToHour(o.valuePerSecond),
                    };
                    renderData.goldPerHour = itemDef.sellsFor * renderData.valuePerHour;

                    // Check if item belongs to a category
                    const categoryId = CATEGORIES.findIndex((c) => c.items.find((id) => id === o.id));
                    if (categoryId === -1) {
                        trackedObjects.push(renderData);
                        return;
                    }

                    // Find or Create group
                    let group = trackedObjects.find((o) => o.type === 'group' && o.id === categoryId);
                    if (group === undefined) {
                        group = {
                            type: 'group',
                            key: `group-${categoryId}`,
                            id: categoryId,
                            valuePerSecond: 0,
                            valuePerHour: 0,
                            goldPerHour: 0,
                            objects: [],
                        };
                        trackedObjects.push(group);
                    }

                    // Add item to group
                    group.valuePerHour += renderData.valuePerHour;
                    if (group.goldPerHour) {
                        group.goldPerHour += renderData.goldPerHour;
                    }
                    if (group.objects) {
                        group.objects.push(renderData);
                    }
                } else if (o.type === 'skill') {
                    // Convert to RenderData
                    trackedObjects.push({
                        type: o.type,
                        key: o.key,
                        id: o.id,
                        valuePerSecond: o.valuePerSecond,
                        valuePerHour: valueToHour(o.valuePerSecond),
                    });
                }
            });

        // Filter out objects with no value.
        trackedObjects = trackedObjects.filter((x) => x.valuePerHour);

        return trackedObjects
            .map((o) => {
                switch (o.type) {
                    case 'skill':
                        return React.createElement(TrackedSkill, o);
                    case 'item':
                        return React.createElement(TrackedItem, o);
                    case 'group':
                        return React.createElement(TrackedGroup, o);
                }
            })
            .concat(this.renderTotalGold(trackedObjects));
    }

    renderTotalGold(trackedObjects: ObjectRenderData[]): any {
        let totalGoldPerHour = 0;
        let numberOfObjects = 0;
        for (const renderData of trackedObjects) {
            if (renderData.goldPerHour) {
                totalGoldPerHour += renderData.goldPerHour;
                numberOfObjects += 1;
            }
        }
        if (!totalGoldPerHour || numberOfObjects < 2) {
            return null;
        }
        return (
            <ObjectDetails
                key="gold"
                name={`${Melvor.convertGP(totalGoldPerHour)} gold/hr`}
                image="assets/media/main/coins.svg"
            />
        );
    }
}

export class TrackedSkill extends Component<ObjectRenderData> {
    render() {
        const skillId = this.props.id;
        const expPerSecond = this.props.valuePerSecond;
        const expPerHour = this.props.valuePerHour;

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
            const hStr = h > 0 ? h + 'h' : '';
            const mStr = m > 0 ? m + 'm' : '';
            const sStr = h + m > 0 ? '' : s + 's';
            nextLevel = <small>{[hStr, mStr, sStr, 'till next level'].join(' ')}</small>;
        }

        const skillName = Melvor.skillName[skillId];
        const skillNameLower = skillName.toLowerCase();
        const media = `assets/media/skills/${skillNameLower}/${skillNameLower}.svg`;

        return (
            <ObjectDetails name={skillName} image={media}>
                <small>{`${Melvor.numberWithCommas(expPerHour)} exp/hr`}</small>
                {nextLevel}
            </ObjectDetails>
        );
    }
}

export class TrackedItem extends Component<ObjectRenderData> {
    render() {
        const itemsPerHour = this.props.valuePerHour;
        const goldPerHour = this.props.goldPerHour || 0;
        const itemDef = Melvor.items[this.props.id];
        return (
            <ObjectDetails name={itemDef.name} image={itemDef.media}>
                <small>{`${Melvor.numberWithCommas(itemsPerHour)} items/hr`}</small>
                <small>{`${Melvor.convertGP(goldPerHour)} gold/hr`}</small>
            </ObjectDetails>
        );
    }
}

export class TrackedGroup extends Component<ObjectRenderData> {
    render() {
        const items = this.props.objects || [];
        const itemsPerHour = items.map((o) => o.valuePerHour).reduce((a, b) => a + b, 0);
        const goldPerHour = items.map((o) => o.goldPerHour || 0).reduce((a, b) => a + b, 0);
        return (
            <ObjectDetails name={CATEGORIES[this.props.id].name} image={Melvor.items[items[0].id].media}>
                <small>{`${Melvor.numberWithCommas(itemsPerHour)} items/hr`}</small>
                <small>{`${Melvor.convertGP(goldPerHour)} gold/hr`}</small>
            </ObjectDetails>
        );
    }
}

interface ObjectDetailsProps {
    name: string;
    image: string;
}
class ObjectDetails extends Component<ObjectDetailsProps> {
    render() {
        return (
            <div className="nav-main-item">
                <a className={'nav-main-link ' + styles.statContainer}>
                    <img className="nav-img" src={this.props.image} />
                    <div className={styles.statDetails}>
                        <span className="nav-main-link-name">{this.props.name}</span>
                        {this.props.children}
                    </div>
                </a>
            </div>
        );
    }
}
