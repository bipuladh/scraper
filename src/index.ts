import { instantiatePage, Platform } from "./common";
import * as fs from "fs";

const AWS_URL = "https://instances.vantage.sh/";
const GCP_URL = "https://gcpinstances.doit-intl.com/";

const parseAWSInstances = async () => {
  const { page, instance } = await instantiatePage(Platform.AWS);
  await page.goto(AWS_URL);
  await page.waitForSelector("tr");
  const rows = await page.$$eval("tr", (rows) => {
    return rows.slice(2).map((row) => {
      const name = row.querySelector("td.apiname")?.firstChild?.nodeValue;
      const instanceStorage = window.parseDisks(
        window.sanitize(
          row.querySelector("td.storage span")?.firstChild?.nodeValue
        )
      );
      const memory = Number(
        window.parseMemory(
          row.querySelector("td.memory span")?.firstChild?.nodeValue
        )
      );
      const cpu = Number(
        window.sanitize(
          window.parseMemory(
            row.querySelector("td.vcpus span")?.firstChild?.nodeValue
          )
        )
      );
      return { name, instanceStorage, memory, cpu };
    });
  });
  fs.writeFileSync("assets/AWS.json", JSON.stringify(rows));
  console.log("Parsed AWS Instances");
  // Close the page
  page.close();
  // Close the browser
  instance.close();
};

const parseGCPInstances = async () => {
  const { page, instance } = await instantiatePage(Platform.AWS);
  await page.goto(GCP_URL);
  await page.waitForSelector("tr");
  const filterDropdownButton = await page.$("div#filter-dropdown a");
  await filterDropdownButton?.click();

  const dropdownItems = await page.$$("div#filter-dropdown li a");
  await dropdownItems[3]?.click();

  const rows = await page.$$eval("tr", (rows) => {
    return rows.slice(2).map((row) => {
      const name = row.querySelectorAll("td")[0]?.firstChild?.nodeValue;
      const cpus = Number(
        window.parseMemory(row.querySelectorAll("td")[1]?.firstChild?.nodeValue)
      );
      const memory = Number(
        window.parseMemory(row.querySelectorAll("td")[2]?.firstChild?.nodeValue)
      );
      const ssd = row.querySelectorAll("td")[3]?.firstChild?.nodeValue;
      return { name, cpus, memory, ssd };
    });
  });
  fs.writeFileSync("assets/GCP.json", JSON.stringify(rows));
  console.log("Parsed GCP Instances");
  await page.close();
  await instance.close();
};

parseAWSInstances();
parseGCPInstances();
