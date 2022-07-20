import React, { Component } from 'react';
import Router from 'next/router';
import axios from "axios";
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import * as cookie from 'js-cookie';

import { env } from '../../../configs/env';
import Link from "../../../core/components/Link";
import { loadingService } from "../../../core/components/Loader/loader.service";
import { min } from '../../../core/utils/validators';
import { toastify } from "../../../core/utils/toastify";
// import ProductDesignGenerator from '../../../core/components/ProductDesignGenerator';
import ProductDesignTool from '../../../core/components/ProductDesignTool';
import { parseJSON } from '../../../core/utils/jsonParser';
import DynamicImageLoader from '../../../core/components/DynamicImageLoader';
import { priceCalculation, selectedOptionTickColorDecider } from '../../../core/services/designer-steps.service';

class AddProductsComponent extends Component {
	listCampaignMockupType(props) {
		if (props.campaignMockupCatalog && props.campaignMockupCatalog.length > 0) {
			let display_mockup_type_id = props.campaignMockupCatalog.find(c => c.display_mockup_type_id).display_mockup_type_id;
			let mockupType = props.mockupType.find(m => m.id == display_mockup_type_id);
			if (mockupType && mockupType['shrt-campaign-mockup-type']) {
				return (mockupType['shrt-campaign-mockup-type'] || []).map((campaignMockupType, i) => {
					return {
						...campaignMockupType,
						isActive: i == 0
					}
				});
			} else {
				return (props.campaignMockupType || []).map((campaignMockupType, i) => {
					return {
						...campaignMockupType,
						isActive: i == 0
					}
				});
			}
		} else {
			return (props.campaignMockupType || []).map((campaignMockupType, i) => {
				return {
					...campaignMockupType,
					isActive: i == 0
				}
			});
		}
	}
	selectedMockupTypeId(props) {
		if (props.campaignMockupCatalog && props.campaignMockupCatalog.length > 0) {
			let display_mockup_type_id = props.campaignMockupCatalog.find(c => c.display_mockup_type_id).display_mockup_type_id;
			let mockupType = props.mockupType.find(m => m.id == display_mockup_type_id);
			if (mockupType) {
				return mockupType.id;
			} else {
				if (props.mockupType && props.mockupType.length > 0) {
					return (props.mockupType || []).find((mockupType, i) => mockupType && mockupType.id).id
				} else {
					return 1 // (props.mockupType || []).find((mockupType, i) => mockupType && mockupType.id).id;
				}
			}
		} else {
			if (props.mockupType && props.mockupType.length > 0) {
				return (props.mockupType || []).find((mockupType, i) => mockupType && mockupType.id).id
			} else {
				return 1 // (props.mockupType || []).find((mockupType, i) => mockupType && mockupType.id).id;
			}
		}
	}

	selectedCampaignMockupTypeId() {
		if (this.props.campaignMockupCatalog && this.props.campaignMockupCatalog.length > 0) {
			let campaign_mockup_type_id = this.props.campaignMockupCatalog.find(c => c.campaign_mockup_type_id).campaign_mockup_type_id;
			return campaign_mockup_type_id;
		} else {
			return 1;
		}
	}


	backCampaignMockupTypeId() {
		// if (this.props.campaignMockupCatalog && this.props.campaignMockupCatalog.length > 0) {
		// let display_mockup_type_id = (this.props.campaignMockupCatalog || []).find(c => c.display_mockup_type_id).display_mockup_type_id;
		let campaignMockupType = (this.state.campaignMockupType || []).find(c => (c.title == 'back' || c.title == 'Back') && c.mockup_type_id == this.state.mockUpSelectedId);
		if (campaignMockupType) {
			return campaignMockupType.id
		} else {
			this.state.campaignMockupTypeSelectedId;
		}
		// } else {
		// 	return 2;
		// }
	}

	// getCampaignMockupType() {
	// 	let mockupType = this.props.mockupType.find((mockupType, i) => mockupType.id > 0);
	// 	if (this.props.campaignMockupCatalog && this.props.campaignMockupCatalog.length > 0) {
	// 		var campaignMockupCatalog = this.props.campaignMockupCatalog.find(c => c && c.display_mockup_type_id);
	// 		var display_mockup_type_id = campaignMockupCatalog ? campaignMockupCatalog.display_mockup_type_id : mockupType.id;
	// 	} else {
	// 		var display_mockup_type_id = mockupType.id;
	// 	}
	// 	return this.props.mockupType.find((mockupType, i) => mockupType.id == display_mockup_type_id)['shrt-campaign-mockup-type'];
	// }
	listMockupType() {
		if (this.props.campaignMockupCatalog && this.props.campaignMockupCatalog.length > 0) {
			let display_mockup_type_id = this.props.campaignMockupCatalog.find(c => c.display_mockup_type_id).display_mockup_type_id;
			let mockupType = this.props.mockupType.find(m => m.id == display_mockup_type_id);
			if (mockupType) {
				return (this.props.mockupType || []).map((_mockupType, i) => {
					return {
						..._mockupType,
						isActive: _mockupType.id == mockupType.id
					}
				});
			} else {
				return (this.props.mockupType || []).map((mockupType, i) => {
					return {
						...mockupType,
						isActive: i == 0
					}
				});
			}
		} else {
			return (this.props.mockupType || []).map((mockupType, i) => {
				return {
					...mockupType,
					isActive: i == 0
				}
			});
		}
	}
	getCampaignProduct(props) {
		return props.campaignProductCatalogs.map((cPC) => {
			let session = parseInt(localStorage.getItem('campaign-session'));
			let configProd = props.configurableProducts.find(cP => cP.id == cPC.config_product_id)
			if (configProd && configProd.id) {
				let availableOption = (configProd && configProd["shrt-config-prod-option"] ? configProd["shrt-config-prod-option"] : []);
				let availableOptionDetails = (configProd && configProd['shrt-config-prod-option-detail'] ? configProd['shrt-config-prod-option-detail'] : []);
				let shrtFavouriteColorAttributes = availableOptionDetails.filter((cPOD) => cPOD.attribute_id == props.shrtFavouriteColorAttributes.attributeId);
				let shrtSizeAttributes = availableOptionDetails.filter((cPOD) => cPOD.attribute_id == props.shrtSizeAttributes.attributeId);
				let selectedCampaignProducts = {
					config_product_id: configProd.id,
					is_main_product: props.campaignProductCatalogs.length == 1 ? true : cPC.is_main_product,
					sales_price: cPC.sales_price? cPC.sales_price : configProd.recommended_price ? configProd.recommended_price : 22.5,
                    actual_price: priceCalculation(props.campaignMockupType, props.campaignMockupCatalog, configProd['shrt-config-prod-mockup'], configProd.is_no_additional_cost, configProd.actual_price),
					session_id: session,
					availableOption,
					availableOptionDetails,
					shrtFavouriteColorAttributes,
					shrtSizeAttributes,
					options: props.campaignProductCatalogOption.filter((cPCO) => cPCO.campaign_product_catalog_id == cPC.id),
					optionDetails: props.campaignProductCatalogOptionDetail.filter((cPCOD) => cPCOD.campaign_product_catalog_id == cPC.id)
				};

				return selectedCampaignProducts;

			} else {
				return {};
			}
		})
	}
	constructor(props) {
		super(props);
		// debugger
		this.state = {
			isConfigurableProductsLoading: props.isConfigurableProductsLoading,
			isCategoriesLoading: props.isCategoriesLoading,
			isSubCategoriesLoading: props.isSubCategoriesLoading,
			isColorsLoading: props.isColorsLoading,
			isCampaignProductCatalogsLoading: props.isCampaignProductCatalogsLoading,
			// States
			mockUpSelectedId: this.selectedMockupTypeId(props),
			// Filter
			addMoreColor: -1,
			lightDarkMockup: false, // true - dark.
			filteredCategories: false,
			filteredSubcategories: false,
			filteredColor: false,
			filteredProducts: props.configurableProducts,

			// Img b64
			frontImg: '',

			// Cavnas Implemenation
			canvas_color: false,
			display_canvas: false,

			// SHRT
			categoryGroup: props.config_categoryGroup,
			categories: props.config_categories,
			subCategory: props.config_subCategory,

			campaignSession: props.campaignSession,
			isNewCampaignSession: props.isNewCampaignSession,
			mockupType: this.listMockupType(),
			campaignMockupType: this.listCampaignMockupType(props),
			campaignMockupCatalog: props.campaignMockupCatalog,
			designLibrary: props.designLibrary,
			canvas: props.canvas,
			configurableProducts: props.configurableProducts,
			campaignProductCatalogs: props.campaignProductCatalogs,
			campaignProductCatalogOption: props.campaignProductCatalogOption,
			campaignProductCatalogOptionDetail: props.campaignProductCatalogOptionDetail,
			// shrtBasicColorAttributes: props.shrtBasicColorAttributes,
			shrtFavouriteColorAttributes: props.shrtFavouriteColorAttributes,
			shrtSizeAttributes: props.shrtSizeAttributes,
			selectedCampaignProducts: props.selectedCampaignProducts && props.selectedCampaignProducts.length > 0 ? props.selectedCampaignProducts : this.getCampaignProduct(props),
		};
		this.formRef = props.campaignProductCatalogs.map(f => React.createRef());
		this._time = props.configurableProducts.map(c => Date.now());
		// console.log("mockUpSelectedId :: ", this.state.mockUpSelectedId);
	};

	componentDidMount() {
		// if (this.state.activeStep == "add-product") {
			this.checkDesignAdded();

		// }
	};

	componentWillReceiveProps(nextProps) {
		// if (this.state.activeStep == "add-product" || nextProps.activeStep == "add-product") {
			// console.log("Loading next Props :: ", nextProps);
			this.setState(nextProps, () => this.forceUpdateHandler(nextProps));
		// }
	}
	forceUpdateHandler(nextProps) {
		this.setState({
			// mockUpSelectedId: this.selectedMockupTypeId(),
			// mockupType: this.listMockupType(),
			// campaignMockupType: this.listCampaignMockupType(),
			// displayDropZone: this.props.campaignMockupCatalog.length == 0,
			isConfigurableProductsLoading: nextProps.isConfigurableProductsLoading,
			isCategoriesLoading: nextProps.isCategoriesLoading,
			isSubCategoriesLoading: nextProps.isSubCategoriesLoading,
			isColorsLoading: nextProps.isColorsLoading,
			isCampaignProductCatalogsLoading: nextProps.isCampaignProductCatalogsLoading,
			mockUpSelectedId: this.selectedMockupTypeId(nextProps),
			campaignMockupType: this.listCampaignMockupType(nextProps),
			// Filter
			addMoreColor: -1,
			lightDarkMockup: false, // true - dark.
			filteredCategories: false,
			filteredSubcategories: false,
			filteredColor: false,

			// Img b64
			frontImg: '',

			// Cavnas Implemenation
			canvas_color: false,
			display_canvas: false,

			// SHRT
			filteredProducts: nextProps.configurableProducts,
			categoryGroup: nextProps.config_categoryGroup,
			categories: nextProps.config_categories,
			subCategory: nextProps.config_subCategory,

			campaignSession: nextProps.campaignSession,
			isNewCampaignSession: nextProps.isNewCampaignSession,
			mockupType: nextProps.mockupType || [],
			campaignMockupCatalog: nextProps.campaignMockupCatalog,
			designLibrary: nextProps.designLibrary,
			canvas: nextProps.canvas,
			configurableProducts: nextProps.configurableProducts,
			campaignProductCatalogs: nextProps.campaignProductCatalogs,
			campaignProductCatalogOption: nextProps.campaignProductCatalogOption,
			campaignProductCatalogOptionDetail: nextProps.campaignProductCatalogOptionDetail,
			// shrtBasicColorAttributes: nextProps.shrtBasicColorAttributes,
			shrtFavouriteColorAttributes: nextProps.shrtFavouriteColorAttributes,
			selectedCampaignProducts: nextProps.selectedCampaignProducts && nextProps.selectedCampaignProducts.length > 0 ? nextProps.selectedCampaignProducts : this.getCampaignProduct(nextProps)
		}, () => {
			this.componentDidMount();
			this.forceUpdate();
			this.filterProducts(false, false);
		});
	};


	checkDesignAdded() {
		// if (!this.state.campaignMockupCatalog || this.state.campaignMockupCatalog.length == 0) {
		// 	toastify.error("Please add a design first");
		// 	Router.push(`${env.proxyroute}/step-1`);
		// }
	}

