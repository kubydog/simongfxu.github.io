// Generated by CoffeeScript 1.7.1
(function() {
  var Promise, async, concurrency, convert2HTML, fs, generateIndexPage, htmlPath, indexPath, indexTemplate, initHTML, marked, mustache, pageTemplate, parseFile, path, postsPath, renameFile;

  Promise = require('bluebird');

  async = require('async');

  marked = require('marked');

  mustache = require('mustache');

  fs = require('fs');

  path = require('path');

  Promise.promisifyAll(fs);

  postsPath = "" + __dirname + "/../posts";

  htmlPath = "" + __dirname + "/../html";

  indexPath = "" + __dirname + "/../index.html";

  concurrency = 5;

  pageTemplate = fs.readFileSync("" + __dirname + "/template.html", "utf8");

  indexTemplate = fs.readFileSync("" + __dirname + "/index_template.html", "utf8");

  renameFile = function(filename) {
    return path.basename(filename, '.md') + ".html";
  };

  parseFile = function(filename) {
    var pieces;
    pieces = filename.split("-");
    return {
      title: pieces.slice(3).join(' '),
      time: pieces.slice(0, 3).join('-'),
      filename: renameFile(filename)
    };
  };

  initHTML = function(filename, mdOutput) {
    var fileInfo;
    fileInfo = parseFile(filename);
    return mustache.render(pageTemplate, {
      title: fileInfo.title + " @ " + fileInfo.time,
      body: mdOutput,
      stylesheets: ["../themes/darcula/index.css"],
      scripts: []
    });
  };

  convert2HTML = function(filename, next) {
    var filePath;
    console.log("converting " + filename + " ...");
    filePath = postsPath + ("/" + filename);
    return fs.readFileAsync(filePath, 'utf8').then(function(content) {
      var newPath;
      newPath = htmlPath + "/" + renameFile(filename);
      return fs.writeFileAsync(newPath, initHTML(filename, marked(content)));
    }).then(next)["catch"](function(err) {
      console.log("got an error when converting " + filename);
      console.error(err);
      return next();
    });
  };

  generateIndexPage = function(files) {
    return mustache.render(indexTemplate, {
      title: "Simon Xu's Blog",
      items: files.map(parseFile).reverse(),
      stylesheets: ["./themes/darcula/index.css"],
      scripts: []
    });
  };

  fs.readdirAsync(postsPath).then(function(files) {
    console.log("you have wrote " + files.length + " articles via markdown.");
    return new Promise(function(resolve, reject) {
      return async.eachLimit(files, concurrency, convert2HTML, function(err) {
        if (err) {
          return reject(err);
        }
        return resolve(files);
      });
    });
  }).then(function(files) {
    fs.writeFileAsync(indexPath, generateIndexPage(files));
    return console.log("congrats, your blog has been updated.");
  })["catch"](function(err) {
    console.log("oops, some error happened.");
    return console.log(err);
  });

}).call(this);