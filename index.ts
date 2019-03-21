import { promises as fs } from "fs";
import getHHMetro from "./getHHMetro";
import getMosData from "./getMosData";

const main = async (): Promise<void> => {
  const [hhMetro, mosData] = await Promise.all([getHHMetro(), getMosData()]);

  let content = "";
  hhMetro.metro_lines.forEach(line => {
    line.stations.forEach(station => {
      content += `${line.line};${station.station}\n`;
    });
  });
  await fs.writeFile("hh_metro.csv", content);

  content = "";
  mosData.forEach(line => {
    line.stations.forEach(station => {
      content += `${line.line};${station.station}\n`;
    });
  });
  await fs.writeFile("mos_data.csv", content);
};

main();