	updateMockUp(e) { this.setState({ lightDarkMockup: e.target.checked }); }

	filterCat(id) {
		var cat = this.state.filteredCategories == id ? false : id;
		this.setState({
			filteredCategories: cat,
			filteredProducts: this.filterProducts(cat, this.state.filteredSubcategories),
			filteredSubcategories: false
		});
	}

	filterSubcat(id) {
		var scat = this.state.filteredSubcategories == id ? false : id;
		this.setState({
			filteredSubcategories: scat,
			filteredProducts: this.filterProducts(this.state.filteredCategories, scat),
		});
	}

	filterProducts(cat, scat) {
		if (cat && scat) {
			return this.state.configurableProducts.filter((cP) => {
				// p.categories.id == cat
				let isCatAvailable = (cP['shrt-config-prod-categories'] || []).findIndex((cPCat) => cPCat.category_id == cat);
				if (isCatAvailable > -1) {
					return cP;
				}
			}).filter((cP) => {
				let isSubCatAvailable = (cP['shrt-config-prod-sub-categories'] || []).findIndex((cPSubCat) => cPSubCat.id == scat);
				if (isSubCatAvailable) {
					return cP
				}
			});
		} else if (cat && !scat) {
			return this.state.configurableProducts.filter((cP) => {
				// p.categories.id == cat
				let isCatAvailable = (cP['shrt-config-prod-categories'] || []).findIndex((cPCat) => cPCat.category_id == cat);
				if (isCatAvailable > -1) {
					return cP;
				}
			});
		} else {
			return this.state.configurableProducts;
		}
	}


	filterColor(optionValueName) {
		// var basicColor = this.state.shrtBasicColorAttributes.optionDetail.find(c => c.optionValue == optionValueName);
		var favouriteColor = this.state.shrtFavouriteColorAttributes.optionDetail.find(c => c.optionValue == optionValueName);

		var allProd = this.filterProducts(this.state.filteredCategories, this.state.filteredSubcategories);
		var filteredProducts = allProd.filter((prod) => {
			if (prod
				&& prod['shrt-config-prod-option-detail']
				&& prod['shrt-config-prod-option-detail'].findIndex(ac => ac.config_product_option_value == optionValueName) > -1) {
				return prod;
			}
		});

		this.setState({
			filteredColor: this.state.filteredColor == optionValueName ? false : optionValueName,
			filteredProducts: this.state.filteredColor == optionValueName ? allProd : filteredProducts
		}, () => {
			this.forceUpdate();
		});
	}
	selectProductsDefaultOptions(cPC, cP) {
		let shrtFavouriteColorAttributes = (cP && cP['shrt-config-prod-option-detail'] ? cP['shrt-config-prod-option-detail'] : []).find((cPOD) => cPOD.attribute_id == this.state.shrtFavouriteColorAttributes.attributeId && cPOD.is_default_option);
		if (!shrtFavouriteColorAttributes) {
			shrtFavouriteColorAttributes = (cP && cP['shrt-config-prod-option-detail'] ? cP['shrt-config-prod-option-detail'] : []).find((cPOD) => cPOD.attribute_id == this.state.shrtFavouriteColorAttributes.attributeId);
		}

		if (shrtFavouriteColorAttributes && shrtFavouriteColorAttributes.config_product_option_value) {
			// console.log("addFavColor :: ", cPC.id, cP.id, this.state.shrtFavouriteColorAttributes.attributeId, (shrtFavouriteColorAttributes.config_product_option_value || false));
			this.addFavColor(cPC.id, cP.id, this.state.shrtFavouriteColorAttributes.attributeId, shrtFavouriteColorAttributes.config_product_option_value)
		}

		// let shrtDefaultSizeAttributes = (cP && cP['shrt-config-prod-option-detail'] ? cP['shrt-config-prod-option-detail'] : []).find((cPOD) => cPOD.attribute_id == this.state.shrtSizeAttributes.attributeId && cPOD.is_default_option);
		// if (!shrtDefaultSizeAttributes) {
		// 	shrtDefaultSizeAttributes = (cP && cP['shrt-config-prod-option-detail'] ? cP['shrt-config-prod-option-detail'] : []).find((cPOD) => cPOD.attribute_id == this.state.shrtSizeAttributes.attributeId);
		// }
		// if (shrtDefaultSizeAttributes && shrtDefaultSizeAttributes.config_product_option_value) {
		// 	this.addSize(cPC.id, cP.id, this.state.shrtSizeAttributes.attributeId, shrtDefaultSizeAttributes.config_product_option_value)
		// }

		let shrtSizeAttributes = (cP && cP['shrt-config-prod-option-detail'] ? cP['shrt-config-prod-option-detail'] : []).filter((cPOD) => cPOD.attribute_id == this.state.shrtSizeAttributes.attributeId);

		if (shrtSizeAttributes.length > 0) {
			shrtSizeAttributes.forEach((option) => {
				if (option && option.config_product_option_value) {
					this.addSize(cPC.id, cP.id, this.state.shrtSizeAttributes.attributeId, option.config_product_option_value)
				}
			})
		}
		// let selectedFavColors = (this.state.campaignProductCatalogOptionDetail || []).filter((cPCOD) => cPCOD.campaign_product_catalog_id == cPC.id && cPCOD.attribute_id == this.state.shrtFavouriteColorAttributes.attributeId).map(cPCOD => cPCOD.config_product_option_value);
		// let defaultColor = (this.state.campaignProductCatalogOptionDetail || []).find((cPCOD) => cPCOD.campaign_product_catalog_id == cPC.id && cPCOD.attribute_id == this.state.shrtFavouriteColorAttributes.attributeId && cPCOD.is_default_option);
		// this.addFavColor(cPC.id, cP.id, this.state.shrtFavouriteColorAttributes.attributeId, option.config_product_option_value)
	}

	selectProducts(configProd, configProdIndex) {
		let session = parseInt(localStorage.getItem('campaign-session'));
		let selectedCampaignProducts = [...this.state.selectedCampaignProducts];
		let isAdded = selectedCampaignProducts.findIndex(cp => cp.config_product_id == configProd.id);
		let availableOption = (configProd && configProd["shrt-config-prod-option"] ? configProd["shrt-config-prod-option"] : []);
		let availableOptionDetails = (configProd && configProd['shrt-config-prod-option-detail'] ? configProd['shrt-config-prod-option-detail'] : []);
		let shrtFavouriteColorAttributes = availableOptionDetails.filter((cPOD) => cPOD.attribute_id == this.state.shrtFavouriteColorAttributes.attributeId);
		let shrtSizeAttributes = availableOptionDetails.filter((cPOD) => cPOD.attribute_id == this.state.shrtSizeAttributes.attributeId);


		if (isAdded == -1) {
			selectedCampaignProducts.push({
				config_product_id: configProd.id,
				is_main_product: selectedCampaignProducts.length == 0,
                sales_price: configProd.recommended_price ? configProd.recommended_price : 22.5,
                actual_price: priceCalculation(this.state.campaignMockupType, this.state.campaignMockupCatalog, configProd['shrt-config-prod-mockup'], configProd.is_no_additional_cost, configProd.actual_price),
				session_id: session,
				availableOption,
				availableOptionDetails,
				shrtFavouriteColorAttributes,
				shrtSizeAttributes,
				options: [],
				optionDetails: []
			});
			// Add Default Color
			let defaultFavouriteColor = shrtFavouriteColorAttributes.find((cPOD) => cPOD.is_default_option);
			if (!defaultFavouriteColor) {
				defaultFavouriteColor = shrtFavouriteColorAttributes.find((cPOD) => cPOD.attribute_id == this.state.shrtFavouriteColorAttributes.attributeId);
			}

			if (defaultFavouriteColor && defaultFavouriteColor.config_product_option_value) {
				selectedCampaignProducts[selectedCampaignProducts.length - 1].options.push({
					product_option_required: true,
					attribute_id: this.state.shrtFavouriteColorAttributes.attributeId,
					session_id: parseInt(localStorage.getItem('campaign-session'))
				})
				selectedCampaignProducts[selectedCampaignProducts.length - 1].optionDetails.push({
					attribute_id: this.state.shrtFavouriteColorAttributes.attributeId,
					config_product_option_price: defaultFavouriteColor.config_product_option_price,
					config_product_option_quantity: defaultFavouriteColor.config_product_option_quantity,
					config_product_option_value: defaultFavouriteColor.config_product_option_value,
					is_default_option: true,
					session_id: parseInt(localStorage.getItem('campaign-session'))
				})
			}

			// Add all sizes
			if (shrtSizeAttributes && shrtSizeAttributes.length > 0) {
				selectedCampaignProducts[selectedCampaignProducts.length - 1].options.push({
					product_option_required: true,
					attribute_id: this.state.shrtSizeAttributes.attributeId,
					session_id: parseInt(localStorage.getItem('campaign-session'))
				})
				selectedCampaignProducts[selectedCampaignProducts.length - 1].optionDetails.push(...shrtSizeAttributes.map((oPD) => {
					return {
						attribute_id: oPD.attribute_id,
						config_product_option_price: oPD.config_product_option_price,
						config_product_option_quantity: oPD.config_product_option_quantity,
						config_product_option_value: oPD.config_product_option_value,
						is_default_option: oPD.is_default_option,
						session_id: parseInt(localStorage.getItem('campaign-session'))
					}
				}))
			}

			this.setState({ selectedCampaignProducts });
		}
		// loadingService.show("Loading");
		// let data = {
		// 	config_product_id: configProd.id,
		// 	is_main_product: false,
		// 	sales_price: configProd.actual_price || 100,
		// 	session_id: parseInt(localStorage.getItem('campaign-session'))
		// }
		// console.log(data);
		// var req = axios.post(`${env.clientHost}/campaign-product-catalog`, data).then((response) => response.data);
		// req.then((response) => {
		// 	loadingService.hide();
		// 	if (response && response.data && response.data.id) {
		// 		let campaignProductCatalogs = this.state.campaignProductCatalogs || [];
		// 		campaignProductCatalogs.push(response.data);
		// 		this.setState({
		// 			campaignProductCatalogs: campaignProductCatalogs
		// 		}, () => this.selectProductsDefaultOptions(response.data, configProd));
		// 	}
		// });
		// req.catch((error) => {
		// 	console.log(error);
		// 	toastify.error("Error in request");
		// 	loadingService.hide();
		// })

	}
	removeSelProd(configProd, configProdIndex) {
		let selectedCampaignProducts = [...this.state.selectedCampaignProducts];
		let removeIndex = selectedCampaignProducts.findIndex(cp => cp.config_product_id == configProd.id);
		
		if (removeIndex > -1) {
			selectedCampaignProducts.splice(removeIndex,1);
			console.log(selectedCampaignProducts)
			this.setState({selectedCampaignProducts});
		}
		// loadingService.show("Loading");
		// let campaignProductCatalogs = this.state.campaignProductCatalogs.find((cPC) => configProd.id == cPC.config_product_id);
		// let campaignProductCatalogsIndex = this.state.campaignProductCatalogs.findIndex((cPC) => configProd.id == cPC.config_product_id);
		// let removeReq = [];
		// if (campaignProductCatalogsIndex > -1) {
		// 	let campaignProductCatalogOption = this.state.campaignProductCatalogOption.filter((cPCO) =>
		// 		cPCO.campaign_product_catalog_id == campaignProductCatalogs.id
		// 	)
		// 	if (campaignProductCatalogOption.length > 0) {
		// 		campaignProductCatalogOption.forEach((cPCO) => {
		// 			let campaignProductCatalogOptionDetail = this.state.campaignProductCatalogOptionDetail.filter((_cPCOD) =>
		// 				_cPCOD.campaign_product_catalog_option_id == cPCO.id
		// 			);
		// 			if (campaignProductCatalogOptionDetail.length > 0) {
		// 				campaignProductCatalogOptionDetail.forEach((cPCOD) => {
		// 					let _r = axios.delete(`${env.clientHost}/campaign-product-catalog-option-detail/${cPCOD.id}`);
		// 					removeReq.push(_r);
		// 					_r.then(res => {
		// 						if (res.status == 200) {
		// 							let updateIndex = this.state.campaignProductCatalogOptionDetail.findIndex((_cPCOD) =>
		// 								_cPCOD.id == cPCOD.id
		// 							);
		// 							let allData = this.state.campaignProductCatalogOptionDetail;
		// 							allData.splice(updateIndex, 1);
		// 							this.setState({ campaignProductCatalogOptionDetail: allData });
		// 						}
		// 					});
		// 				})
		// 			}
		// 			let _r = axios.delete(`${env.clientHost}/campaign-product-catalog-option/${cPCO.id}`)
		// 			removeReq.push(_r);
		// 			_r.then(res => {
		// 				if (res.status == 200) {
		// 					let updateIndex = this.state.campaignProductCatalogOption.findIndex((_cPCO) =>
		// 						_cPCO.id == cPCO.id
		// 					);
		// 					let allData = this.state.campaignProductCatalogOption;
		// 					allData.splice(updateIndex, 1);
		// 					if (allData.length == 0) {
		// 						campaignProductCatalogOption
		// 					}
		// 					this.setState({ campaignProductCatalogOption: allData });
		// 				}
		// 			});
		// 		})

		// 	}
		// }


		// if (campaignProductCatalogs && campaignProductCatalogs.id) {
		// 	var req = axios.delete(`${env.clientHost}/campaign-product-catalog/${campaignProductCatalogs.id}`).then((response) => response.data);
		// 	removeReq.push(req);
		// 	Promise.all(removeReq);
		// 	req.then((response) => {
		// 		loadingService.hide();
		// 		if (response) {
		// 			let _campaignProductCatalogs = this.state.campaignProductCatalogs || [];
		// 			_campaignProductCatalogs.splice(campaignProductCatalogsIndex, 1);
		// 			this.setState({
		// 				campaignProductCatalogs: _campaignProductCatalogs
		// 			});
		// 		}
		// 	});
		// 	req.catch((error) => {
		// 		console.log(error);
		// 		toastify.error("Error in request");
		// 		loadingService.hide();
		// 	})
		// } else {
		// 	toastify.error("Error in request");
		// }
	}


