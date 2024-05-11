sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/format/DateFormat"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageToast, DateFormat) {
        "use strict";
        var that;

        return Controller.extend("com.softtek.aca20241q.controller.FacturaList", {
            idMetodoPago: "",

            onInit: function() {
                this.getFacturas();
                this.getMetodosPago();
                that = this;
            },            

            getRouter: function () {
                return sap.ui.core.UIComponent.getRouterFor(this)
            },

            getFacturas: function () {
                var oDataModel = this.getOwnerComponent().getModel();
                var oViewModel = new sap.ui.model.json.JSONModel();
                var that = this;
                var oFilter = [];
            
                if (this.idMetodoPago) {
                    oFilter.push(new sap.ui.model.Filter("IdMetodoPago", sap.ui.model.FilterOperator.EQ, this.idMetodoPago));
                }
            
                oDataModel.read("/FacturaSet", {
                    async: false,
                    filters: oFilter,
                    success: function (oResponse) {
                        oResponse.results.forEach(function(factura, index) {
                            factura.Fecha = that.formatFecha(factura.Fecha);
                            factura.Hora = that.formatHora(factura.Hora);
            
                            if (factura.IdMetodoPago != 0) {
                                that.getMetodoPago(factura.IdMetodoPago, index);
                            }
                        });
            
                        oViewModel.setData(oResponse.results);
                    },
                    error: function (oError) {
                        MessageToast.show("Error al leer datos")
                    }
                });
                this.getView().setModel(oViewModel, "facturas");
            },            

            formatFecha: function(fecha) {
                var oDateFormat = DateFormat.getDateInstance({
                    pattern: "dd/MM/yyyy"
                });
                return oDateFormat.format(fecha);
            },

            formatHora: function(edmTime) {
                var ms = edmTime.ms;

                var horas = Math.floor(ms / 3600000);
                var minutos = Math.floor((ms % 3600000) / 60000);
                var segundos = Math.floor(((ms % 3600000) % 60000) / 1000);

                var horaFormateada = horas.toString().padStart(2, '0') + ':' +
                                     minutos.toString().padStart(2, '0') + ':' +
                                     segundos.toString().padStart(2, '0');
                return horaFormateada;
            },

            onSelectionItem: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("listItem");
                var oBindingContext = oSelectedItem.getBindingContext("facturas");
                var sIdFactura = oBindingContext.getProperty("IdFactura");
                this.getFacturaItemByFactura(sIdFactura);

                if (!this.oCreateFragment) {
                    this.oCreateFragment =
                        sap.ui.core.Fragment.load({
                            name: "com.softtek.aca20241q.view.fragments.ListItemFactura",
                            controller: that
                        }).then(function (oDialog) {
                            that.getView().addDependent(oDialog);
                            let oModel = new sap.ui.model.json.JSONModel({
                                "IdFactura": "",
                                "IdItem": "",
                                "Cantidad": ""
                            })
                            oModel.setDefaultBindingMode("TwoWay");
                            oDialog.setModel(oModel, "ListItemFactura");
                            oDialog.attachAfterClose(that._afterCloseDialog);
                            return oDialog;
                        }.bind(that));
                }
                that.oCreateFragment.then(function (oDialog) {
                    oDialog.open();
                }.bind(that));
            },

            onDialogClose: function () {
                if (this.oCreateFragment) {
                    this.oCreateFragment.then(function (oDialog) {
                        oDialog.close();
                    });
                }
            },
            
            getMetodoPago: function (idMetodoPago, index) {
                var oModel = this.getOwnerComponent().getModel();       
                oModel.read("/MetodoPagoSet('" + idMetodoPago + "')", {
                    success: function(oResponse) {
                        var facturasModel = this.getView().getModel("facturas");
                        var facturasData = facturasModel.getData();
                        facturasData[index].NombreMetodoPago = oResponse.Nombre;
                        facturasModel.setData(facturasData);
                    }.bind(this),
                    error: function (oError) {
                        MessageToast.show("Error al obtener el método de pago")
                    }
                });
            },

            //NavigationProperty
            getFacturaItemByFactura: function (sIdFactura) {
                var oDataModel = this.getOwnerComponent().getModel();
                var oViewModel = new sap.ui.model.json.JSONModel();
                var that = this;

                oDataModel.read("/FacturaSet('" + sIdFactura + "')/ToFacturaItemSet", {
                    success: function(oFacturaItemResponse) {
                        
                        oFacturaItemResponse.results.forEach(function(facturaItem, index) {
                            that.getItem(facturaItem.IdItem, index); 
                        });

                        oViewModel.setData(oFacturaItemResponse.results);
                    },
                    error: function (oError) {
                        MessageToast.show("Error al leer datos de FacturaItemSet");
                    }
                });
                this.getView().setModel(oViewModel, "facturaitems");
            },  
            
            getItem: function (idItem, index) {
                var oModel = this.getOwnerComponent().getModel(); 

                oModel.read("/ItemSet('" + idItem + "')", {
                    success: function(oResponse) {

                        var facturaItemsModel = this.getView().getModel("facturaitems");
                        var facturaItemsData = facturaItemsModel.getData();

                        facturaItemsData[index].NombreItem = oResponse.Nombre;
                        facturaItemsData[index].PrecioItem = oResponse.Precio;

                        facturaItemsModel.setData(facturaItemsData);

                    }.bind(this),

                    error: function (oError) {
                        MessageToast.show("Error al obtener el método de pago")
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
                    },
                    error: function (oError) {
                        MessageToast.show("Error al leer datos");
                    }
                });
            },

            onMetodoPagoChange: function(oEvent) {
                var selectedItem = oEvent.getParameter("selectedItem");

                if (selectedItem) {
                    var idMetodoPago = selectedItem.getKey();
                    this.idMetodoPago = idMetodoPago;
                } else {
                    this.idMetodoPago = "";
                }
                console.log(this.idMetodoPago)
                this.getFacturas();
            },   
        });
    });
