var gulp = require('gulp');
var spsave = require('spsave').spsave;
var watch = require('gulp-watch');
var creds = require('./creds.js');
var coreOptions = require('./coreOptions.js');

var paths = {
	styleLibrary: ["./src/Style Library/**/*"]
};

var fileOptions = {
	styleLibrary: {
		folder: "Style Library", //folder inside SharePoint
		glob: paths.styleLibrary, //local folder
		base: "Style Library" //this remove the 'StyleLibrary' from the url
	}
};

var copyToSharePoint = function (fileOptions) {
	return spsave(coreOptions, creds, fileOptions);
};

gulp.task("default", ["watch"]);

gulp.task("deploy", ["stylelibrary"]);

gulp.task("stylelibrary", function () {
	return copyToSharePoint(fileOptions.styleLibrary);
});

gulp.task("watch", function () {

	watch(paths.styleLibrary).on("change", function (file) {
		var changedFileOptions = fileOptions.styleLibrary;
		changedFileOptions.glob = file;
		copyToSharePoint(changedFileOptions);
	});

});