	addProductPrice(e, index) {
		var campaignProductCatalogs = this.state.campaignProductCatalogs;
		campaignProductCatalogs[index].sales_price = e.target.value;
		this.setState({ campaignProductCatalogs: campaignProductCatalogs });
	}

	addMoreColor(spi) {
		this.setState({ addMoreColor: spi })
	}

	addSelectedMainColor(camp_ind, col_id) {
		let camp_prod = this.state.campaign_products[camp_ind];
		camp_prod.main_colors = col_id;
		var req = axios.put(`${env.clientHost}/api/campaigns-products/${camp_prod.id}`, camp_prod).then((response) => response.data);
		req.then((response) => {
			loadingService.hide();
			// console.log("Campaign Product ", response.data);
			if (response && response.data && response.data.id) {
				let campaign_products = this.state.campaign_products || [];
				campaign_products[camp_ind] = response.data;
				this.setState({
					campaign_products: campaign_products
				});
			}
		});
	}

	addSelectedColor(camp_ind, col_id) {
		let camp_prod = this.state.campaign_products[camp_ind];
		let isAdded = camp_prod.avail_colors.indexOf(col_id);
		if (isAdded > -1) {
			camp_prod.avail_colors.splice(isAdded, 1);
			camp_prod.main_colors = camp_prod.main_colors == col_id ? '' : camp_prod.main_colors;
			var req = axios.put(`${env.clientHost}/api/campaigns-products/${camp_prod.id}`, camp_prod).then((response) => response.data);
		} else {
			if (!camp_prod.avail_colors || camp_prod.avail_colors.length == 0) {
				camp_prod.avail_colors = [col_id];
				camp_prod.main_colors = col_id;
			} else {
				camp_prod.avail_colors = [...camp_prod.avail_colors.map(col => col.id ? col.id : col), col_id];
				// camp_prod.main_colors = camp_prod.main_colors && camp_prod.main_colors.id ? camp_prod.main_colors.id : col_id;
			}
			var req = axios.put(`${env.clientHost}/api/campaigns-products/${camp_prod.id}`, camp_prod).then((response) => response.data);
		}
		req.then((response) => {
			loadingService.hide();
			if (response && response.data && response.data.id) {
				let campaign_products = this.state.campaign_products || [];
				campaign_products[camp_ind] = response.data;
				this.setState({
					campaign_products: campaign_products
				});
			}
		});
	}

	async updateData() {
		return await Promise.all(this.state.campaignProductCatalogs.map((cPC) => {
			return new Promise(async (resolve, reject) => {
				loadingService.show("Loading");
				let data = {
					id: cPC.id,
					config_product_id: cPC.config_product_id,
					is_main_product: cPC.is_main_product || false,
					sales_price: cPC.sales_price,
					session_id: parseInt(localStorage.getItem('campaign-session'))
				}
				// console.log(data);
				var response = await axios.put(`${env.clientHost}/campaign-product-catalog/${data.id}`, data);
				if (response && response.status == 200) {
					resolve(data);
				} else {
					resolve(false)
				}
			});
		}))
	}


	async storeData() {
		loadingService.show("Loading");
		var response = await axios.patch(`${env.clientHost}/campaign-product-catalog`, {
			campaignProdCatalogs: this.state.selectedCampaignProducts,
			sessionId: parseInt(localStorage.getItem('campaign-session'))
		});
		return response;
	}




	nextStep(e) {
		this.formRef.forEach(f => {
			if (f && f["current"] == null) return false;
			if (f && f.validateAll()) {
				f.validateAll();
			}
		});
		const isInvalid = this.formRef.find(f => f && f["current"] != null && f.getChildContext() ? f.getChildContext()._errors.length > 0 : false);
		if (isInvalid) {
			return toastify.error("Please fill up all of the required fields.");
		}
		if (this.state.selectedCampaignProducts.length == 0) {
			return toastify.error("Please select atleast one product.");;
		}
		loadingService.show("Loading");
		this.storeData().then((response) => {
			if (response.status == 200) {
				let data = response.data.data;
				let updateData = {
					campaignProductCatalogs: data.campaignProductCatalogs,
					campaignProductCatalogOption: data.campaignProductCatalogOption,
					campaignProductCatalogOptionDetail: data.campaignProductCatalogOptionDetail,
					selectedCampaignProducts: this.state.selectedCampaignProducts
				}
				this.setState(updateData);
				this.props.updatePropsData({
					...updateData,
					activeStep: 'step-2'
				})
			} else {
				throw new Error("Error in processing.");
			}
		}).catch((error) => {
			loadingService.hide();
			toastify.error(error.msg || error.message || error);
			console.log(error);
			return false;
		})
		// this.updateData().then(response => {
		// 	console.log(response, this.state.campaignProductCatalogOption, this.state.campaignProductCatalogOptionDetail);
		// 	loadingService.hide();
		// 	if (response && response.length > 0 && response.indexOf(false) == -1) {
		// 		// Router.push(`${env.proxyroute}/step-2`);
		// 		this.props.updatePropsData({
		// 			campaignProductCatalogs: response.filter(r => r.id),
		// 			campaignProductCatalogOption: this.state.campaignProductCatalogOption,
		// 			campaignProductCatalogOptionDetail: this.state.campaignProductCatalogOptionDetail,
		// 			activeStep: 'step-2'
		// 		})
		// 	}
		// }).catch(e => {
		// 	loadingService.hide();
		// 	toastify.error("Error in request!");
		// 	console.log(e);
		// 	return false;
		// });
	}


	getConfigProdCanvas(configProd, configProdIndex, is_side) {
		let isLoad = JSON.parse(localStorage.getItem('loadAllDesign')) || false;
		let mockUpSelected = this.state.mockupType.find((mT) => mT.id == this.state.mockUpSelectedId);
		if (mockUpSelected && mockUpSelected.id) {
			let campMockupType = this.state.campaignMockupType.find((cMT) => cMT.mockup_type_id == mockUpSelected.id);
			if (campMockupType && campMockupType.id) {
				let configProdMockUp = (configProd['shrt-config-prod-mockup'] || []).find((cPM) => campMockupType.id == cPM.campaign_mockup_type_id && mockUpSelected.id == cPM.mockup_type_id);
				let campaignMockupCatalog = this.state.campaignMockupCatalog.find((cMC) => cMC.design_mockup_type_id == mockUpSelected.id && cMC.campaign_mockup_type_id == campMockupType.id)
				// let _time = Date.now();
				if (configProdMockUp && campaignMockupCatalog) {
					return <DynamicImageLoader
						// product_image_url={`${(env.digitalOceanHost) ? env.digitalOceanHost : env.mainHost}/${configProdMockUp.small_image || configProdMockUp.large_image}`}
						product_image_url={`${configProdMockUp.small_image || configProdMockUp.large_image}`}
						design_image_url={`${env.designerHost}/product-images/${configProdMockUp.canvas_id}/${campaignMockupCatalog.canvas_id}?backgroundColor=%2300000&size=s${isLoad ? '&_timestamp=' + Date.now() : ''}`}
						mockup_file_image_url={configProd['shrt-config-prod-mockup'][0].large_image}
						mockup_file_objects={configProdMockUp}
						print_file_objects={campaignMockupCatalog}
						prev_loading={isLoad} />
					// return (<div className="product-design">
					// 	<div className="product-design-output">
					// 		<img style={{ "width": 150, "height": 170 }} src={`${env.designerHost}/product-images/${configProdMockUp.canvas_id}/${campaignMockupCatalog.canvas_id}?timestamp=${_time}&size=s`} />
					// 	</div>
					// </div>)
				} else if (configProdMockUp && !campaignMockupCatalog) {
					return (
						<div className="product-design">
							<div className="product-design-output">
								{/* <img style={{ "width": 150, "height": 150, backgroundColor: "#000" }} src={`${(env.digitalOceanHost) ? env.digitalOceanHost : env.mainHost}/${configProdMockUp.small_image || configProdMockUp.large_image}`} /> */}
								<img style={{ "width": 150, "height": 150, backgroundColor: "#000" }} src={`${configProdMockUp.small_image || configProdMockUp.large_image}`} />

							</div>
						</div>
					);
				} else {
					return (
						// <p>No product image</p>
						<p>No product image or configuration found</p>
					)
				}

			} else {
				return (
					// <p>No product image</p>
					<p>No product image or configuration found</p>
				)
			}
		} else {
			return (
				// <p>No product image</p>
				<p>No product image or configuration found</p>
			)
		}

		// let mockUpSelected = (this.state.mockupType || []).find((mT) => mT.id == this.state.mockUpSelectedId);
		// let campMockupType = (this.state.campaignMockupType || []).find((cMT) => cMT.mockup_type_id == mockUpSelected.id);
		// let configProdMockUp = (configProd['shrt-config-prod-mockup'] || []).find((cPM) => campMockupType.id == cPM.campaign_mockup_type_id && mockUpSelected.id == cPM.mockup_type_id);
		// let campaignMockupCatalog = this.state.campaignMockupCatalog.find((cMC) => cMC.design_mockup_type_id == mockUpSelected.id && cMC.campaign_mockup_type_id == campMockupType.id)
		// let cMCIndex = this.state.campaignMockupCatalog.findIndex((cMC) => cMC.design_mockup_type_id == mockUpSelected.id && cMC.campaign_mockup_type_id == campMockupType.id)
		// // console.log("configProdMockUp", configProdMockUp, "campaignMockupCatalog", campaignMockupCatalog);
		// // let rectObject = (campaignMockupCatalog || {objects: []}).objects.find((o)=> o.type == 'rect');
		// let _canvas = (configProdMockUp && configProdMockUp['shrt-canvas'] ? configProdMockUp['shrt-canvas'] : {
		// 	objects: [{
		// 		type: 'rect', top: 10,
		// 		left: 10,
		// 		width: 50,
		// 		height: 50,
		// 	}]
		// });
		// let fixedData = {
		// 	objects: parseJSON(_canvas.objects),
		// 	version: _canvas.version,
		// 	background: _canvas.background,
		// 	backgroundImage: parseJSON(_canvas.backgroundImage)
		// }

		// let objectSize = fixedData.objects.find((o) => o.type = 'rect');
		// console.log("objectSize :: ", objectSize);

		// if (configProdMockUp && campaignMockupCatalog) {
		// 	// let data = {
		// 	// 	inner_canvas: this.props.getCanvas(cMCIndex) ? this.props.getCanvas(cMCIndex) : { objects: [] },
		// 	// 	product_config: {
		// 	// 		width: 150,
		// 	// 		height: 150,
		// 	// 		product_image: `${env.mainHost}/${configProdMockUp.small_image || configProdMockUp.large_image}`,
		// 	// 		background_color: this.state.filteredColor && !is_side ? this.state.filteredColor : '#000000'
		// 	// 	},
		// 	// 	objectSize,
		// 	// };
		// 	// return (
		// 	// 	// <p>No product image</p>
		// 	// 	<ProductDesignTool {...data} />
		// 	// );
		// 	// return (<div className="product-design">
		// 	// 	<div className="product-design-output">
		// 	// 		<img style={{ "width": 150, "height": 170 }} src={`${env.mainHost}/${configProdMockUp.small_image || configProdMockUp.large_image}`} />
		// 	// 	</div>
		// 	// </div>)
		// } else if (configProdMockUp && !campaignMockupCatalog) {
		// 	return (
		// 		<div className="product-design">
		// 			<div className="product-design-output">
		// 				<img style={{ "width": 150, "height": 170 }} src={`${env.mainHost}/${configProdMockUp.small_image || configProdMockUp.large_image}`} />
		// 			</div>
		// 		</div>
		// 	);
		// } else {
		// 	return (
		// 		// <p>No product image</p>
		// 		<p>No product image or configuration found</p>
		// 	)
		// }
	}

