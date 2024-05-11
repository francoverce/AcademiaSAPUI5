sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageToast) {
        "use strict";

        return Controller.extend("com.softtek.aca20241q.controller.ItemList", {

            oItemEditar: {
                Nombre: "",
                Descripcion: "",
                Imagen: "",
                Precio: "",
                Descuento: "",
                IdCategoria: ""
            },

            onInit: function() {
                this.getItemsByCategoria();
            },            

            getRouter: function () {
                return sap.ui.core.UIComponent.getRouterFor(this)
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

                            oNavItem.addCustomData(new sap.ui.core.CustomData({
                                key: "IdCategoria",
                                value: oCategoria.IdCategoria
                            }));
            
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
            
            onCollapseExpandPress: function () {
                var oNavigationList = this.byId("navList");
                var bExpanded = oNavigationList.getExpanded();
    
                oNavigationList.setExpanded(!bExpanded);
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

            onSelectionItem: function (oEvent) {           
                var oSelectedItem = oEvent.getParameter("item");
                var sIdItem = oSelectedItem.data("IdItem");

                if (oSelectedItem.getItems().length > 0) {
                    this.onPressCategoria(oSelectedItem);
                } else {  
                    this.getItem(sIdItem, function(oItemData) {
                        var that = this;

                        var oFlexBox = this.getView().byId("flexBoxCard");
                        oFlexBox.removeAllItems();
                    
                        var oVBox = new sap.m.VBox({
                            width: "350px",
                            height: "auto",
                            items: [
                                new sap.m.Toolbar({
                                    content: [
                                        new sap.m.Title({ text: oItemData.Nombre })
                                    ]
                                }),
                                new sap.m.HBox({
                                    items: [
                                new sap.m.Image({ src: oItemData.Imagen, width: "200px" }), ]
                                }),
                                new sap.m.Label({ text: oItemData.Descripcion }),
                                new sap.m.HBox({
                                    justifyContent: "SpaceBetween",
                                    items: [
                                        new sap.m.Text({ text: "$" + oItemData.Precio }),
                                        new sap.ui.core.Icon({
                                            src: "sap-icon://edit",
                                            size: "1.5rem",
                                            color: "#0066cc",
                                            press: function() {
                                                that.editarItem(oItemData);
                                            }
                                        }),
                                        new sap.ui.core.Icon({
                                            src: "sap-icon://delete",
                                            size: "1.5rem",
                                            color: "#cc0000",
                                            press: function() {
                                                that.eliminarItem(oItemData.IdItem);
                                            }
                                        })
                                    ]
                                })
                            ]
                        });
                        oVBox.addStyleClass("customVBox");
                    
                        oFlexBox.addItem(oVBox);
                    }.bind(this));                           
                }
            }, 

            editarItem: function(oItemData) {
                var oDialog = this.getView().byId("editDialog");

                oDialog.setTitle("Editar " + oItemData.Nombre);
                this.getView().byId("inpEditNombre").setValue(oItemData.Nombre);
                this.getView().byId("inpEditDescripcion").setValue(oItemData.Descripcion);
                this.getView().byId("inpEditImagen").setValue(oItemData.Imagen);
                this.getView().byId("inpEditPrecio").setValue(oItemData.Precio);

                this.oItemEditar = oItemData;

                oDialog.open();
            },

            handleEditarItem: function () {
                var oDataModel = this.getOwnerComponent().getModel();
                var that = this;

                console.log(that.oItemEditar);
            
                var sIdItem = that.oItemEditar.IdItem;
            
                var oItemActualizado = {
                    Nombre: this.getView().byId("inpEditNombre").getValue(),
                    Descripcion: this.getView().byId("inpEditDescripcion").getValue(),
                    Imagen: this.getView().byId("inpEditImagen").getValue(),
                    Precio: this.getView().byId("inpEditPrecio").getValue(),
                    Descuento: that.oItemEditar.Descuento,
                    IdCategoria: that.oItemEditar.IdCategoria
                };
            
                // Actualizar el item utilizando el método update
                oDataModel.update("/ItemSet('" + sIdItem + "')", oItemActualizado, {
                    success: function() {
                        MessageToast.show("El ítem se actualizó correctamente");
                        that.handleCloseEdit();
                    },
                    error: function() {
                        MessageToast.show("Error al actualizar el ítem");
                    }
                });
            },

            vaciarItemEditar: function() {
                var itemVacio = {
                    Nombre: "",
                    Descripcion: "",
                    Imagen: "",
                    Precio: "",
                    Descuento: "",
                    IdCategoria: ""
                }
                this.oItemEditar = itemVacio;
            },
            

            handleCloseEdit: function () {
                var oDialog = this.getView().byId("editDialog");
                oDialog.close();
                this.vaciarItemEditar();
            },

            eliminarItem: function (idItem) {
                var sPath = "/ItemSet('" + idItem + "')";
                var oDataModel = this.getOwnerComponent().getModel();
            
                oDataModel.remove(sPath, {
                    success: function (oResponse) {
                        sap.m.MessageBox.success("El ítem fue eliminado con éxito");
                    },
                    error: function (oError) {
                        sap.m.MessageBox.error("Error al eliminar el ítem");
                    }
                });
            },            
            
            onPressCategoria: function (oSelectedItem) {
                var aCustomData = oSelectedItem.getCustomData();
                var sIdCategoria;
                var that = this;
            
                aCustomData.some(function (oData) {
                    if (oData.getKey() === "IdCategoria") {
                        sIdCategoria = oData.getValue();
                        return true;
                    }
                });
            
                this.getCategoria(sIdCategoria, function (oCategoriaData) {
                    that.selectedCategoryId = oCategoriaData.IdCategoria;
                    that.selectedCategoriaNombre = oCategoriaData.Nombre;
            
                    var oDialog = that.getView().byId("helloDialog");
                    oDialog.setTitle("Agregar ítem a " + that.selectedCategoriaNombre);

                    var oNewItemModel = new sap.ui.model.json.JSONModel();
                    var oNewItemData = {
                        IdCategoria: that.selectedCategoryId,
                        Nombre: "",
                        Descripcion: "",
                        Imagen: "",
                        Precio: "",
                        Descuento: ""
                    };
            
                    oNewItemModel.setData(oNewItemData);
                    that.getView().setModel(oNewItemModel, "newItemModel");
            
                    that.handleOpen();
                });
            },            

            getCategoria: function (idCategoria, callback) {
                var oDataModel = this.getOwnerComponent().getModel();
                oDataModel.read("/CategoriaSet('" + idCategoria + "')", {
                    async: false,
                    success: function (oResponse) {
                        callback(oResponse);
                    },
                    error: function (oError) {
                        MessageToast.show("Error al leer datos")
                    }
                });
            },

            handleOpen: function () {
                var oDialog = this.getView().byId("helloDialog");
                oDialog.open();
            },

            handleAgregarItem: function() {
                var oDataModel = this.getOwnerComponent().getModel();
                var that = this;
            
                var oNuevoItem = {
                    Nombre: this.getView().byId("inpNombre").getValue(),
                    Descripcion: this.getView().byId("inpDescripcion").getValue(),
                    Imagen: this.getView().byId("inpImagen").getValue(),
                    Precio: this.getView().byId("inpPrecio").getValue(),
                    Descuento: "0",
                    IdCategoria: this.selectedCategoryId
                };
            
                oDataModel.create("/ItemSet", oNuevoItem, {
                    success: function() {
                        MessageToast.show("El ítem se guardó correctamente");
                        that.handleClose();
                    },
                    error: function() {
                        MessageToast.show("Error al guardar el ítem");
                    }
                });
            },            
    
            handleClose: function () {
                var oDialog = this.getView().byId("helloDialog");
                oDialog.close();
            },
        });
    });
