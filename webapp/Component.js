sap.ui.define([
    "sap/ui/core/UIComponent",
    "com/softtek/aca20241q/model/models"
],
    function (UIComponent) {
        "use strict";

        return UIComponent.extend("com.softtek.aca20241q.Component", {
            metadata: {
                manifest: "json"
            },

            init: function () {
                UIComponent.prototype.init.apply(this, arguments);
                this.getRouter().initialize();
            }
        });
    }
);