	getConfigProd(configProd, configProdIndex) {

		const isAdded = this.state.selectedCampaignProducts.findIndex((cPC) => cPC.config_product_id == configProd.id);
		const style = {
			// background: '#000000',
			// color: '#ffffff'
		}
		if (configProdIndex == this.state.filteredProducts.length - 1) {
			// setTimeout(() => {
			localStorage.setItem('loadAllDesign', false);
			// }, 1500);
		}
		return (
			<div className={"col-md-4 added-product"} key={`add_product_${configProd.id}`}>
				<div className="bg-white text-center position-relative">
					{
						isAdded == -1 ? <button className="btn-default" onClick={() => { this.selectProducts(configProd, configProdIndex) }}>Click to add</button> : <button className="btn-default" onClick={() => { this.removeSelProd(configProd, configProdIndex) }}>Click to remove</button>
					}
					<div className="pro-title">{configProd.product_name}</div>
					<div className="image-bg-set" style={style} >
						{
							this.getConfigProdCanvas(configProd, configProdIndex, false)
						}
						{
							isAdded > -1 ? <div className="select-product"> <i className="fa fa-check"></i> </div> : ''
						}
					</div>
				</div>
			</div>
		)
	}

	addBasicColor(cPCId, cPId, attributeId, optionValueName) {
		// Check first for campaign-product-catalog-option in campaignProductCatalogOption if not found store campaign-product-catalog-option.
		let cMCO_data = {
			campaign_product_catalog_id: cPCId,
			config_product_id: cPId,
			attribute_id: attributeId,
			product_option_required: 1,
			session_id: parseInt(localStorage.getItem('campaign-session'))
		}
		let campaignProductCatalogOption = this.state.campaignProductCatalogOption.find((cPCO) =>
			cPCO.campaign_product_catalog_id == cMCO_data.campaign_product_catalog_id
			&& cPCO.attribute_id == cMCO_data.attribute_id
		)
		if (campaignProductCatalogOption) {
			// Check first for campaign-product-catalog-option-detail in campaignProductCatalogOptionDetail if not found store campaign-product-catalog-option-detail.
			let cMCOD_data = {
				campaign_product_catalog_id: cPCId,
				campaign_product_catalog_option_id: campaignProductCatalogOption.id,
				attribute_id: attributeId,
				config_product_option_value: optionValueName,
				config_product_option_quantity: 100,
				config_product_option_price: 0,
				session_id: parseInt(localStorage.getItem('campaign-session'))
				//config_product_option_quantity:123
				//config_product_option_price:312
			}
			let campaignProductCatalogOptionDetail = this.state.campaignProductCatalogOptionDetail.find((cPCO) =>
				cPCO.campaign_product_catalog_id == cMCOD_data.campaign_product_catalog_id
				&& cPCO.attribute_id == cMCOD_data.attribute_id
				&& cPCO.campaign_product_catalog_option_id == cMCOD_data.campaign_product_catalog_option_id
			);

			if (campaignProductCatalogOptionDetail) {
				axios.put(`${env.clientHost}/campaign-product-catalog-option-detail/${campaignProductCatalogOptionDetail.id}`, cMCOD_data).then(res => {
					if (res.status == 200) {

						let updateIndex = this.state.campaignProductCatalogOptionDetail.findIndex((cPCO) =>
							cPCO.campaign_product_catalog_id == cMCOD_data.campaign_product_catalog_id
							&& cPCO.attribute_id == cMCOD_data.attribute_id
							&& cPCO.campaign_product_catalog_option_id == cMCOD_data.campaign_product_catalog_option_id
						);
						let allData = this.state.campaignProductCatalogOptionDetail;
						allData[updateIndex].config_product_option_value = optionValueName;
						this.setState({ campaignProductCatalogOptionDetail: allData });
					}
				});
			} else {
				// Store campaignProductCatalogOptionDetail
				axios.post(`${env.clientHost}/campaign-product-catalog-option-detail`, cMCOD_data).then(res => {
					if (res.status == 200
						&& res.data
						&& res.data.data
						&& res.data.data.id) {
						let allData = this.state.campaignProductCatalogOptionDetail || [];
						allData.push(res.data.data);
						this.setState({ campaignProductCatalogOptionDetail: allData });
					}
				});
			}
		} else {
			// Store campaignProductCatalogOption && campaignProductCatalogOptionDetail
			axios.post(`${env.clientHost}/campaign-product-catalog-option`, cMCO_data).then(res => {
				// console.log(res.data.data);
				if (res.status == 200
					&& res.data
					&& res.data.data
					&& res.data.data.id) {
					let campaignProductCatalogOption = [...this.state.campaignProductCatalogOption, ...[res.data.data]];
					this.setState({ campaignProductCatalogOption }, () => {
						let cMCOD_data = {
							campaign_product_catalog_id: cPCId,
							campaign_product_catalog_option_id: res.data.data.id,
							attribute_id: attributeId,
							config_product_option_value: optionValueName,
							config_product_option_quantity: 100,
							config_product_option_price: 0,
							session_id: parseInt(localStorage.getItem('campaign-session'))
							//config_product_option_quantity:123
							//config_product_option_price:312
						}
						let campaignProductCatalogOptionDetail = this.state.campaignProductCatalogOptionDetail.find((cPCO) =>
							cPCO.campaign_product_catalog_id == cMCOD_data.campaign_product_catalog_id
							&& cPCO.attribute_id == cMCOD_data.attribute_id
							&& cPCO.campaign_product_catalog_option_id == cMCOD_data.campaign_product_catalog_option_id
						);

						if (campaignProductCatalogOptionDetail) {
							axios.put(`${env.clientHost}/campaign-product-catalog-option-detail/${campaignProductCatalogOptionDetail.id}`, cMCOD_data).then(res => {
								if (res.status == 200) {

									let updateIndex = this.state.campaignProductCatalogOptionDetail.findIndex((cPCO) =>
										cPCO.campaign_product_catalog_id == cMCOD_data.campaign_product_catalog_id
										&& cPCO.attribute_id == cMCOD_data.attribute_id
										&& cPCO.campaign_product_catalog_option_id == cMCOD_data.campaign_product_catalog_option_id
									);
									let allData = this.state.campaignProductCatalogOptionDetail;
									allData[updateIndex].config_product_option_value = optionValueName;
									this.setState({ campaignProductCatalogOptionDetail: allData });
								}
							});
						} else {
							// Store campaignProductCatalogOptionDetail
							axios.post(`${env.clientHost}/campaign-product-catalog-option-detail`, cMCOD_data).then(res => {
								if (res.status == 200
									&& res.data
									&& res.data.data
									&& res.data.data.id) {
									let allData = this.state.campaignProductCatalogOptionDetail || [];
									allData.push(res.data.data);
									this.setState({ campaignProductCatalogOptionDetail: allData });
								}
							});
						}
					});

				}
			});
		}
	}
	isBasicColorAdded(cPCId, cPId, attributeId, optionValueName) {
		// debugger;
		let className = '';
		let cMCO_data = {
			campaign_product_catalog_id: cPCId,
			config_product_id: cPId,
			attribute_id: attributeId,
			product_option_required: 1,
			session_id: parseInt(localStorage.getItem('campaign-session'))
		}
		let campaignProductCatalogOption = this.state.campaignProductCatalogOption.find((cPCO) =>
			cPCO.campaign_product_catalog_id == cMCO_data.campaign_product_catalog_id
			&& cPCO.attribute_id == cMCO_data.attribute_id
		)
		if (campaignProductCatalogOption) {
			// Check first for campaign-product-catalog-option-detail in campaignProductCatalogOptionDetail if not found store campaign-product-catalog-option-detail.
			let cMCOD_data = {
				campaign_product_catalog_id: cPCId,
				campaign_product_catalog_option_id: campaignProductCatalogOption.id,
				attribute_id: attributeId,
				config_product_option_value: optionValueName,
				session_id: parseInt(localStorage.getItem('campaign-session'))
				//config_product_option_quantity:123
				//config_product_option_price:312
			}
			let campaignProductCatalogOptionDetail = this.state.campaignProductCatalogOptionDetail.find((cPCO) =>
				cPCO.campaign_product_catalog_id == cMCOD_data.campaign_product_catalog_id
				&& cPCO.attribute_id == cMCOD_data.attribute_id
				&& cPCO.campaign_product_catalog_option_id == cMCOD_data.campaign_product_catalog_option_id
				&& cPCO.config_product_option_value == cMCOD_data.config_product_option_value
			);

			if (campaignProductCatalogOptionDetail) {
				className = 'list-color selected';
			} else {
				className = 'list-color';
			}
		} else {
			className = 'list-color';
		}
		return className;
	}

