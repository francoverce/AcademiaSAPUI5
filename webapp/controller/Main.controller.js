sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageToast) {
        "use strict";

        return Controller.extend("com.softtek.aca20241q.controller.Main", {

            onInit: function () {
                
            },     

            getRouter: function () {
                return sap.ui.core.UIComponent.getRouterFor(this)
            },

            onNavToItemList: function () { this.getRouter().navTo("ItemList"); },
            onNavToEtiquetas: function () { MessageToast.show("En construccion...") },
            onNavToCategorias: function () { MessageToast.show("En construccion...") },
            onNavToFacturas: function () { this.getRouter().navTo("FacturaList"); },
            onNavToMetodosPago: function () { MessageToast.show("En construccion...") },

            onContinuarPress: function () {
                var mesa = this.getView().byId("inpMesa").getValue();
                var mozo = this.getView().byId("inpMozo").getValue();
            
                var router = this.getRouter();
                try {
                    router.navTo("FacturaItem", {
                        mesa: mesa,
                        mozo: mozo
                    });
                } catch(error) {
                    sap.m.MessageBox.error("Ingrese Mesa y Mozo");
                }

            }            
        });
    });
