sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
],
function (Controller, MessageToast) {
    "use strict";
    var that;

    return Controller.extend("com.softtek.aca20241q.controller.FacturaItem", {
        total: 0,
        mesa: "",
        mozo: "",
        idMetodoPago: "",

        onInit: function() {
           that = this;
           
           var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
           oRouter.getRoute("FacturaItem").attachMatched(this._onRouteMatched, this);
       
           this.getItemsByCategoria();
           this.getMetodosPago();

           var oModel = new sap.ui.model.json.JSONModel({
                total: 0
            });
            this.getView().setModel(oModel, "viewModel");

            var oBtnToggleVbox1 = this.getView().byId("btnToggleVbox1");
            oBtnToggleVbox1.setSrc("sap-icon://sys-back");
        },

        getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },

        _onRouteMatched: function (oEvent) {
            var oArguments = oEvent.getParameter("arguments");
            var mesa = oArguments.mesa;
            var mozo = oArguments.mozo;

            this.mesa = mesa;
            this.mozo = mozo;
        
            this.getView().byId("txtMesa").setText(mesa);
            this.getView().byId("txtMozo").setText(mozo);
        },

        getItem: function (idItem, callback) {
            var oDataModel = this.getOwnerComponent().getModel();
            oDataModel.read("/ItemSet('" + idItem + "')", {
                async: false,
                success: function (oResponse) {
                    callback(oResponse);
                },
                error: function (oError) {
                    MessageToast.show("Error al leer datos")
                }
            });
        },
        
        getItemsByCategoria: function () {
            var oModel = this.getOwnerComponent().getModel();
            var oNavList = this.getView().byId("navList");
        
            oModel.read("/CategoriaSet", {
                success: function(oResponse) {
                    oResponse.results.forEach(function(oCategoria) {
                        var oNavItem = new sap.tnt.NavigationListItem({
                            text: oCategoria.Nombre
                        });
        
                        var sCategoriaPath = "/CategoriaSet('" + oCategoria.IdCategoria + "')/ToItemSet";
        
                        oModel.read(sCategoriaPath, {
                            success: function(oItemResponse) {
                                oItemResponse.results.forEach(function(oItem) {
                                    var oSubItem = new sap.tnt.NavigationListItem({
                                        text: oItem.Nombre,
                                        customData: [new sap.ui.core.CustomData({
                                            key: "itemData",
                                            value: oItem
                                        }), new sap.ui.core.CustomData({
                                            key: "IdItem",
                                            value: oItem.IdItem
                                        })]
                                    });                                  
        
                                    oNavItem.addItem(oSubItem);
                                });
                            }
                        });
                        oNavList.addItem(oNavItem);
                    });
                }.bind(this),
                error: function(oError) {
                    // Manejar el error de lectura de datos
                }
            });
        },        

        getMetodosPago: function () {
            var oDataModel = this.getOwnerComponent().getModel();
            var that = this;
            
            oDataModel.read("/MetodoPagoSet", {
                success: function (oResponse) {
                    var oComboBoxData = [];
                    oResponse.results.forEach(function (oMetodoPago) {
                        oComboBoxData.push({
                            key: oMetodoPago.IdMetodoPago,
                            text: oMetodoPago.Nombre
                        });
                    });
        
                    var oComboBoxModel = new sap.ui.model.json.JSONModel(oComboBoxData);
                    that.getView().setModel(oComboBoxModel, "comboBox");

                    var oTableModel = new sap.ui.model.json.JSONModel(oResponse.results);
                    that.getView().setModel(oTableModel, "metodosPago");
                },
                error: function (oError) {
                    MessageToast.show("Error al leer datos");
                }
            });
        },        

        onMetodoPagoChange: function(oEvent) {
            var selectedItem = oEvent.getParameter("selectedItem");
            var idMetodoPago = selectedItem.getKey();
            this.idMetodoPago = idMetodoPago;
        },        

        onSelectionItem: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("item");
            var sIdItem = oSelectedItem.data("IdItem");
        
            this.getItem(sIdItem, function(sItem) {
        
                var oTable = this.getView().byId("tblItems");
                var oInputCantidad = new sap.m.StepInput({ value: "1" });

                var that = this; 
                oInputCantidad.attachChange(function (oChangeEvent) {
                    var sNewValue = oChangeEvent.getParameter("value");
                    var nCantidad = parseFloat(sNewValue);
                    if (!isNaN(nCantidad)) {
                        var nNuevoPrecioTotal = sItem.Precio * nCantidad;
                        oTextPrecio.setText(nNuevoPrecioTotal);
                        that.recalcularTotal();
                    }
                });
        
                var oTextPrecio = new sap.m.Text({ text: sItem.Precio });

                var oButtonEliminar = new sap.m.Button({
                    icon: "sap-icon://sys-minus",
                    type: sap.m.ButtonType.Transparent,
                    press: this.onEliminarItemPress.bind(this)
                });

                var oImagen = new sap.m.Image({
                    src: sItem.Imagen,
                    width: "50px"
                });

                var oNewRow = new sap.m.ColumnListItem({
                    cells: [
                        oImagen,
                        new sap.m.Text({ text: sItem.Nombre }),
                        oInputCantidad,
                        oTextPrecio,
                        oButtonEliminar
                    ],
                    customData: new sap.ui.core.CustomData({
                        key: "IdItem",
                        value: sItem.IdItem
                    })
                });
        
                oTable.addItem(oNewRow);

                this.recalcularTotal();
            }.bind(this));
        },
        
        onEliminarItemPress: function(oEvent) {
            var oButton = oEvent.getSource();
            var oRow = oButton.getParent();
            var oTable = oRow.getParent();
            oTable.removeItem(oRow);
        
            this.recalcularTotal();
        },
        
        recalcularTotal: function () {
            var oTable = this.getView().byId("tblItems");
            var aItems = oTable.getItems();
            var nTotal = 0;
        
            aItems.forEach(function (oItem) {
                var sPrecio = oItem.getCells()[3].getText();
                nTotal += parseFloat(sPrecio);
            });
        
            this.total = nTotal;

            var oModel = this.getView().getModel("viewModel");
            oModel.setProperty("/total", nTotal.toFixed(2));
            console.log(nTotal)
        },

        onContinuarPress: function () {
            this.recalcularTotal();
            this.onGenerarFactura();
            this.getRouter().navTo("RouteMain");
        },

        onGenerarFactura: async function () {
            var currentDate = new Date();

            var year = currentDate.getFullYear();
            var month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
            var day = ('0' + currentDate.getDate()).slice(-2);
            var hours = ('0' + currentDate.getHours()).slice(-2);
            var minutes = ('0' + currentDate.getMinutes()).slice(-2);
            var seconds = ('0' + currentDate.getSeconds()).slice(-2);
            var formattedDateTime = year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds;

            var currentHour = currentDate.getHours();
            var currentMinutes = currentDate.getMinutes();
            var currentSeconds = currentDate.getSeconds();
            var formattedHour = "PT" + currentHour + "H" + currentMinutes + "M" + currentSeconds + "S";
            console.log(formattedHour)
            
            var oEntry = {
                Mesa: this.mesa,
                Mozo: this.mozo,
                Fecha: formattedDateTime,
                Hora: formattedHour,
                IdMetodoPago: this.idMetodoPago,
                Total: this.total.toFixed(2),
                Observaciones: ""
            };
            console.log(oEntry)
            
            var that = this;
            var oDataModel = that.getView().getModel();
            try {
                var oResponse = await new Promise(function (resolve, reject) {
                    oDataModel.create("/FacturaSet", oEntry, {
                        success: function (oResponse) {
                            resolve(oResponse);
                        },
                        error: function (oError) {
                            reject(oError);
                        }
                    });
                });
        
                await that.crearFacturaItems(oResponse);
                sap.m.MessageBox.success("Se generó una nueva factura");
            } catch (error) {
                console.log(error)
                sap.m.MessageBox.error("Se generó un error al intentar crear la factura");
            }
        },

        crearFacturaItems: async function (oResponse) {
            var facturaId = oResponse.IdFactura;
            var oTable = this.getView().byId("tblItems");
            var aItems = oTable.getItems();
            var oDataModel = this.getView().getModel();
        
            for (var i = 0; i < aItems.length; i++) {
                var oItem = aItems[i];
                var aCells = oItem.getCells();
                var sIdItem = oItem.getCustomData()[0].getValue();

                var cantidad = parseInt(aCells[2].getValue(), 10);
                var cantidadString = cantidad.toString();
        
                var facturaItem = {
                    IdFactura: facturaId,
                    IdItem: sIdItem,
                    Cantidad: cantidadString
                };

                console.log(facturaItem)
        
                try {
                    await new Promise(function (resolve, reject) {
                        oDataModel.create("/FacturaItemSet", facturaItem, {
                            success: function () {
                                console.log(facturaItem)
                                console.log("FacturaItem creado con éxito");
                                resolve();
                            },
                            error: function (oError) {
                                console.error("Error al crear FacturaItem:", oError);
                                reject(oError);
                            }
                        });
                    });
                } catch (error) {
                    console.error("Error al crear FacturaItem:", error);
                }
            }
        },

        onCollapseExpandPress: function () {
			var oNavigationList = this.byId("navList");
			var bExpanded = oNavigationList.getExpanded();

			oNavigationList.setExpanded(!bExpanded);
		},

        handleOpen: function () {
			var oDialog = this.getView().byId("helloDialog");
			oDialog.open();
		},

		handleClose: function () {
			var oDialog = this.getView().byId("helloDialog");
			oDialog.close();
		},

        onPressEditar: function(oEvent) {
            var oListItem = oEvent.getSource().getParent();
            var sIdMetodoPago = oListItem.getBindingContext("metodosPago").getProperty("IdMetodoPago");
            console.log(sIdMetodoPago)

            var sNuevoNombre = this.getView().byId("inpMetodoPago").getValue();
            if (!sNuevoNombre) {
                sap.m.MessageToast.show("Ingrese un nuevo nombre para el método de pago.");
                return;
            }
        
            var oDatosActualizados = {
                Nombre: sNuevoNombre
            };
            var oModel = this.getView().getModel();
            var sPath = "/MetodoPagoSet('" + sIdMetodoPago + "')";
        
            oModel.update(sPath, oDatosActualizados, {
                success: function(oResponse) {
                    sap.m.MessageToast.show("Método de pago actualizado con éxito.");
                    this.getMetodosPago();
                }.bind(this),
                error: function(oError) {
                    sap.m.MessageToast.show("Error al actualizar el método de pago.");
                }
            });
            this.getView().byId("inpMetodoPago").setValue("");
        },        

        handleAgregarMetodoPago: function() {
            var sNombreMetodoPago = this.getView().byId("inpMetodoPago").getValue();
            if (!sNombreMetodoPago) {
                sap.m.MessageToast.show("Ingrese un nombre para el método de pago.");
                return;
            }
        
            var oNuevoMetodoPago = {
                Nombre: sNombreMetodoPago
            };
            var oModel = this.getView().getModel();
        
            oModel.create("/MetodoPagoSet", oNuevoMetodoPago, {
                success: function(oResponse) {
                    sap.m.MessageToast.show("Método de pago agregado con éxito.");
                    that.getMetodosPago();
                },
                error: function(oError) {
                    sap.m.MessageToast.show("Error al agregar el método de pago.");
                }
            });
            this.getView().byId("inpMetodoPago").setValue("");
        },

        onToggleVbox1Press: function() {
            var oVbox1 = this.getView().byId("vbox1");
            oVbox1.setVisible(!oVbox1.getVisible());

            var oBtnToggleVbox1 = this.getView().byId("btnToggleVbox1");
            if (oVbox1.getVisible()) {
                oBtnToggleVbox1.setSrc("sap-icon://initiative");
            } else {
                oBtnToggleVbox1.setSrc("sap-icon://sys-back");
            }
        },        
    });
});