	addFavColor(cPCId, cPId, attributeId, optionValueName) {
		// Check first for campaign-product-catalog-option in campaignProductCatalogOption if not found store campaign-product-catalog-option.
		let cMCO_data = {
			campaign_product_catalog_id: cPCId,
			config_product_id: cPId,
			attribute_id: attributeId,
			product_option_required: 1,
			session_id: parseInt(localStorage.getItem('campaign-session'))
		}
		let campaignProductCatalogOption = this.state.campaignProductCatalogOption.find((cPCO) =>
			cPCO.campaign_product_catalog_id == cMCO_data.campaign_product_catalog_id
			&& cPCO.attribute_id == cMCO_data.attribute_id
		)
		if (campaignProductCatalogOption) {
			let is_default_option = this.state.campaignProductCatalogOptionDetail.findIndex((cPCO) =>
				cPCO.campaign_product_catalog_id == cPCId
				&& cPCO.attribute_id == attributeId
				&& cPCO.campaign_product_catalog_option_id == campaignProductCatalogOption.id
				&& cPCO.is_default_option == true
			);

			// Check first for campaign-product-catalog-option-detail in campaignProductCatalogOptionDetail if not found store campaign-product-catalog-option-detail.
			let cMCOD_data = {
				campaign_product_catalog_id: cPCId,
				campaign_product_catalog_option_id: campaignProductCatalogOption.id,
				attribute_id: attributeId,
				config_product_option_value: optionValueName,
				config_product_option_quantity: 100,
				config_product_option_price: 0,
				is_default_option: is_default_option > -1 ? false : true,
				session_id: parseInt(localStorage.getItem('campaign-session'))
				//config_product_option_quantity:123
				//config_product_option_price:312
			}
			let campaignProductCatalogOptionDetail = this.state.campaignProductCatalogOptionDetail.find((cPCO) =>
				cPCO.campaign_product_catalog_id == cMCOD_data.campaign_product_catalog_id
				&& cPCO.attribute_id == cMCOD_data.attribute_id
				&& cPCO.campaign_product_catalog_option_id == cMCOD_data.campaign_product_catalog_option_id
				&& cPCO.config_product_option_value == cMCOD_data.config_product_option_value
			);

			if (campaignProductCatalogOptionDetail && !campaignProductCatalogOptionDetail.is_default_option) {
				axios.delete(`${env.clientHost}/campaign-product-catalog-option-detail/${campaignProductCatalogOptionDetail.id}`).then(res => {
					if (res.status == 200) {

						let updateIndex = this.state.campaignProductCatalogOptionDetail.findIndex((cPCO) =>
							cPCO.campaign_product_catalog_id == cMCOD_data.campaign_product_catalog_id
							&& cPCO.attribute_id == cMCOD_data.attribute_id
							&& cPCO.campaign_product_catalog_option_id == cMCOD_data.campaign_product_catalog_option_id
							&& cPCO.config_product_option_value == cMCOD_data.config_product_option_value
						);
						let allData = this.state.campaignProductCatalogOptionDetail;
						allData.splice(updateIndex, 1);

						if (campaignProductCatalogOptionDetail.is_default_option) {
							let new_default_option = allData.findIndex((cPCO) =>
								cPCO.campaign_product_catalog_id == cPCId
								&& cPCO.attribute_id == attributeId
								&& cPCO.campaign_product_catalog_option_id == campaignProductCatalogOption.id
							);
							if (new_default_option > -1) {
								allData[new_default_option].is_default_option = true;
								axios.put(`${env.clientHost}/campaign-product-catalog-option-detail/${allData[new_default_option].id}`, { is_default_option: true }).then(res => { });
							}
						}
						let otherSameAttribute = allData.filter((cPCO) =>
							cPCO.campaign_product_catalog_id == cMCOD_data.campaign_product_catalog_id
							&& cPCO.attribute_id == cMCOD_data.attribute_id
							&& cPCO.campaign_product_catalog_option_id == cMCOD_data.campaign_product_catalog_option_id
						);

						if (otherSameAttribute.length == 0) {
							axios.delete(`${env.clientHost}/campaign-product-catalog-option/${campaignProductCatalogOption.id}`).then(res => {
								if (res.status == 200) {
									let updateIndex = this.state.campaignProductCatalogOption.findIndex((cPCO) =>
										cPCO.campaign_product_catalog_id == cMCO_data.campaign_product_catalog_id
										&& cPCO.attribute_id == cMCO_data.attribute_id
									);
									let _allData = this.state.campaignProductCatalogOption;
									_allData.splice(updateIndex, 1);
									// if (_allData.length == 0) {
									// 	campaignProductCatalogOption
									// }
									this.setState({ campaignProductCatalogOption: _allData });
								}
							});
						}
						this.setState({ campaignProductCatalogOptionDetail: allData });
					}
				});
			} else if (!campaignProductCatalogOptionDetail) {
				// Store campaignProductCatalogOptionDetail
				axios.post(`${env.clientHost}/campaign-product-catalog-option-detail`, cMCOD_data).then(res => {
					if (res.status == 200
						&& res.data
						&& res.data.data
						&& res.data.data.id) {
						let allData = this.state.campaignProductCatalogOptionDetail || [];
						allData.push(res.data.data);
						this.setState({ campaignProductCatalogOptionDetail: allData });
					}
				});
			}
		} else {
			// Store campaignProductCatalogOption && campaignProductCatalogOptionDetail
			axios.post(`${env.clientHost}/campaign-product-catalog-option`, cMCO_data).then(res => {
				// console.log(res.data.data);
				if (res.status == 200
					&& res.data
					&& res.data.data
					&& res.data.data.id) {
					let campaignProductCatalogOption = [...this.state.campaignProductCatalogOption, ...[res.data.data]];
					this.setState({ campaignProductCatalogOption }, () => {

						let is_default_option = this.state.campaignProductCatalogOptionDetail.findIndex((cPCO) =>
							cPCO.campaign_product_catalog_id == cPCId
							&& cPCO.attribute_id == attributeId
							&& cPCO.campaign_product_catalog_option_id == campaignProductCatalogOption.id
							&& cPCO.is_default_option == true
						);

						let cMCOD_data = {
							campaign_product_catalog_id: cPCId,
							campaign_product_catalog_option_id: res.data.data.id,
							attribute_id: attributeId,
							config_product_option_value: optionValueName,
							config_product_option_quantity: 100,
							config_product_option_price: 0,
							is_default_option: is_default_option > -1 ? false : true,
							session_id: parseInt(localStorage.getItem('campaign-session'))
							//config_product_option_quantity:123
							//config_product_option_price:312
						}
						let campaignProductCatalogOptionDetail = this.state.campaignProductCatalogOptionDetail.find((cPCO) =>
							cPCO.campaign_product_catalog_id == cMCOD_data.campaign_product_catalog_id
							&& cPCO.attribute_id == cMCOD_data.attribute_id
							&& cPCO.campaign_product_catalog_option_id == cMCOD_data.campaign_product_catalog_option_id
							&& cPCO.config_product_option_value == cMCOD_data.config_product_option_value
						);

						if (campaignProductCatalogOptionDetail) {
							axios.delete(`${env.clientHost}/campaign-product-catalog-option-detail/${campaignProductCatalogOptionDetail.id}`).then(res => {
								if (res.status == 200) {

									let updateIndex = this.state.campaignProductCatalogOptionDetail.findIndex((cPCO) =>
										cPCO.campaign_product_catalog_id == cMCOD_data.campaign_product_catalog_id
										&& cPCO.attribute_id == cMCOD_data.attribute_id
										&& cPCO.campaign_product_catalog_option_id == cMCOD_data.campaign_product_catalog_option_id
										&& cPCO.config_product_option_value == cMCOD_data.config_product_option_value
									);
									let allData = this.state.campaignProductCatalogOptionDetail;
									allData.splice(updateIndex, 1);

									let otherSameAttribute = allData.filter((cPCO) =>
										cPCO.campaign_product_catalog_id == cMCOD_data.campaign_product_catalog_id
										&& cPCO.attribute_id == cMCOD_data.attribute_id
										&& cPCO.campaign_product_catalog_option_id == cMCOD_data.campaign_product_catalog_option_id
									);

									if (otherSameAttribute.length == 0) {
										axios.delete(`${env.clientHost}/campaign-product-catalog-option/${campaignProductCatalogOption.id}`).then(res => {
											if (res.status == 200) {
												let updateIndex = this.state.campaignProductCatalogOption.findIndex((cPCO) =>
													cPCO.campaign_product_catalog_id == cMCO_data.campaign_product_catalog_id
													&& cPCO.attribute_id == cMCO_data.attribute_id
												);
												let allCPCOData = this.state.campaignProductCatalogOption;
												allCPCOData.splice(updateIndex, 1);
												if (allCPCOData.length == 0) {
													campaignProductCatalogOption
												}
												this.setState({ campaignProductCatalogOption: allCPCOData });
											}
										});
									}
									this.setState({ campaignProductCatalogOptionDetail: allData });
								}
							});
						} else {
							// Store campaignProductCatalogOptionDetail
							axios.post(`${env.clientHost}/campaign-product-catalog-option-detail`, cMCOD_data).then(res => {
								if (res.status == 200
									&& res.data
									&& res.data.data
									&& res.data.data.id) {
									let allData = this.state.campaignProductCatalogOptionDetail || [];
									allData.push(res.data.data);
									this.setState({ campaignProductCatalogOptionDetail: allData });
								}
							});
						}
					});
				}
			});
		}
	}
	isFavColorAdded(cPCId, cPId, attributeId, optionValueName) {
		// debugger;
		let className = false;
		let cMCO_data = {
			campaign_product_catalog_id: cPCId,
			config_product_id: cPId,
			attribute_id: attributeId,
			product_option_required: 1,
			session_id: parseInt(localStorage.getItem('campaign-session'))
		}
		let campaignProductCatalogOption = this.state.campaignProductCatalogOption.find((cPCO) =>
			cPCO.campaign_product_catalog_id == cMCO_data.campaign_product_catalog_id
			&& cPCO.attribute_id == cMCO_data.attribute_id
		)
		if (campaignProductCatalogOption) {
			// Check first for campaign-product-catalog-option-detail in campaignProductCatalogOptionDetail if not found store campaign-product-catalog-option-detail.
			let cMCOD_data = {
				campaign_product_catalog_id: cPCId,
				campaign_product_catalog_option_id: campaignProductCatalogOption.id,
				attribute_id: attributeId,
				config_product_option_value: optionValueName,
				session_id: parseInt(localStorage.getItem('campaign-session'))
				//config_product_option_quantity:123
				//config_product_option_price:312
			}
			let campaignProductCatalogOptionDetail = this.state.campaignProductCatalogOptionDetail.find((cPCO) =>
				cPCO.campaign_product_catalog_id == cMCOD_data.campaign_product_catalog_id
				&& cPCO.attribute_id == cMCOD_data.attribute_id
				&& cPCO.campaign_product_catalog_option_id == cMCOD_data.campaign_product_catalog_option_id
				&& cPCO.config_product_option_value == cMCOD_data.config_product_option_value
			);

			if (campaignProductCatalogOptionDetail) {
				className = true;
			} else {
				className = false;
			}
		} else {
			className = false;
		}
		return className;
	}

	selectDefaultOptionDetail(cPCId, cPId, attributeId, optionValueName) {
		let cMCO_data = {
			campaign_product_catalog_id: cPCId,
			config_product_id: cPId,
			attribute_id: attributeId,
			product_option_required: 1,
		}
		let campaignProductCatalogOption = this.state.campaignProductCatalogOption.find((cPCO) =>
			cPCO.campaign_product_catalog_id == cMCO_data.campaign_product_catalog_id
			&& cPCO.attribute_id == cMCO_data.attribute_id
		)
		if (campaignProductCatalogOption) {
			let current_default_option = this.state.campaignProductCatalogOptionDetail.findIndex((cPCO) =>
				cPCO.campaign_product_catalog_id == cPCId
				&& cPCO.attribute_id == attributeId
				&& cPCO.campaign_product_catalog_option_id == campaignProductCatalogOption.id
				&& cPCO.is_default_option == true
			);

			let new_default_option = this.state.campaignProductCatalogOptionDetail.findIndex((cPCO) =>
				cPCO.campaign_product_catalog_id == cPCId
				&& cPCO.attribute_id == attributeId
				&& cPCO.campaign_product_catalog_option_id == campaignProductCatalogOption.id
				&& cPCO.config_product_option_value == optionValueName
			);

			if (current_default_option > -1 && new_default_option > -1 && new_default_option != current_default_option) {
				let cPCOD = this.state.campaignProductCatalogOptionDetail;

				axios.put(`${env.clientHost}/campaign-product-catalog-option-detail/${cPCOD[current_default_option].id}`, { is_default_option: false }).then((res) => {
					axios.put(`${env.clientHost}/campaign-product-catalog-option-detail/${cPCOD[new_default_option].id}`, { is_default_option: true }).then((_res) => {
						if (res.status == 200) {
							cPCOD[current_default_option].is_default_option = false;
							if (res.status == 200) {
								cPCOD[new_default_option].is_default_option = true;
								this.setState({
									campaignProductCatalogOptionDetail: cPCOD
								})
							} else {
								this.setState({
									campaignProductCatalogOptionDetail: cPCOD
								})
							}
						} else {
							this.setState({
								campaignProductCatalogOptionDetail: cPCOD
							})
						}
					})

				});
			} else if (current_default_option == -1 && new_default_option > -1) {
				let cPCOD = this.state.campaignProductCatalogOptionDetail;

				axios.put(`${env.clientHost}/campaign-product-catalog-option-detail/${cPCOD[new_default_option].id}`, { is_default_option: true }).then((res) => {
					if (res.status == 200) {
						cPCOD[new_default_option].is_default_option = true;
					}
					this.setState({
						campaignProductCatalogOptionDetail: cPCOD
					})

				});
			}
		}
	}


