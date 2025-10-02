import { Container } from "pixi.js";
import gsap from "gsap";
import { clamp } from "@/game/engine/utils/maths";
import { Label } from "../ui/Label";
import { EntityMap } from "./constants";

export type EntityType = "character" | "building" | "chest";

export class Entity {
  type: EntityType;
  sp: Container;
  name: string;
  hp: number;
  cost: number = 1;
  maxHp: number = 1000;
  atk: number;

  constructor(type: EntityType, name: string, sp: Container) {
    this.name = name;
    this.type = type;
    this.sp = sp;
    this.maxHp = EntityMap[name]?.hp || 100;
    this.hp = EntityMap[name]?.hp || 100;
    this.atk = EntityMap[name]?.atk || 25;
  }

  attack(amount: number) {
    
  }

  heal() {}

  async takeDamage(amount: number) {
    // 1. 扣血，不能低于 0
    this.hp = clamp(this.hp - amount, 0, this.maxHp);
    console.log('hp', this.hp);

    // 2. 创建伤害数字文本
    const amountText = new Label({
      text: `-${amount}`,
      style: {
        fill: 0xec1561,
        fontSize: 25,
        fontWeight: 'bold',
        fontFamily: 'Microsoft YaHei'
      },
    });
    amountText.anchor.set(0.5); // 居中对齐
    amountText.position.set(this.sp.width / 2, this.sp.height / 2); // 初始位置在角色中心附近
    this.sp.addChild(amountText);

    // 3. 数字向上飘 + 淡出动画（GSAP）
    gsap.to(amountText, {
      y: amountText.y - 50,   // 向上移动 50px
      alpha: 0,               // 逐渐消失
      duration: 1.2,
      ease: 'power1.out',
      onComplete: () => {
        this.sp.removeChild(amountText);
        amountText.destroy(); // 释放资源
      }
    });

    // 4. 精灵闪红效果（tint 变红，0.2 秒后恢复）
    this.sp.tint = 0xff0000; // 立即变红

    gsap.delayedCall(0.15, () => {
      // 0.15 秒后恢复原色
      gsap.to(this.sp, {
        tint: 0xffffff, // 白色（原始色调）
        duration: 0.1
      });
    });
  }

  die() {
    
  }
}
