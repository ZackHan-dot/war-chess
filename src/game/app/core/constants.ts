
interface EntityMapItem {
    coverImg: string;
    name: string;
    hp: number;
    atk: number;
    description: string;
}

export const EntityMap: Record<string, EntityMapItem> = {
    '027-hydra.png': {
        coverImg: '027-hydra-x.png',
        name: '九头蛇',
        hp: 300,
        atk: 120,
        description: '拥有多个头颅的怪物，生命力顽强，每回合有概率恢复少量生命值。',
    },
    '021-dragon.png': {
        coverImg: '021-dragon-x.png',
        name: '红龙',
        hp: 350,
        atk: 120,
        description: '火焰之王，喷吐烈焰焚烧敌人，高生命与高攻击的完美结合。',
    },
    '022-dragon-1.png': {
        coverImg: '022-dragon-1-x.png',
        name: '蓝龙',
        hp: 350,
        atk: 70,
        description: '掌控寒冰之力的巨龙，攻击附带冻结效果，行动缓慢但防御极强。',
    },
    '023-demon.png': {
        coverImg: '023-demon-x.png',
        name: '吸血鬼',
        hp: 250,
        atk: 50,
        description: '黑夜的贵族，每次攻击都能吸取敌人生命，擅长持久战。',
    },
    '024-cerberus.png': {
        coverImg: '024-cerberus-x.png',
        name: '三头犬',
        hp: 150,
        atk: 50,
        description: '地狱守门犬，三头齐咬，攻击频率高，适合快速压制对手。',
    },
    '025-werewolf.png': {
        coverImg: '025-werewolf-x.png',
        name: '灰狼人',
        hp: 200,
        atk: 65,
        description: '月夜下的狂战士，攻击力随生命值降低而提升，越战越勇。',
    },
    '026-werewolf-1.png': {
        coverImg: '026-werewolf-1-x.png',
        name: '蓝狼人',
        hp: 200,
        atk: 60,
        description: '来自北境的狼人战士，攻击附带流血效果，持续削弱敌人。',
    },
    '028-ninja.png': {
        coverImg: '028-ninja-x.png',
        name: '忍者',
        hp: 200,
        atk: 60,
        description: '隐匿于暗影之中，有概率闪避攻击，并发动致命背刺。',
    },
    '029-ninja-1.png': {
        coverImg: '029-ninja-1-x.png',
        name: '小刀武士',
        hp: 300,
        atk: 35,
        description: '精通双刀的武士，攻击速度快，但单次伤害较低，适合连击流派。',
    },
    '030-viking.png': {
        coverImg: '030-viking-x.png',
        name: '狂战士',
        hp: 330,
        atk: 45,
        description: '北欧战士，狂暴状态下可免疫控制效果，冲锋陷阵的前排主力。',
    }
};