	addSize(cPCId, cPId, attributeId, optionValueName) {
		// Check first for campaign-product-catalog-option in campaignProductCatalogOption if not found store campaign-product-catalog-option.
		let cMCO_data = {
			campaign_product_catalog_id: cPCId,
			config_product_id: cPId,
			attribute_id: attributeId,
			product_option_required: 1,
			session_id: parseInt(localStorage.getItem('campaign-session'))
		}
		let campaignProductCatalogOption = this.state.campaignProductCatalogOption.find((cPCO) =>
			cPCO.campaign_product_catalog_id == cMCO_data.campaign_product_catalog_id
			&& cPCO.attribute_id == cMCO_data.attribute_id
		)
		if (campaignProductCatalogOption) {
			let is_default_option = this.state.campaignProductCatalogOptionDetail.findIndex((cPCO) =>
				cPCO.campaign_product_catalog_id == cPCId
				&& cPCO.attribute_id == attributeId
				&& cPCO.campaign_product_catalog_option_id == campaignProductCatalogOption.id
				&& cPCO.is_default_option == true
			);

			// Check first for campaign-product-catalog-option-detail in campaignProductCatalogOptionDetail if not found store campaign-product-catalog-option-detail.
			let cMCOD_data = {
				campaign_product_catalog_id: cPCId,
				campaign_product_catalog_option_id: campaignProductCatalogOption.id,
				attribute_id: attributeId,
				config_product_option_value: optionValueName,
				config_product_option_quantity: 100,
				config_product_option_price: 0,
				session_id: parseInt(localStorage.getItem('campaign-session')),
				is_default_option: is_default_option > -1 ? false : true,

				//config_product_option_quantity:123
				//config_product_option_price:312
			}
			let campaignProductCatalogOptionDetail = this.state.campaignProductCatalogOptionDetail.find((cPCO) =>
				cPCO.campaign_product_catalog_id == cMCOD_data.campaign_product_catalog_id
				&& cPCO.attribute_id == cMCOD_data.attribute_id
				&& cPCO.campaign_product_catalog_option_id == cMCOD_data.campaign_product_catalog_option_id
				&& cPCO.config_product_option_value == cMCOD_data.config_product_option_value
			);

			if (campaignProductCatalogOptionDetail && !campaignProductCatalogOptionDetail.is_default_option) {
				axios.delete(`${env.clientHost}/campaign-product-catalog-option-detail/${campaignProductCatalogOptionDetail.id}`).then(res => {
					if (res.status == 200) {

						let updateIndex = this.state.campaignProductCatalogOptionDetail.findIndex((cPCO) =>
							cPCO.campaign_product_catalog_id == cMCOD_data.campaign_product_catalog_id
							&& cPCO.attribute_id == cMCOD_data.attribute_id
							&& cPCO.campaign_product_catalog_option_id == cMCOD_data.campaign_product_catalog_option_id
							&& cPCO.config_product_option_value == cMCOD_data.config_product_option_value
						);
						let allData = this.state.campaignProductCatalogOptionDetail;
						allData.splice(updateIndex, 1);

						if (campaignProductCatalogOptionDetail.is_default_option) {
							let new_default_option = allData.findIndex((cPCO) =>
								cPCO.campaign_product_catalog_id == cPCId
								&& cPCO.attribute_id == attributeId
								&& cPCO.campaign_product_catalog_option_id == campaignProductCatalogOption.id
							);
							if (new_default_option > -1) {
								allData[new_default_option].is_default_option = true;
								axios.put(`${env.clientHost}/campaign-product-catalog-option-detail/${allData[new_default_option].id}`, { is_default_option: true }).then(res => { });
							}
						}
						let otherSameAttribute = allData.filter((cPCO) =>
							cPCO.campaign_product_catalog_id == cMCOD_data.campaign_product_catalog_id
							&& cPCO.attribute_id == cMCOD_data.attribute_id
							&& cPCO.campaign_product_catalog_option_id == cMCOD_data.campaign_product_catalog_option_id
						);

						if (otherSameAttribute.length == 0) {
							axios.delete(`${env.clientHost}/campaign-product-catalog-option/${campaignProductCatalogOption.id}`).then(res => {
								if (res.status == 200) {
									let updateIndex = this.state.campaignProductCatalogOption.findIndex((cPCO) =>
										cPCO.campaign_product_catalog_id == cMCO_data.campaign_product_catalog_id
										&& cPCO.attribute_id == cMCO_data.attribute_id
									);
									let _allData = this.state.campaignProductCatalogOption;
									_allData.splice(updateIndex, 1);
									if (_allData.length == 0) {
										campaignProductCatalogOption
									}
									this.setState({ campaignProductCatalogOption: _allData });
								}
							});
						}
						this.setState({ campaignProductCatalogOptionDetail: allData });
					}
				});
			} else if (!campaignProductCatalogOptionDetail) {
				// Store campaignProductCatalogOptionDetail
				axios.post(`${env.clientHost}/campaign-product-catalog-option-detail`, cMCOD_data).then(res => {
					if (res.status == 200
						&& res.data
						&& res.data.data
						&& res.data.data.id) {
						let allData = this.state.campaignProductCatalogOptionDetail || [];
						allData.push(res.data.data);
						this.setState({ campaignProductCatalogOptionDetail: allData });
					}
				});
			}
		} else {
			// Store campaignProductCatalogOption && campaignProductCatalogOptionDetail
			axios.post(`${env.clientHost}/campaign-product-catalog-option`, cMCO_data).then(res => {
				// console.log(res.data.data);
				if (res.status == 200
					&& res.data
					&& res.data.data
					&& res.data.data.id) {
					let campaignProductCatalogOption = [...this.state.campaignProductCatalogOption, ...[res.data.data]];
					this.setState({ campaignProductCatalogOption }, () => {
						let is_default_option = this.state.campaignProductCatalogOptionDetail.findIndex((cPCO) =>
							cPCO.campaign_product_catalog_id == cPCId
							&& cPCO.attribute_id == attributeId
							&& cPCO.campaign_product_catalog_option_id == campaignProductCatalogOption.id
							&& cPCO.is_default_option == true
						);

						let cMCOD_data = {
							campaign_product_catalog_id: cPCId,
							campaign_product_catalog_option_id: res.data.data.id,
							attribute_id: attributeId,
							config_product_option_value: optionValueName,
							config_product_option_quantity: 100,
							config_product_option_price: 0,
							is_default_option: is_default_option > -1 ? false : true,
							session_id: parseInt(localStorage.getItem('campaign-session'))
							//config_product_option_quantity:123
							//config_product_option_price:312
						}
						let campaignProductCatalogOptionDetail = this.state.campaignProductCatalogOptionDetail.find((cPCO) =>
							cPCO.campaign_product_catalog_id == cMCOD_data.campaign_product_catalog_id
							&& cPCO.attribute_id == cMCOD_data.attribute_id
							&& cPCO.campaign_product_catalog_option_id == cMCOD_data.campaign_product_catalog_option_id
							&& cPCO.config_product_option_value == cMCOD_data.config_product_option_value
						);

						if (campaignProductCatalogOptionDetail) {
							axios.delete(`${env.clientHost}/campaign-product-catalog-option-detail/${campaignProductCatalogOptionDetail.id}`).then(res => {
								if (res.status == 200) {

									let updateIndex = this.state.campaignProductCatalogOptionDetail.findIndex((cPCO) =>
										cPCO.campaign_product_catalog_id == cMCOD_data.campaign_product_catalog_id
										&& cPCO.attribute_id == cMCOD_data.attribute_id
										&& cPCO.campaign_product_catalog_option_id == cMCOD_data.campaign_product_catalog_option_id
										&& cPCO.config_product_option_value == cMCOD_data.config_product_option_value
									);
									let allData = this.state.campaignProductCatalogOptionDetail;
									allData.splice(updateIndex, 1);

									let otherSameAttribute = allData.filter((cPCO) =>
										cPCO.campaign_product_catalog_id == cMCOD_data.campaign_product_catalog_id
										&& cPCO.attribute_id == cMCOD_data.attribute_id
										&& cPCO.campaign_product_catalog_option_id == cMCOD_data.campaign_product_catalog_option_id
									);

									if (otherSameAttribute.length == 0) {
										axios.delete(`${env.clientHost}/campaign-product-catalog-option/${campaignProductCatalogOption.id}`).then(res => {
											if (res.status == 200) {
												let updateIndex = this.state.campaignProductCatalogOption.findIndex((cPCO) =>
													cPCO.campaign_product_catalog_id == cMCO_data.campaign_product_catalog_id
													&& cPCO.attribute_id == cMCO_data.attribute_id
												);
												let allCPCOData = this.state.campaignProductCatalogOption;
												allCPCOData.splice(updateIndex, 1);
												if (allCPCOData.length == 0) {
													campaignProductCatalogOption
												}
												this.setState({ campaignProductCatalogOption: allCPCOData });
											}
										});
									}
									this.setState({ campaignProductCatalogOptionDetail: allData });
								}
							});
						} else {
							// Store campaignProductCatalogOptionDetail
							axios.post(`${env.clientHost}/campaign-product-catalog-option-detail`, cMCOD_data).then(res => {
								if (res.status == 200
									&& res.data
									&& res.data.data
									&& res.data.data.id) {
									let allData = this.state.campaignProductCatalogOptionDetail || [];
									allData.push(res.data.data);
									this.setState({ campaignProductCatalogOptionDetail: allData });
								}
							});
						}
					});
				}
			});
		}
	}

	isSizeAdded(cPCId, cPId, attributeId, optionValueName) {
		// debugger;
		let isAdded = false;
		let cMCO_data = {
			campaign_product_catalog_id: cPCId,
			config_product_id: cPId,
			attribute_id: attributeId,
			product_option_required: 1,
		}
		let campaignProductCatalogOption = this.state.campaignProductCatalogOption.find((cPCO) =>
			cPCO.campaign_product_catalog_id == cMCO_data.campaign_product_catalog_id
			&& cPCO.attribute_id == cMCO_data.attribute_id
		)
		if (campaignProductCatalogOption) {
			// Check first for campaign-product-catalog-option-detail in campaignProductCatalogOptionDetail if not found store campaign-product-catalog-option-detail.
			let cMCOD_data = {
				campaign_product_catalog_id: cPCId,
				campaign_product_catalog_option_id: campaignProductCatalogOption.id,
				attribute_id: attributeId,
				config_product_option_value: optionValueName,
			}
			let campaignProductCatalogOptionDetail = this.state.campaignProductCatalogOptionDetail.find((cPCO) =>
				cPCO.campaign_product_catalog_id == cMCOD_data.campaign_product_catalog_id
				&& cPCO.attribute_id == cMCOD_data.attribute_id
				&& cPCO.campaign_product_catalog_option_id == cMCOD_data.campaign_product_catalog_option_id
				&& cPCO.config_product_option_value == cMCOD_data.config_product_option_value
			);

			if (campaignProductCatalogOptionDetail) {
				isAdded = true;
			} else {
				isAdded = false;
			}
		} else {
			isAdded = false;
		}
		return isAdded;
	}

