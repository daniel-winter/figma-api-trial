import express from "express";
import fetch from "isomorphic-fetch";
import dotenv from "dotenv-defaults";

dotenv.config();

const app = express();

/**
 *
 * @param {*} fileId
 *
 * Get files/nodes by depth
 * If we increase the depth to 6 or 7 the file is as big, that it is impossible to retrieve any data, because the response it very very big around 36 MB
 * curl -H 'X-FIGMA-TOKEN: figmaToken' 'https://api.figma.com/v1/files/fileId?depth=2'
 *
 * GET nodes by ids
 * curl -H 'X-FIGMA-TOKEN: figmaToken' 'https://api.figma.com/v1/files/fileId/nodes?ids=2:4794,2326:34420'
 *
 * GET About me query
 * curl -H 'X-FIGMA-TOKEN: figmaToken' 'https://api.figma.com/v1/me'
 */

async function figmaFileFetch(fileId) {
  let result = await fetch("https://api.figma.com/v1/files/" + fileId, {
    method: "GET",
    headers: {
      "X-Figma-Token": process.env.FIGMA_TOKEN,
    },
  });

  const figmaFileStruct = await result.json();

  const ids = figmaFileStruct.document.children.map((comp) => comp.id).join(","); // 1

  console.log("ids", ids);

  // replace hard coded ids with const
  // take only two nodes so the response is faster and smaller
  // spacing 10:56741 and colors 10:56803
  const nodeResult = await fetch(
    "https://api.figma.com/v1/files/" + fileId + "/nodes?ids=10:56741,10:56803",
    {
      method: "GET",
      headers: {
        "X-Figma-Token": process.env.FIGMA_TOKEN,
      },
    }
  ).catch((error) => console.log("node images request: ", error));

  return await nodeResult.json();
}

app.use("/", async function (req, res, next) {
  let result = await figmaFileFetch(process.env.FIGMA_FILE_ID).catch((error) =>
    console.log(error)
  );

  const getChildren = Object.values(result.nodes).map((item) => {
    return item.document.children;
  })

  const getNames = Object.values(result.nodes).map((item) => {
    return item.document.name;
  })

  const mappedChildren = getChildren.map((firstChild) => {
    return firstChild[0];
  })

  console.log("getChildren - ", getChildren);
  console.log("getNames - ", getNames);
  console.log("mappedChildren - ", mappedChildren);
  const printNames = getNames.map((name) => {
    console.log("names:", name);
  });

  res.send(JSON.stringify(mappedChildren));
});

app.listen(
  3001,
  console.log("Server is listening on port 3001")
);
