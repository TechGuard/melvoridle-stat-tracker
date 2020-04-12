interface MelvorItem {
    id: number;
    category: string;
    type: string;
    name: string;
    sellsFor: number;
    media: string;
}

interface MelvorBindings {
    exp: {
        level_to_xp: (level: number) => number;
    };
    numberWithCommas: (number: number) => string;

    skillLevel: { [skillId: number]: number };
    skillName: { [skillId: number]: string };
    skillXP: { [skillId: number]: number };

    items: { [itemId: number]: MelvorItem };
}

const Melvor: MelvorBindings = window as any;

// Fix for items
declare var items: any;
Melvor.items = items;

export default Melvor;