	getCampaignMockupCatalog(cPC, cPCIndex) {
		const cP = this.state.configurableProducts.find((cP) => cPC.config_product_id == cP.id);
		const cPI = this.state.configurableProducts.findIndex((cP) => cPC.config_product_id == cP.id);
		// let shrtBasicColorAttributes = (cP && cP['shrt-config-prod-option-detail'] ? cP['shrt-config-prod-option-detail'] : []).filter((cPOD) => cPOD.attribute_id == this.state.shrtBasicColorAttributes.attributeId);
		let shrtFavouriteColorAttributes = (cP && cP['shrt-config-prod-option-detail'] ? cP['shrt-config-prod-option-detail'] : []).filter((cPOD) => cPOD.attribute_id == this.state.shrtFavouriteColorAttributes.attributeId);
		// let selectedBasicColors = (this.state.campaignProductCatalogOptionDetail || []).filter((cPCOD) => cPCOD.campaign_product_catalog_id == cPC.id && cPCOD.attribute_id == this.state.shrtBasicColorAttributes.attributeId).map(cPCOD => cPCOD.config_product_option_value);
		let selectedFavColors = (this.state.campaignProductCatalogOptionDetail || []).filter((cPCOD) => cPCOD.campaign_product_catalog_id == cPC.id && cPCOD.attribute_id == this.state.shrtFavouriteColorAttributes.attributeId).map(cPCOD => cPCOD.config_product_option_value);
		let defaultColor = (this.state.campaignProductCatalogOptionDetail || []).find((cPCOD) => cPCOD.campaign_product_catalog_id == cPC.id && cPCOD.attribute_id == this.state.shrtFavouriteColorAttributes.attributeId && cPCOD.is_default_option);

		let shrtSizeAttributes = (cP && cP['shrt-config-prod-option-detail'] ? cP['shrt-config-prod-option-detail'] : []).filter((cPOD) => cPOD.attribute_id == this.state.shrtSizeAttributes.attributeId);
		let selectedSize = (this.state.campaignProductCatalogOptionDetail || []).filter((cPCOD) => cPCOD.campaign_product_catalog_id == cPC.id && cPCOD.attribute_id == this.state.shrtSizeAttributes.attributeId).map(cPCOD => cPCOD.config_product_option_value);
		let defaultSize = (this.state.campaignProductCatalogOptionDetail || []).find((cPCOD) => cPCOD.campaign_product_catalog_id == cPC.id && cPCOD.attribute_id == this.state.shrtSizeAttributes.attributeId && cPCOD.is_default_option);

		const style = {
			background: '#000000',
			color: '#ffffff'
		}
		if (cP && cPI > -1) {
			return (
				<div className="box-product" key={`ocp_configurable_product_${cP.id}`}>
					<h4>{cP.product_name}</h4>
					<span className="close-img" onClick={() => this.removeSelProd(cP, cPI)}><i className="fas fa-times"></i></span>
					<div className="row">
						<div className="col-md-8">
							<div className="pro-title-sidebar">Define Product Colors ({selectedFavColors.length}/{shrtFavouriteColorAttributes.length})</div>
							<div className={shrtFavouriteColorAttributes.length > 0 ? "color-select-list" : "d-none"}>
								{
									shrtFavouriteColorAttributes.filter((option) => selectedFavColors.indexOf(option.config_product_option_value) > -1).map((option, optionIndex) => <div key={`sel_list_color_${optionIndex}_${option.attribute_id}`} className={defaultColor && defaultColor.config_product_option_value == option.config_product_option_value ? "list-color selected" : "list-color"} style={{ backgroundColor: option.config_product_option_value }} onClick={() => this.selectDefaultOptionDetail(cPC.id, cP.id, this.state.shrtFavouriteColorAttributes.attributeId, option.config_product_option_value)}></div>)
								}
								<div className="list-color-add" onClick={() => { this.addMoreColor(cPCIndex) }}><i className="fa fa-plus" aria-hidden="true"></i></div>
							</div>
							{/* <div className={shrtSizeAttributes.length > 0 ? "pro-title-sidebar" : "d-none"}>Define Product Size ({selectedSize.length}/{shrtSizeAttributes.length})</div>
							<div className={shrtSizeAttributes.length > 0 ? "color-select-list" : "d-none"}>
								{
									shrtSizeAttributes.filter((option) => selectedSize.indexOf(option.config_product_option_value) > -1).map((option, optionIndex) => <div key={`sel_list_color_${optionIndex}_${option.attribute_id}`} className={defaultSize && defaultSize.config_product_option_value == option.config_product_option_value ? "list-size selected" : "list-size"} onClick={() => this.selectDefaultOptionDetail(cPC.id, cP.id, this.state.shrtSizeAttributes.attributeId, option.config_product_option_value)} >{option.config_product_option_value}</div>)
								}
								<div className="list-color-add" onClick={() => { this.addMoreColor(cPCIndex) }}><i className="fa fa-plus" aria-hidden="true"></i></div>
							</div> */}
							<div className="row price-profit">
								<div className="col-md-6">
									<Form ref={reff => this.formRef[cPCIndex] = reff} onSubmit={e => this.handleSubmit(e, cPCIndex)}>
										<label htmlFor="">Price</label>
										<span className="price-bg">
											<Input type="number"
												minLength={cP.actual_price || 0}
												value={cPC.sales_price || 0}
												onChange={(e) => this.addProductPrice(e, cPCIndex)}
												validations={[min]} />
										</span>
									</Form>
								</div>
								<div className="col-md-6">
									<label htmlFor="">Profit Per Sale</label>
									<span>€ {parseFloat((cPC.sales_price || 0) - cP.actual_price || 0).toFixed(2)}</span>
								</div>
							</div>
						</div>
						<div className="col-md-4">
							<div className="pro-sidebar-img text-center" >{/* style={{ background: '#000000' }} */}
								{
									this.getConfigProdCanvas(cP, cPI, true)
								}
							</div>
						</div>
					</div>
					<div className={this.state.addMoreColor == cPCIndex ? "more-color-panel" : "d-none"}>
						<span className="close-img" onClick={() => { this.addMoreColor(-1) }}><i className="fas fa-times"></i></span>
						{/* <div className="main-product-color">
							<h5>Please select your main product color</h5>
							<div className="fav-color-list color-select-list">
								{
									shrtBasicColorAttributes.map((option, optionIndex) => <div key={`basic_list_color_${optionIndex}_${option.attribute_id}`} className={this.isBasicColorAdded(cPC.id, cP.id, this.state.shrtBasicColorAttributes.attributeId, option.config_product_option_value)} style={{ backgroundColor: option.config_product_option_value }} onClick={() => this.addBasicColor(cPC.id, cP.id, this.state.shrtBasicColorAttributes.attributeId, option.config_product_option_value)}></div>)
								}
							</div>
						</div> */}
						<div className={shrtFavouriteColorAttributes.length > 0 ? "favourite-product-color" : "d-none"}>
							<h5>Please select your favourite product colors</h5>
							<div className="fav-color-list">
								{
									shrtFavouriteColorAttributes.map((option, optionIndex) => <div key={`basic_list_color_${optionIndex}_${option.attribute_id}`} className="list-color" style={{ backgroundColor: option.config_product_option_value }} onClick={() => this.addFavColor(cPC.id, cP.id, this.state.shrtFavouriteColorAttributes.attributeId, option.config_product_option_value)}>
										{/* {this.isFavColorAdded(cPC.id, cP.id, this.state.shrtFavouriteColorAttributes.attributeId, option.config_product_option_value)} */}
										{
											selectedFavColors.indexOf(option.config_product_option_value) > -1 ? <i className="fa fa-check"></i> : <></>
										}
									</div>)
								}
							</div>
						</div>
						<div className={shrtFavouriteColorAttributes.length > 0 ? "favourite-product-color" : "d-none"}>
							<h5>Please select your main product colors</h5>
							<div className="fav-color-list color-select-list">
								{
									shrtFavouriteColorAttributes.filter((option) => selectedFavColors.indexOf(option.config_product_option_value) > -1).map((option, optionIndex) => <div key={`basic_list_color_${optionIndex}_${option.attribute_id}`} className={defaultColor && defaultColor.config_product_option_value == option.config_product_option_value ? "list-color selected" : "list-color"} style={{ backgroundColor: option.config_product_option_value }} data-optionid={option.id} onClick={() => this.selectDefaultOptionDetail(cPC.id, cP.id, this.state.shrtFavouriteColorAttributes.attributeId, option.config_product_option_value)}></div>)
								}
							</div>
						</div>

						{/* <div className={shrtSizeAttributes.length > 0 ? "main-product-color" : "d-none"}>
							<h5>Please select your product size</h5>
							<div className="fav-color-list">
								{
									shrtSizeAttributes.map((option, optionIndex) =>
										<div
											className={selectedSize.indexOf(option.config_product_option_value) > -1 ? "list-size selected" : "list-size"}
											key={`size_list_${optionIndex}_${option.attribute_id}`}
											onClick={(e) => this.addSize(cPC.id, cP.id, this.state.shrtSizeAttributes.attributeId, option.config_product_option_value)}>
											{option.config_product_option_value}
										</div>
									)
								} */}

						{/* <div className="btn-group btn-group-toggle" data-toggle="buttons"> */}
						{/* <label className="btn btn-secondary active">
									<input type="radio" name="options" id="option1" autocomplete="off" checked /> Active
								</label>
								<label className="btn btn-secondary">
									<input type="radio" name="options" id="option2" autocomplete="off" /> Radio
								</label>
								<label className="btn btn-secondary">
									<input type="radio" name="options" id="option3" autocomplete="off" /> Radio
								</label> */}
						{/* {
										shrtSizeAttributes.map((option, optionIndex) =>
											<label className="btn btn-secondary" key={`size_list_${optionIndex}_${option.attribute_id}`}>
												<input 
													type="checkbox" 
													name="size" 
													id={`size_list_${optionIndex}_${option.attribute_id}`} 
													autoComplete="off" 
													defaultChecked={selectedSize.indexOf(option.config_product_option_value) > -1 }
													onChange={(e) => this.addSize(cPC.id, cP.id, this.state.shrtSizeAttributes.attributeId, option.config_product_option_value)}
												 /> {selectedSize.indexOf(option.config_product_option_value)}{option.config_product_option_value}
											</label>
										)
									} */}
						{/* <div key={`size_list_${optionIndex}_${option.attribute_id}`} className={'list-size'} >
										<button type="button" className="btn btn-primary" data-toggle="button" aria-pressed="false" autocomplete="off">{option.config_product_option_value}</button>										
									</div> */}
						{/* </div> */}
						{/* </div>
						</div> */}
						{/* <div className={shrtSizeAttributes.length > 0 ? "main-product-color" : "d-none"}>
							<h5>Please select your main product size</h5>
							<div className="fav-color-list">
								{
									shrtSizeAttributes.filter((option) => selectedSize.indexOf(option.config_product_option_value) > -1).map((option, optionIndex) =>
										<div
											className={defaultSize && defaultSize.config_product_option_value ==  option.config_product_option_value ? "list-size selected" : "list-size"}
											key={`size_list_${optionIndex}_${option.attribute_id}`}
											onClick={() => this.selectDefaultOptionDetail(cPC.id, cP.id, this.state.shrtSizeAttributes.attributeId, option.config_product_option_value)}>
											{option.config_product_option_value}
										</div>
									)
								}
							</div>
						</div> */}
					</div>
				</div>
			)
		}

	}



