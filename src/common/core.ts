import puppeteer from "puppeteer";

export enum Platform {
  GCP = "GCP",
  AWS = "AWS",
}

export const instantiatePage = async (platform?: Platform) => {
  const instance = await puppeteer.launch({ headless: true });
  const page = await instance.newPage();
  await page.evaluateOnNewDocument(() => {
    window.sanitize = (line: string | null = "") =>
      line ? line?.replace(/\n/g, "")?.replace(/ +/g, "") : line;

    window.parseDisks = (storageSpec: string | null) => {
      if (storageSpec == null || storageSpec?.includes("EBS")) {
        return "EBS";
      }
      const startPos = storageSpec.indexOf("(");
      const endPos = storageSpec.indexOf(")");
      let storage = storageSpec;
      let [space, type]: [any, any] = [0, 0];
      let numDisks = 24;
      if (startPos != -1) {
        storage = storageSpec.substring(startPos + 1, endPos);
        const [number, size] = storage.split("*");
        numDisks = Number(window.sanitize(number));
        [space, type] = size
          ? size?.includes("GB")
            ? size?.split("GB")
            : size?.split("GiB")
          : [0, ""];
      } else {
         numDisks = 1;
        [space, type] = storage.split("GB");
      }
      return [numDisks, Number(space), window.sanitize(type)];
    };
    window.parseMemory = (line: string | null = "") =>
      line ? line?.replace(/[A-Z,a-z]*/g, "") : line;
  });

  return { page, instance };
};
