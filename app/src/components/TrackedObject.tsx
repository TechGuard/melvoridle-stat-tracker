import React, { Component } from 'react';
import Melvor from '../melvor';
import styles from '../styles.scss';
import { SettingsContext, SettingsState } from './Settings';

export type ObjectType = 'skill' | 'item' | 'coins';

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

type ObjectRenderDataProps = ObjectRenderData & { onReset?: () => void };

const HIDDEN_ITEMS = [
    // Mastery tokens
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
    // Burnt fish
    Melvor.CONSTANTS.item.Burnt_Shrimp,
    Melvor.CONSTANTS.item.Burnt_Sardine,
    Melvor.CONSTANTS.item.Burnt_Herring,
    Melvor.CONSTANTS.item.Burnt_Trout,
    Melvor.CONSTANTS.item.Burnt_Salmon,
    Melvor.CONSTANTS.item.Burnt_Lobster,
    Melvor.CONSTANTS.item.Burnt_Swordfish,
    Melvor.CONSTANTS.item.Burnt_Crab,
    Melvor.CONSTANTS.item.Burnt_Shark,
    Melvor.CONSTANTS.item.Burnt_Cave_Fish,
    Melvor.CONSTANTS.item.Burnt_Manta_Ray,
    Melvor.CONSTANTS.item.Burnt_Whale,
    Melvor.CONSTANTS.item.Burnt_Anglerfish,
    Melvor.CONSTANTS.item.Burnt_Fanfish,
    Melvor.CONSTANTS.item.Burnt_Seahorse,
    Melvor.CONSTANTS.item.Burnt_Carp,
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

export class TrackedObjectList extends Component<{
    trackedObjects: TrackedObject[];
    onResetObject: (type: ObjectType, id: number) => void;
}> {
    static contextType = SettingsContext;

    render() {
        const settings: SettingsState = this.context;
        const valueToHour = (value: number) => Math.floor(value * 3600);

        let trackedObjects: ObjectRenderData[] = [];
        this.props.trackedObjects
            .slice()
            // Sort based on last updated grouped by 2 seconds
            .sort((a, b) => Math.floor(b.lastUpdated / 2000) - Math.floor(a.lastUpdated / 2000))
            .forEach((o) => {
                if (o.type === 'item') {
                    // Do not show hidden items
                    if (!settings.showHiddenItems && HIDDEN_ITEMS.find((id) => id === o.id)) {
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
                    if (!settings.groupCommonItems || categoryId === -1) {
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
                    group.goldPerHour! += renderData.goldPerHour;
                    group.objects!.push(renderData);
                } else if (o.type === 'coins') {
                    // Convert to RenderData
                    trackedObjects.push({
                        type: o.type,
                        key: o.key,
                        id: o.id,
                        valuePerSecond: o.valuePerSecond,
                        valuePerHour: valueToHour(o.valuePerSecond),
                        goldPerHour: valueToHour(o.valuePerSecond),
                    });
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
                        return <TrackedSkill onReset={() => this.props.onResetObject('skill', o.id)} {...o} />;
                    case 'item':
                        return <TrackedItem onReset={() => this.props.onResetObject('item', o.id)} {...o} />;
                    case 'coins':
                        return (
                            <ObjectDetails
                                key={o.key}
                                name={`${Melvor.convertGP(o.valuePerHour)} coins/hr`}
                                image="assets/media/main/coins.svg"
                                onReset={() => this.props.onResetObject('coins', o.id)}
                            />
                        );
                    case 'group':
                        return (
                            <TrackedGroup
                                onReset={() => o.objects?.forEach((obj) => this.props.onResetObject('item', obj.id))}
                                {...o}
                            />
                        );
                }
            })
            .concat(this.renderTotalGold(trackedObjects));
    }

    renderTotalGold(trackedObjects: ObjectRenderData[]): any {
        // Count gold and objects
        let totalGoldPerHour = 0;
        let numberOfObjects = 0;
        for (const renderData of trackedObjects) {
            if (renderData.goldPerHour) {
                totalGoldPerHour += renderData.goldPerHour;
                numberOfObjects += 1;
            }
        }

        // Check settings
        const settings: SettingsState = this.context;
        switch (settings.displayGoldHr) {
            case 'always':
                break;
            case 'never':
                return null;
            default:
                if (!totalGoldPerHour || numberOfObjects < 2) {
                    return null;
                }
        }

        return (
            <ObjectDetails
                key="gold"
                name={`${Melvor.convertGP(totalGoldPerHour)} total gold/hr`}
                image="assets/media/main/coins.svg"
            />
        );
    }
}

export class TrackedSkill extends Component<ObjectRenderDataProps> {
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
            <ObjectDetails name={skillName} image={media} onReset={this.props.onReset}>
                <small>{`${Melvor.numberWithCommas(expPerHour)} exp/hr`}</small>
                {nextLevel}
            </ObjectDetails>
        );
    }
}

export class TrackedItem extends Component<ObjectRenderDataProps> {
    render() {
        const itemsPerHour = this.props.valuePerHour;
        const goldPerHour = this.props.goldPerHour || 0;
        const itemDef = Melvor.items[this.props.id];
        return (
            <ObjectDetails name={itemDef.name} image={itemDef.media} onReset={this.props.onReset}>
                <small>{`${Melvor.numberWithCommas(itemsPerHour)} items/hr`}</small>
                <small>{`${Melvor.convertGP(goldPerHour)} gold/hr`}</small>
            </ObjectDetails>
        );
    }
}

export class TrackedGroup extends Component<ObjectRenderDataProps> {
    render() {
        const items = this.props.objects || [];
        const itemsPerHour = this.props.valuePerHour;
        const goldPerHour = this.props.goldPerHour || 0;
        return (
            <ObjectDetails
                name={CATEGORIES[this.props.id].name}
                image={Melvor.items[items[0].id].media}
                onReset={this.props.onReset}
            >
                <small>{`${Melvor.numberWithCommas(itemsPerHour)} items/hr`}</small>
                <small>{`${Melvor.convertGP(goldPerHour)} gold/hr`}</small>
            </ObjectDetails>
        );
    }
}

class ObjectDetails extends Component<{ name: string; image: string; onReset?: () => void }> {
    render() {
        return (
            <div className="nav-main-item">
                <a className={'nav-main-link ' + styles.statContainer}>
                    <img className="nav-img" src={this.props.image} />
                    <div className={styles.statDetails}>
                        <span className="nav-main-link-name">{this.props.name}</span>
                        {this.props.children}
                    </div>
                    {this.props.onReset && (
                        <i onClick={this.props.onReset} className={'fas fa-undo-alt text-muted ' + styles.statBtn} />
                    )}
                </a>
            </div>
        );
    }
}
