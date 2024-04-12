import { NS } from "@ns";
import { WholeGame } from "jeekOS/WholeGame";

const WEATHER_API_URL: string =
  "https://api.open-meteo.com/v1/forecast?latitude=34.0754&longitude=-84.2941&current=temperature_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,temperature_80m&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch";

export class Weather {
  ns: NS;
  Game: WholeGame;
  log: any;
  display: any;
  constructor(
    Game: WholeGame,
    latitude: string = "",
    longitude: string = "",
    tz: string = ""
  ) {
    this.Game = Game;
    this.ns = Game.ns;
    this.initialize();
  }
  async initialize() {
    let done = false;
    while (!done) {
      try {
        this.log = this.Game.doc
          .querySelector(".sb")!
          .querySelector(".weatherbox");
        done = true;
      } catch {
        await this.ns.asleep(1000);
      }
    }
    this.log ??= this.Game.createSidebarItem("Weather", "", "W", "weatherbox");
    this.display = this.Game.sidebar
      .querySelector(".weatherbox")!
      .querySelector(".display");
    this.display.removeAttribute("hidden");
    while (true) {
      await this.ns.wget(WEATHER_API_URL, "/temp/weather.txt");
      let weatherData = JSON.parse(this.ns.read("/temp/weather.txt"));
      let icon =
        weatherData["current"]["snowfall"] > 0
          ? "⛄"
          : weatherData["current"]["rain"] > 0
          ? "☔"
          : weatherData["current"]["cloud_cover"] > 0
          ? "⛅"
          : weatherData["current"]["is_day"]
          ? "🌞"
          : "🌙";
      let top =
        "<TABLE WIDTH=100%><TR><TD ROWSPAN=2 ALIGN=CENTER VALIGN=CENTER>" +
        icon +
        "</TD><TD ALIGN=RIGHT>Temp:</TD><TD ALIGN=RIGHT>" +
        weatherData["current"]["temperature_2m"].toString() +
        weatherData["current_units"]["temperature_2m"] +
        "</TD></TR><TR><TD ALIGN=RIGHT>AppTemp:</TD><TD ALIGN=RIGHT>" +
        weatherData["current"]["apparent_temperature"].toString() +
        weatherData["current_units"]["apparent_temperature"] +
        "</TD></TR></TABLE>";
      let data: any[][] = [];
      while (data.length < 24) {
        let empty: any[] = [];
        data.push([]);
        while (data[data.length - 1].length < 7) {
          data[data.length - 1].push("");
        }
      }
      for (let i = 0; i < weatherData["hourly"]["time"].length; i++) {
        data[i % 24][Math.floor(i / 24)] =
          (weatherData["hourly"]["snowfall"][i] > 0
            ? "⛄"
            : weatherData["hourly"]["rain"][i] > 0
            ? "☔"
            : weatherData["hourly"]["cloud_cover"][i] > 0
            ? "⛅"
            : "🌞") +
          "<BR>" +
          weatherData["hourly"]["temperature_2m"][i].toString() +
          "/" +
          weatherData["hourly"]["apparent_temperature"][i].toString();
      }
      top += "<TABLE BORDER=1 CELLPADDING=0 CELLSPACING=0 WIDTH=100%>";
      top += "<TR><TD></TD>";
      for (let j = 0; j < 7; j++) {
        top +=
          "<TD ALIGN=CENTER>" +
          weatherData["hourly"]["time"][j * 24].slice(5, 10) +
          "</TD>";
      }
      top += "</TR>";
      for (let i = 0; i < 24; i++) {
        top +=
          "<TR><TD>" + weatherData["hourly"]["time"][i].slice(11) + "</TD>";
        for (let j = 0; j < 7; j++) {
          top += "<TD ALIGN=CENTER>" + data[i][j] + "</TD>";
        }
        top += "</TR>";
      }
      this.display.innerHTML = top;
      this.log.recalcHeight();
      await this.ns.asleep(3600000);
    }
  }
}
