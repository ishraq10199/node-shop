const fs = require("fs");
const path = require("path");
const deleteFile = (filePath) => {
  if (path.exi)
    fs.unlink(filePath, (err) => {
      if (!fs.existsSync(filePath)) return;
      if (err) throw err;
    });
};

exports.deleteFile = deleteFile;
