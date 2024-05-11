sap.ui.define([
  "./BaseController",
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast"
],

  function (BaseController) {
    "use strict";

    return BaseController.extend("com.softtek.aca20241q.controller.Item", {

      onInit: function () {
        var oRouter = this.getRouter();
        oRouter.getRoute("Item").attachMatched(this._onRouteMatched, this);
      },

      _onRouteMatched: function (oEvent) {
        var oArgs, oView;

        oArgs = oEvent.getParameter("arguments");
        oView = this.getView();

        oView.bindElement({
          path: `/ItemSet('${oArgs.idItem}')`,
          events: {
            change: this._onBindingChange.bind(this),
            dataRequested: function (oEvent) {
              oView.setBusy(true);
            },
            dataReceived: function (oEvent) {
              oView.setBusy(false);
            }
          }
        });
      },

      _onBindingChange: function (oEvent) {

      },

      onPressEditar: function () {

      },

      onPressEliminar: function (oEvent) {
        let sPath = oEvent.getSource().getBindingContext().getPath();
        var oDataModel = this.getOwnerComponent().getModel();
        oDataModel.remove(`${sPath}`, {
            success: function (oResponse) {
                sap.m.MessageBox.success("El item fue eliminado con éxito");
            },
            error: function (oError) {
                sap.m.MessageBox.error("Error al eliminar el item");
            }
        });
    },

    });
  }
);
