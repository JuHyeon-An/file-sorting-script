const fs = require("fs");
const path = require("path");

const folder = process.argv[2];
console.log("start...");

if (!folder) {
  console.log("폴더명을 입력해주세요.");
  return;
}

//전달받은 인자가 있으면 (true) 디렉토리 생성
mkFileDir("video");
mkFileDir("captured");
mkFileDir("duplicated");

const imgPath = path.join(path.dirname(__filename), folder);
const vidPath = path.join(path.dirname(__filename), "video");
const capPath = path.join(path.dirname(__filename), "captured");
const dupPath = path.join(path.dirname(__filename), "duplicated");

console.log(`Processing in ${imgPath}...`);

readFiles(imgPath);

// 파일생성
function mkFileDir(gubun) {
  fs.mkdirSync(gubun, { recursive: true }, (err) => {
    if (err) throw err;
  });
}

function readFiles(imgPath) {
  fs.promises
    .readdir(imgPath) // 현재 경로에 있는 모든 파일 읽어옴
    .then((data) => {
      processFiles(data);
    })
    .catch(console.error);
}

// 해당파일의 종류를 확인하여 처리
function processFiles(data) {
  data.forEach((element) => {
    if (isVideoFile(element)) {
      moveFiles(element, path.join(vidPath, element));
    } else if (isCapturedFile(element)) {
      moveFiles(element, path.join(capPath, element));
    } else if (isDuplicatedFile(element, data)) {
      moveFiles(element, path.join(dupPath, element));
    }
  });

  console.log("jobs all done!");
}

function isCapturedFile(file) {
  const regExp = /(png|aae)$/gm;
  const match = file.match(regExp);
  return !!match;
}

function isVideoFile(file) {
  const regExp = /(mp4|mov)$/gm;
  const match = file.match(regExp);
  return !!match;
}

// 수정하기 전 파일이 있을 경우
// IMG_XXX -> IMG_EXXX
function isDuplicatedFile(file, files) {
  // IMG로 시작하지 않거나, IMG_E로 시작하는 파일은 제외
  if (!file.startsWith("IMG_") || file.startsWith("IMG_E")) {
    return false;
  }

  const edited = `IMG_E${file.split("_")[1]}`;
  const found = files.find((f) => f.includes(edited));

  return !!found;
}

function moveFiles(file, newpath) {
  const oldpath = path.join(imgPath, file);
  const baseFile = path.basename(file);

  fs.promises
    .rename(oldpath, newpath)
    .then(console.log(`move ${baseFile} to ${path.dirname(newpath)}`))
    .catch(console.error);
}
