import { NS } from "@ns";
import { WholeGame } from "jeekOS/WholeGame";
import { Do } from "jeekOS/Do";

export class CollegeGym {
  Game: WholeGame;
  ns: NS;

  constructor(Game: WholeGame) {
    this.Game = Game;
    this.ns = Game.ns;
  }
  async raiseHacking(level: number) {
    if ((await Do(this.ns, "ns.getPlayer")).skills["hacking"] < level) {
      await this.Game.traveling.assertLocation("Volhaven");
      while ((await Do(this.ns, "ns.getPlayer")).skills["hacking"] < level) {
        await Do(
          this.ns,
          "ns.singularity.universityCourse",
          "ZB Institute of Technology",
          "Algorithms",
          !(await Do(
            this.ns,
            "ns.singularity.getOwnedAugmentations",
            false
          ))!.includes("Neuroreceptor Management Implant")
        );
        await this.ns.asleep(1000);
      }
      Do(this.ns, "ns.singularity.stopAction");
    }
  }
  async raiseCharisma(level: number) {
    if ((await Do(this.ns, "ns.getPlayer")).skills["charisma"] < level) {
      await this.Game.traveling.assertLocation("Volhaven");
      while ((await Do(this.ns, "ns.getPlayer")).skills["charisma"] < level) {
        await Do(
          this.ns,
          "ns.singularity.universityCourse",
          "ZB Institute of Technology",
          "Leadership",
          !(await Do(
            this.ns,
            "ns.singularity.getOwnedAugmentations",
            false
          ))!.includes("Neuroreceptor Management Implant")
        );
        await this.ns.asleep(1000);
      }
      Do(this.ns, "ns.singularity.stopAction");
    }
  }
  async raiseStrength(level: number) {
    if ((await Do(this.ns, "ns.getPlayer")).skills["strength"] < level) {
      await this.Game.traveling.assertLocation("Sector-12");
      while ((await Do(this.ns, "ns.getPlayer")).skills["strength"] < level) {
        await Do(
          this.ns,
          "ns.singularity.gymWorkout",
          "Powerhouse Gym",
          "Strength",
          !(await Do(
            this.ns,
            "ns.singularity.getOwnedAugmentations",
            false
          ))!.includes("Neuroreceptor Management Implant")
        );
        await this.ns.asleep(1000);
      }
      Do(this.ns, "ns.singularity.stopAction");
    }
  }
  async raiseDefense(level: number) {
    if ((await Do(this.ns, "ns.getPlayer")).skills["defense"] < level) {
      await this.Game.traveling.assertLocation("Sector-12");
      while ((await Do(this.ns, "ns.getPlayer")).skills["defense"] < level) {
        await Do(
          this.ns,
          "ns.singularity.gymWorkout",
          "Powerhouse Gym",
          "Defense",
          !(await Do(
            this.ns,
            "ns.singularity.getOwnedAugmentations",
            false
          ))!.includes("Neuroreceptor Management Implant")
        );
        await this.ns.asleep(1000);
      }
      Do(this.ns, "ns.singularity.stopAction");
    }
  }
  async raiseDexterity(level: number) {
    if ((await Do(this.ns, "ns.getPlayer")).skills["dexterity"] < level) {
      await this.Game.traveling.assertLocation("Sector-12");
      while ((await Do(this.ns, "ns.getPlayer")).skills["dexterity"] < level) {
        await Do(
          this.ns,
          "ns.singularity.gymWorkout",
          "Powerhouse Gym",
          "Dexterity",
          !(await Do(
            this.ns,
            "ns.singularity.getOwnedAugmentations",
            false
          ))!.includes("Neuroreceptor Management Implant")
        );
        await this.ns.asleep(1000);
      }
      Do(this.ns, "ns.singularity.stopAction");
    }
  }
  async raiseAgility(level: number) {
    if ((await Do(this.ns, "ns.getPlayer")).skills["agility"] < level) {
      await this.Game.traveling.assertLocation("Sector-12");
      while ((await Do(this.ns, "ns.getPlayer")).skills["agility"] < level) {
        await Do(
          this.ns,
          "ns.singularity.gymWorkout",
          "Powerhouse Gym",
          "Agility",
          !(await Do(
            this.ns,
            "ns.singularity.getOwnedAugmentations",
            false
          ))!.includes("Neuroreceptor Management Implant")
        );
        await this.ns.asleep(1000);
      }
      Do(this.ns, "ns.singularity.stopAction");
    }
  }
}