	getSelectedCampaignProduct(selectedCampaignProduct, sCPIndex) {
		const cP = this.state.configurableProducts.find((cP) => selectedCampaignProduct.config_product_id == cP.id);
		const cPI = this.state.configurableProducts.findIndex((cP) => selectedCampaignProduct.config_product_id == cP.id);
		
		if (this.state.selectedCampaignProducts.findIndex((_scp) => _scp.is_main_product) == -1 && sCPIndex == 0) {
			// console.log(sCP, sCPIndex);
			let sCP = this.state.selectedCampaignProducts;
			sCP[sCPIndex].is_main_product = true;
			this.setState({ selectedCampaignProducts: sCP })
			
		}

		let shrtFavouriteColorAttributes = selectedCampaignProduct.shrtFavouriteColorAttributes || [];
		let selectedFavColors = (selectedCampaignProduct.optionDetails || []).filter((oPD) => oPD.attribute_id == this.state.shrtFavouriteColorAttributes.attributeId).map(cPCOD => cPCOD.config_product_option_value);
		let defaultColor = (selectedCampaignProduct.optionDetails || []).find((oPD) => oPD.attribute_id == this.state.shrtFavouriteColorAttributes.attributeId && oPD.is_default_option);
		if (!defaultColor) {
			defaultColor = (selectedCampaignProduct.optionDetails || []).find((oPD) => oPD.attribute_id == this.state.shrtFavouriteColorAttributes.attributeId);
		}
		const addProductPrice = (e) => {
			let sCP = this.state.selectedCampaignProducts;
			sCP[sCPIndex].sales_price = e.target.value;
			this.setState({ selectedCampaignProducts: sCP })
		}
		const addFavColor = (optionDetails) => {
			let isOptionAdded = (selectedCampaignProduct.options || []).findIndex((oPD) => oPD.attribute_id == this.state.shrtFavouriteColorAttributes.attributeId);
			let isOptionDetailsAdded = (selectedCampaignProduct.optionDetails || []).findIndex((oPD) => oPD.attribute_id == this.state.shrtFavouriteColorAttributes.attributeId && oPD.config_product_option_value == optionDetails.config_product_option_value);
			let colorsAvailable = (selectedCampaignProduct.optionDetails || []).filter((oPD) => oPD.attribute_id == this.state.shrtFavouriteColorAttributes.attributeId);
			if (isOptionAdded > -1) {
				if (isOptionDetailsAdded > -1 && colorsAvailable.length > 1) {
					selectedCampaignProduct.optionDetails.splice(isOptionDetailsAdded, 1)
					let optionDetailsLength = (selectedCampaignProduct.optionDetails || []).filter((oPD) => oPD.attribute_id == this.state.shrtFavouriteColorAttributes.attributeId);
					if (optionDetailsLength == 0) {
						selectedCampaignProduct.options.splice(isOptionAdded, 1)
					}
				} else {
					selectedCampaignProduct.optionDetails.push({
						attribute_id: this.state.shrtFavouriteColorAttributes.attributeId,
						config_product_option_price: optionDetails.config_product_option_price,
						config_product_option_quantity: optionDetails.config_product_option_quantity,
						config_product_option_value: optionDetails.config_product_option_value,
						is_default_option: optionDetails.is_default_option,
						session_id: parseInt(localStorage.getItem('campaign-session'))
					});
				}
			} else {
				selectedCampaignProduct.options.push({
					product_option_required: true,
					attribute_id: this.state.shrtFavouriteColorAttributes.attributeId,
					session_id: parseInt(localStorage.getItem('campaign-session'))
				});
				selectedCampaignProduct.optionDetails.push({
					attribute_id: this.state.shrtFavouriteColorAttributes.attributeId,
					config_product_option_price: optionDetails.config_product_option_price,
					config_product_option_quantity: optionDetails.config_product_option_quantity,
					config_product_option_value: optionDetails.config_product_option_value,
					is_default_option: optionDetails.is_default_option,
					session_id: parseInt(localStorage.getItem('campaign-session'))
				});
			}
			let sCP = this.state.selectedCampaignProducts;
			sCP[sCPIndex] = selectedCampaignProduct;
			this.setState({ selectedCampaignProducts: sCP })
		}

		const selectDefaultOptionDetail = (optionDetails) => {
			let optionDetailsIndex = (selectedCampaignProduct.optionDetails || []).findIndex((oPD) => oPD.attribute_id == this.state.shrtFavouriteColorAttributes.attributeId && oPD.config_product_option_value == optionDetails.config_product_option_value);
			if (optionDetailsIndex > -1) {
				selectedCampaignProduct.optionDetails = selectedCampaignProduct.optionDetails.map((oPD) => {
					return {
						...oPD,
						is_default_option: oPD.attribute_id == this.state.shrtFavouriteColorAttributes.attributeId ? false : oPD.is_default_option
					}
				});
				selectedCampaignProduct.optionDetails[optionDetailsIndex].is_default_option = true;
				let sCP = this.state.selectedCampaignProducts;
				sCP[sCPIndex] = selectedCampaignProduct;
				this.setState({ selectedCampaignProducts: sCP });
			}
		}

		const removeSelProd = () => {
			let sCP = this.state.selectedCampaignProducts;
			sCP.splice(sCPIndex, 1);
			this.setState({ selectedCampaignProducts: sCP })
		}

		if (cP) {
			return (
				<div className="box-product" key={`configurable_product_${cP.id}`}>
					<h4>{cP.product_name}</h4>
					<span className="close-img" onClick={() => removeSelProd()}><i className="fas fa-times"></i></span>{/* onClick={() => this.removeSelProd(cP, cPI)} */}
					<div className="row">
						<div className="col-md-8">
							<div className="pro-title-sidebar">Define Product Colors ({selectedFavColors.length}/{shrtFavouriteColorAttributes.length})</div>
							<div className={shrtFavouriteColorAttributes.length > 0 ? "color-select-list" : "d-none"}>
								{
									shrtFavouriteColorAttributes.filter((option) => selectedFavColors.indexOf(option.config_product_option_value) > -1).map((option, optionIndex) => <div key={`sel_list_color_${optionIndex}_${option.attribute_id}`} className="list-color" style={{ backgroundColor: option.config_product_option_value, color:selectedOptionTickColorDecider(option.config_product_option_value) }} onClick={() => selectDefaultOptionDetail(option)}>
                                        {
                                            defaultColor && defaultColor.config_product_option_value == option.config_product_option_value ? <i className="fa fa-check" style={{color:selectedOptionTickColorDecider(option.config_product_option_value) }}></i> : <></>
                                        }
                                    </div>)
								}
								<div className="list-color-add" onClick={() => { this.addMoreColor(sCPIndex) }}><i className="fa fa-plus" aria-hidden="true"></i></div>
							</div>

							<div className="row price-profit">
								<div className="col-md-6">
									<Form ref={reff => this.formRef[sCPIndex] = reff}>{/* onSubmit={e => this.handleSubmit(e, sCPIndex)} */}
										<label htmlFor="">Price</label>
										<span className="price-bg">
											<Input type="number"
												minLength={selectedCampaignProduct.actual_price || 0}
												value={selectedCampaignProduct.sales_price || 0}
												onChange={(e) => addProductPrice(e)}
												validations={[min]} />
										</span>
									</Form>
								</div>
								<div className="col-md-6">
									<label htmlFor="">Profit Per Sale</label>
									<span>€ {parseFloat((selectedCampaignProduct.sales_price || 0) - selectedCampaignProduct.actual_price || 0).toFixed(2)}</span>
								</div>
							</div>
						</div>
						<div className="col-md-4">
							<div className="pro-sidebar-img text-center" >{/* style={{ background: '#000000' }} */}
								{
									this.getConfigProdCanvas(cP, cPI, true)
								}
							</div>
						</div>
					</div>
					<div className={this.state.addMoreColor == sCPIndex ? "more-color-panel" : "d-none"}>
						<span className="close-img" onClick={() => { this.addMoreColor(-1) }}><i className="fas fa-times"></i></span>
						<div className={shrtFavouriteColorAttributes.length > 0 ? "favourite-product-color" : "d-none"}>
							<h5>Please select your favourite product colors</h5>
							<div className="fav-color-list">
								{
									shrtFavouriteColorAttributes.map((option, optionIndex) => <div key={`basic_list_color_${optionIndex}_${option.attribute_id}`} className="list-color" style={{ backgroundColor: option.config_product_option_value, color:selectedOptionTickColorDecider(option.config_product_option_value)   }} onClick={() => addFavColor(option)}
									>										
										{
                                            selectedFavColors.indexOf(option.config_product_option_value) > -1 ? <i className="fa fa-check" style={{color:selectedOptionTickColorDecider(option.config_product_option_value) }}></i> : <></>
                                        }
									</div>)
								}
							</div>
						</div>
						<div className={shrtFavouriteColorAttributes.length > 0 ? "favourite-product-color" : "d-none"}>
							<h5>Please select your main product colors</h5>
							<div className="fav-color-list color-select-list">
								{
									shrtFavouriteColorAttributes.filter((option) => selectedFavColors.indexOf(option.config_product_option_value) > -1).map((option, optionIndex) => <div key={`basic_list_color_${optionIndex}_${option.attribute_id}`} className="list-color" style={{ backgroundColor: option.config_product_option_value }} data-optionid={option.id} onClick={() => selectDefaultOptionDetail(option)}>
                                        {
                                            defaultColor && defaultColor.config_product_option_value == option.config_product_option_value ? <i className="fa fa-check" style={{color:selectedOptionTickColorDecider(option.config_product_option_value) }}></i> : <></>
                                        }
                                    </div>)
								}
							</div>
						</div>

					</div>
				</div>
			)
		}

	}

	getAllColors() {
		let mergedColor = [...this.state.shrtFavouriteColorAttributes.optionDetail]; // ...this.state.shrtBasicColorAttributes.optionDetail,
		let filterUnique = [];
		mergedColor = mergedColor.map((color) => color.optionValue);
		filterUnique = Array.from(new Set(mergedColor));
		// console.log(filterUnique);
		return filterUnique.map((color) => (<div className={this.state.filteredColor == color ? "color-list active" : "color-list"} style={{ backgroundColor: color }} key={`col_${color}`} onClick={() => { this.filterColor(color) }}></div>));
	}


	render() {
		return (
			<div className="row m-0">
				<div className="col-md-8 p-5 more-great-product">
					<div className="row top-row">
						<div className="col-md-6">
							<h4>Your design on even more great products</h4>
							{/* <p>{this.state.filteredCategories ? this.state.categories_data.find(cat => cat.id == this.state.filteredCategories).name + ' (' + this.state.filteredProducts.length + ' Items)' || '' : ''}</p> */}
						</div>
						<div className="col-md-6 pt-5 text-right">
							<div className="back-view">
								<em>Light Colors Mockups</em>
								<label className="switch">
									<input type="checkbox" onChange={(e) => { this.updateMockUp(e) }} defaultChecked={this.state.lightDarkMockup} />
									<span className="slider round"></span>
								</label>
							</div>
							<div className="info-element">
								<a href="#">
									<i className="fas fa-info-circle"></i>
								</a>
								<div className="info-text">Switch to see your design on the dark or light color products</div>
							</div>
						</div>
					</div>
					<div className="row cate-product">
						<div className="col">
							{
								this.state.isCategoriesLoading ?
									[1, 2, 3, 4, 5].map((_b) =>
										<button className="btn-primary loading" key={`_b_c_${_b}`}>Loading </button>
									)
									: <></>
							}
							{
								this.state.categories.map((cat) => <button className={this.state.filteredCategories == cat.categoryId ? "btn-primary" : "btn-default"} key={`cat_${cat.categoryId}`} onClick={() => { this.filterCat(cat.categoryId) }}>{cat.categoryName}</button>)
							}
						</div>
					</div>
					<div className="row sub-category">
						<div className="col-md-6">
							{
								this.state.isSubCategoriesLoading ?
									[1, 2, 3, 4, 5].map((_b) =>
										<a className="loading" key={`_b_c_${_b}`}>Loading </a>
									)
									: <></>
							}
							{
								(this.state.subCategory || []).map((sub_cat) => {
									if (this.state.filteredCategories && sub_cat.categoryId == this.state.filteredCategories) {
										return (<a key={`sub_cat_${sub_cat.subCategoryId}`} className={this.state.filteredSubcategories == sub_cat.subCategoryId ? "active" : ""} onClick={() => { this.filterSubcat(sub_cat.subCategoryId) }}>{sub_cat.subCategoryName}</a>)
									}
								})
							}
						</div>
						{
							this.state.isColorsLoading ?
								<div className="col-md-6 color-filter loading"></div>
								:
								<div className="col-md-6 color-filter">
									<label htmlFor="">Color Filter:</label>
									{
										this.getAllColors()
									}
								</div>
						}
					</div>
					<div className="row pro-list-collection">
						{
							this.state.isConfigurableProductsLoading ?
								[1, 2, 3].map((_p) =>
									<div className="col-md-3 added-product" key={`_ploading_${_p}`}>
										<div className="bg-white text-center">
											<div className="pro-title"><span className="loading">BASIC</span></div>
											<div className="image-bg-set d-inline-block loading">
												<img src="images/product-t-shirt.svg" alt="" />
											</div>
											<div className="product-switch">
												<label className="switch loading">
													<input type="checkbox" />
													<span className="slider round"></span>
												</label>
											</div>
										</div>
									</div>
								)
								: <></>

						}
						{
							this.state.filteredProducts.map((configProd, configProdIndex) => this.getConfigProd(configProd, configProdIndex))
						}
					</div>
				</div>
				<div className="col-md-4 p-0">
					<div className="step">
						<ul>
							<li>
								<a onClick={() => { this.props.updatePropsData({ activeStep: 'step-1' }) }}><span>1</span>Upload<br />Design</a>{/* onClick={() => { Router.push(`${env.proxyroute}/step-1`) }} */}
							</li>
							<li>
								<a className="active"><span>2</span>Price &amp; <br />Variations</a>
							</li>
							<li>
								<a onClick={(e) => { this.nextStep(e) }}><span>3</span>Setting &amp; <br />Publish</a>
							</li>
						</ul>
					</div>
					<div className="bg-white height-100vh clearfix">
						<div className="product-list-sidebar">
							{
								this.state.isCampaignProductCatalogsLoading ?
									[1, 2, 3].map((_p) =>
										<div className="box-product" key={`_p_side_loading_${_p}`}>
											<h4><span className="loading">Basic</span></h4>
											{/* <span className="close-img"><i className="fas fa-times"></i></span>                          */}
											<div className="row">
												<div className="col-md-8">
													<div className="pro-title-sidebar"><span className="loading">Define Product Colors (11/12)</span></div>
													<div className="color-select-list loading">
														<div className="list-color-add"><i className="fa fa-plus" aria-hidden="true"></i></div>
													</div>
													<div className="row price-profit">
														<div className="col-md-6">
															<label htmlFor="" className="loading">Price</label>
															<span className="price-bg loading">€ --,--</span>
														</div>
														<div className="col-md-6">
															<label htmlFor="" className="loading">Profit Per Sale</label>
															<span className="loading">€--,--</span>
														</div>
													</div>
												</div>
												<div className="col-md-4">
													<div className="pro-sidebar-img text-center loading">
														<img height="117" src="images/product-t-shirt.svg" alt="" />
													</div>
												</div>
											</div>
										</div>

									)
									: <></>
							}
							{/* {
								this.state.campaignProductCatalogs.map((cPC, cPCIndex) => this.getCampaignMockupCatalog(cPC, cPCIndex))
							} */}
							{
								this.state.selectedCampaignProducts.map((c, cI) => this.getSelectedCampaignProduct(c, cI))
							}
							<div className="empty-box-product">&nbsp;</div>
							<div className="bottom-btn">
								<div className="row">
									<div className="col-md-6">
										{/* <Link href={env.proxyroute + "/step-2"}> */}
										<a className="back-btn" onClick={() => { this.props.updatePropsData({ activeStep: 'step-2' }) }}>Back</a>
										{/* </Link> */}
									</div>
									<div className="col-md-6">
										<a className="next-btn" onClick={() => { this.nextStep() }}>Save</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

AddProductsComponent.propTypes = {

}

export default AddProductsComponent;
