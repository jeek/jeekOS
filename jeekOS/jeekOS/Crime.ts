import { NS } from "@ns";
import { WholeGame } from "jeekOS/WholeGame";
import { Do } from "jeekOS/Do";

export class Crime {
  Game: WholeGame;
  ns: NS;

  constructor(game: WholeGame) {
    this.Game = game;
    this.ns = this.Game.ns;
  }
  async getMoney(amount: number) {
    if ((await Do(this.ns, "ns.getServerMoneyAvailable", "home"))! < amount) {
      while (await Do(this.ns, "ns.singularity.isBusy")) {
        await this.ns.asleep(1000);
      }
      await Do(
        this.ns,
        "ns.singularity.commitCrime",
        "Mug",
        !(await Do(
          this.ns,
          "ns.singularity.getOwnedAugmentations",
          false
        ))!.includes("Neuroreceptor Management Implant")
      );
      while (
        (await Do(this.ns, "ns.getServerMoneyAvailable", "home"))! < amount
      ) {
        let bestCrime = "Mug";
        for (let crime of Object.values(this.ns.enums.CrimeType)) {
          if (
            ((await Do(this.ns, "ns.singularity.getCrimeChance", crime)) *
              (await Do(this.ns, "ns.singularity.getCrimeStats", crime))
                .money) /
              (await Do(this.ns, "ns.singularity.getCrimeStats", crime)).time >
            ((await Do(this.ns, "ns.singularity.getCrimeChance", bestCrime)) *
              (await Do(this.ns, "ns.singularity.getCrimeStats", bestCrime))
                .money) /
              (await Do(this.ns, "ns.singularity.getCrimeStats", bestCrime))
                .time
          ) {
            bestCrime = crime as string;
          }
        }
        if (
          (await Do(this.ns, "ns.singularity.getCurrentWork"))!.crimeType !=
          bestCrime
        ) {
          await Do(
            this.ns,
            "ns.singularity.commitCrime",
            bestCrime,
            !(await Do(
              this.ns,
              "ns.singularity.getOwnedAugmentations",
              false
            ))!.includes("Neuroreceptor Management Implant")
          );
        }
        await this.ns.asleep(1000);
      }
      Do(this.ns, "ns.singularity.stopAction");
    }
  }
  async lowerKarma(amount: number) {
    if ((await Do(this.ns, "ns.heart.break"))! > amount) {
      while (await Do(this.ns, "ns.singularity.isBusy")) {
        await this.ns.asleep(1000);
      }
      await Do(
        this.ns,
        "ns.singularity.commitCrime",
        "Mug",
        !(await Do(
          this.ns,
          "ns.singularity.getOwnedAugmentations",
          false
        ))!.includes("Neuroreceptor Management Implant")
      );
      while ((await Do(this.ns, "ns.heart.break"))! > amount) {
        let bestCrime = "Mug";
        for (let crime of Object.values(this.ns.enums.CrimeType)) {
          if (
            ((await Do(this.ns, "ns.singularity.getCrimeChance", crime)) *
              (await Do(this.ns, "ns.singularity.getCrimeStats", crime))
                .karma) /
              (await Do(this.ns, "ns.singularity.getCrimeStats", crime)).time >
            ((await Do(this.ns, "ns.singularity.getCrimeChance", bestCrime)) *
              (await Do(this.ns, "ns.singularity.getCrimeStats", bestCrime))
                .karma) /
              (await Do(this.ns, "ns.singularity.getCrimeStats", bestCrime))
                .time
          ) {
            bestCrime = crime as string;
          }
        }
        if (
          (await Do(this.ns, "ns.singularity.getCurrentWork"))!.crimeType !=
          bestCrime
        ) {
          await Do(
            this.ns,
            "ns.singularity.commitCrime",
            bestCrime,
            !(await Do(
              this.ns,
              "ns.singularity.getOwnedAugmentations",
              false
            ))!.includes("Neuroreceptor Management Implant")
          );
          for (
            let i = 0;
            i < (await Do(this.ns, "ns.sleeve.getNumSleeves"));
            i++
          ) {
            await Do(this.ns, "ns.sleeve.setToCommitCrime", i, bestCrime);
          }
        }
        await this.ns.asleep(1000);
      }
      Do(this.ns, "ns.singularity.stopAction");
    }
  }
  async hereIGoKillingAgain(amount: number) {
    if ((await Do(this.Game.ns, "ns.getPlayer"))!.numPeopleKilled < amount) {
      while (await Do(this.ns, "ns.singularity.isBusy")) {
        await this.ns.asleep(1000);
      }
      for (let i = 0; i < (await Do(this.ns, "ns.sleeve.getNumSleeves")); i++) {
        Do(this.ns, "ns.sleeve.setToCommitCrime", i, "Assassination");
      }
      await Do(
        this.ns,
        "ns.singularity.commitCrime",
        "Assassination",
        !(await Do(
          this.ns,
          "ns.singularity.getOwnedAugmentations",
          false
        ))!.includes("Neuroreceptor Management Implant")
      );
      while (
        (await Do(this.Game.ns, "ns.getPlayer"))!.numPeopleKilled < amount
      ) {
        this.ns.toast(
          (await Do(this.Game.ns, "ns.getPlayer"))!.numPeopleKilled
        );
        await this.ns.asleep(1000);
      }
      Do(this.ns, "ns.singularity.stopAction");
    }
  }
}
