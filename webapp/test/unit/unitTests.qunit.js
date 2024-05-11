/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comsofttek/aca20241q/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
