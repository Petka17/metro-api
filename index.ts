import getHHMetro from "./getHHMetro";
import getMosData from "./getMosData";

const main = async (): Promise<void> => {
  const [hhMetro, mosData] = await Promise.all([getHHMetro(), getMosData()]);

  hhMetro.metro_lines.forEach(line => {
    console.log(line.line);
  });
  console.log();
  mosData.forEach(line => {
    console.log(line.line);
  });
};

main();
