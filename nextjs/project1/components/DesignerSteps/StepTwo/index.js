import React, { Component } from 'react';
import axios from "axios";
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import { env } from '../../../configs/env';
import { loadingService } from '../../../core/components/Loader/loader.service';
import { min } from '../../../core/utils/validators';
import { toastify } from "../../../core/utils/toastify";
import DesignerTemplate from '../../../core/components/DesignerTemplate';
import AddDesignerTemplate from '../../../core/components/DesignerTemplate/addTemplate';
import DynamicImageLoader from '../../../core/components/DynamicImageLoader';
import { priceCalculation } from '../../../core/services/designer-steps.service';
import { selectedOptionTickColorDecider } from '../../../core/services/designer-steps.service';

class StepTwoComponent extends Component {

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

	selectedCampaignMockupTypeId(props) {
		if (props.campaignMockupCatalog && props.campaignMockupCatalog.length > 0) {
			let campaign_mockup_type_id = props.campaignMockupCatalog.find(c => c.campaign_mockup_type_id).campaign_mockup_type_id;
			return campaign_mockup_type_id;
		} else {
			return 1;
		}
	}

	backCampaignMockupTypeId() {
		let campaignMockupType = (this.state.campaignMockupType || []).find(c => (c.title == 'back' || c.title == 'Back') && c.mockup_type_id == this.state.mockUpSelectedId);
		if (campaignMockupType) {
			return campaignMockupType.id
		} else {
			return this.state.campaignMockupTypeSelectedId;
		}
	}

	getCampaignMockupType() {
		if (this.props.campaignMockupCatalog && this.props.campaignMockupCatalog.length > 0) {
			let display_mockup_type_id = this.props.campaignMockupCatalog.find(c => c.display_mockup_type_id).display_mockup_type_id;
			let mockupType = this.props.mockupType.find(m => m.id == display_mockup_type_id);
			if (mockupType && mockupType['shrt-campaign-mockup-type']) {
				return (mockupType['shrt-campaign-mockup-type'] || []).map((campaignMockupType, i) => {
					return {
						...campaignMockupType,
						isActive: i == 0
					}
				});
			} else {
				return (this.props.campaignMockupType || []).map((campaignMockupType, i) => {
					return {
						...campaignMockupType,
						isActive: i == 0
					}
				});
			}
		} else {
			return (this.props.campaignMockupType || []).map((campaignMockupType, i) => {
				return {
					...campaignMockupType,
					isActive: i == 0
				}
			});
		}
	}

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
		super(props)
		// debugger
		this.state = {
			isCampaignProductCatalogsLoading: props.isCampaignProductCatalogsLoading,

			// States
			mockUpSelectedId: this.selectedMockupTypeId(props),
			campaignMockupTypeSelectedId: this.selectedCampaignMockupTypeId(props),
			// Filter
			addMoreColor: -1,
			lightDarkMockup: false, // true - dark.

			// Img b64
			frontImg: '',

			// Cavnas Implemenation
			canvas_color: false,
			display_canvas: false,

			// SHRT
			categoryGroup: props.categoryGroup,
			categories: props.categories,
			subCategory: props.subCategory,
			campaignSession: props.campaignSession,
			isNewCampaignSession: props.isNewCampaignSession,
			mockupType: props.mockupType,
			campaignMockupType: this.getCampaignMockupType(),
			campaignMockupCatalog: props.campaignMockupCatalog,
			designLibrary: props.designLibrary,
			canvas: props.canvas,
			configurableProducts: props.configurableProducts,
			campaignProductCatalogs: props.campaignProductCatalogs,
			campaignProductCatalogOption: props.campaignProductCatalogOption,
			campaignProductCatalogOptionDetail: props.campaignProductCatalogOptionDetail,
			shrtFavouriteColorAttributes: props.shrtFavouriteColorAttributes,
			shrtSizeAttributes: props.shrtSizeAttributes,
			designerTemplate: props.designerTemplate,
			openLoadTemplate: false,
			openSaveTemplate: false,
			selectedCampaignProducts: props.selectedCampaignProducts && props.selectedCampaignProducts.length > 0 ? props.selectedCampaignProducts : this.getCampaignProduct(props)


		};
		this.formRef = props.campaignProductCatalogs.map(f => React.createRef());
		this.forceUpdateHandler = this.forceUpdateHandler.bind(this);
		this.addTemplate = this.addTemplate.bind(this);
		this.updateDesignerTemplate = this.updateDesignerTemplate.bind(this);

	}

	changeMainFrm({ target }) {
		if (target.checked) {
			var main_frm = this.backCampaignMockupTypeId();
		} else {
			var main_frm = this.selectedCampaignMockupTypeId(this.props);
		}
		this.setState({ campaignMockupTypeSelectedId: main_frm });
	}

	componentWillReceiveProps(nextProps) {
			this.setState(nextProps, () => {
				this.forceUpdateHandler(nextProps);
				if (!nextProps.isDesignerTemplateLoading && !nextProps.isConfigurableProductsLoading && !nextProps.isCampaignProductCatalogsLoading) {
					this.checkDefaultProductLoaded();
				}
			});
	}
	forceUpdateHandler(nextProps) {
		this.setState({
			mockUpSelectedId: this.selectedMockupTypeId(nextProps),
			mockupType: this.listMockupType(),
			campaignMockupType: this.getCampaignMockupType(),
			campaignMockupTypeSelectedId: this.selectedCampaignMockupTypeId(nextProps),
			selectedCampaignProducts: nextProps.selectedCampaignProducts && nextProps.selectedCampaignProducts.length > 0 ? nextProps.selectedCampaignProducts : this.getCampaignProduct(nextProps)		}, () => {
			this.componentDidMount();
			this.forceUpdate();
		});
	};

	checkDesignAdded() {
	}

	checkMainProduct() {
		let is_main_product = this.state.campaignProductCatalogs.findIndex(cPC => cPC.is_main_product);
		if (is_main_product == -1) {
			this.addMainProduct(0);
		}
	}
	componentDidMount() {
			this.loadJSON().then(() => {
				this.checkDesignAdded();
                this.checkMainProduct();
                this.checkDefaultProductLoaded();
			})
	}
	checkDefaultProductLoaded() {
		let isAlreadyLoaded = localStorage.getItem('loadDefaultProducts');
		if (!isAlreadyLoaded || JSON.parse(isAlreadyLoaded) == false) {
			let defaultConfigurableProducts = this.state.configurableProducts.filter((t) => t.is_default_template);
			let defaultTemp = this.state.designerTemplate.find((t) => t.is_default_template);
			if (defaultTemp && defaultTemp['shrt-designer-template-products'] && defaultTemp['shrt-designer-template-products'].length > 0) {
				(defaultTemp['shrt-designer-template-products'] || []).forEach((tmpProd, tmpProdIndex) => {
					let isAdded = (this.state.campaignProductCatalogs || []).findIndex(c => c.config_product_id == tmpProd.config_product_id);
					if (isAdded == -1) {
						const configProd = this.state.configurableProducts.find((c) => c.id == tmpProd.config_product_id);
						if (configProd) {
							this.selectProducts(configProd)
						}
					}
				})
			} else if (defaultConfigurableProducts && defaultConfigurableProducts.length > 0) {
				(defaultConfigurableProducts || []).forEach((configProd, configProdIndex) => {
					let isAdded = (this.state.campaignProductCatalogs || []).findIndex(c => c.config_product_id == configProd.id);
					if (isAdded == -1) {
						if (configProd) {
							this.selectProducts(configProd)
						}
					}
				})
			}
		}
	}

	selectProductsDefaultOptions(cPC, cP) {
		let shrtFavouriteColorAttributes = (cP && cP['shrt-config-prod-option-detail'] ? cP['shrt-config-prod-option-detail'] : []).find((cPOD) => cPOD.attribute_id == this.state.shrtFavouriteColorAttributes.attributeId && cPOD.is_default_option);
		if (!shrtFavouriteColorAttributes) {
			shrtFavouriteColorAttributes = (cP && cP['shrt-config-prod-option-detail'] ? cP['shrt-config-prod-option-detail'] : []).find((cPOD) => cPOD.attribute_id == this.state.shrtFavouriteColorAttributes.attributeId);
		}

		if (shrtFavouriteColorAttributes && shrtFavouriteColorAttributes.config_product_option_value) {
			this.addFavColor(cPC.id, cP.id, this.state.shrtFavouriteColorAttributes.attributeId, shrtFavouriteColorAttributes.config_product_option_value)
		}

		let shrtSizeAttributes = (cP && cP['shrt-config-prod-option-detail'] ? cP['shrt-config-prod-option-detail'] : []).filter((cPOD) => cPOD.attribute_id == this.state.shrtSizeAttributes.attributeId);

		if (shrtSizeAttributes.length > 0) {
			shrtSizeAttributes.forEach((option) => {
				if (option && option.config_product_option_value) {
					this.addSize(cPC.id, cP.id, this.state.shrtSizeAttributes.attributeId, option.config_product_option_value)
				}
			})
		}
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
	}

	loadJSON() {
		return new Promise(async (resolve, reject) => {
			resolve(true);
		})
	}

	updateMockUp(e) { this.setState({ lightDarkMockup: e.target.checked }); }

	filterCat(id) {
		var cat = this.state.filteredCategories == id ? false : id;
		this.setState({
			filteredCategories: cat,
			filteredProducts: this.filterProducts(cat, this.state.filteredSubcategories),
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
				let isCatAvailable = (cP['shrt-config-prod-categories'] || []).findIndex((cPCat) => cPCat.category_id == cat);
				if (isCatAvailable > -1) {
					return cP;
				}
			});
		} else {
			return this.state.configurableProducts;
		}
	}


	filterColor(id) {
		var currentColor = this.state.colors_data.find(c => c.id == id);
		var allProd = this.filterProducts(this.state.filteredCategories, this.state.filteredSubcategories);
		var filteredProducts = allProd.filter((prod) => {
			if (prod
				&& prod.availColor
				&& prod.availColor.findIndex(ac => ac.id == id) > -1) {
				return prod;
			}
		});

		this.setState({
			filteredColor: this.state.filteredColor == id ? false : id,
			filteredProducts: this.state.filteredColor == id ? allProd : filteredProducts,
			canvas_color: this.state.filteredColor == id ? false : currentColor.color,
		}, () => {
			this.forceUpdate();
		});
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

	removeSelProd(configProd, configProdIndex) {
		let selectedCampaignProducts = [...this.state.selectedCampaignProducts];
		let removeIndex = selectedCampaignProducts.findIndex(cp => cp.config_product_id == configProd.id);
		if (removeIndex > -1) {
			selectedCampaignProducts.splice(removeIndex, 1);
			this.setState({ selectedCampaignProducts });
		}
	}



	addProductPrice(e, cMCIndex) {
		var campaignProductCatalogs = this.state.campaignProductCatalogs;
		campaignProductCatalogs[cMCIndex].sales_price = e.target.value;
		this.setState({ campaignProductCatalogs: campaignProductCatalogs });
	}

	addMainProduct(cMCIndex) {
		var campaignProductCatalogs = this.state.campaignProductCatalogs;
		campaignProductCatalogs = campaignProductCatalogs.filter((cMC) => {
			cMC.is_main_product = false;
			return cMC;
		})
		if (campaignProductCatalogs && campaignProductCatalogs.length > 0) {
			campaignProductCatalogs[cMCIndex].is_main_product = !campaignProductCatalogs[cMCIndex].is_main_product;
			this.setState({ campaignProductCatalogs: campaignProductCatalogs });
		}
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
            localStorage.setItem('loadDefaultProducts', true);
			loadingService.hide();
			if (response.status == 200) {
				let data = response.data.data;
				let updateData = {
                    selectedCampaignProducts: this.state.selectedCampaignProducts,
					campaignProductCatalogs: data.campaignProductCatalogs,
					campaignProductCatalogOption: data.campaignProductCatalogOption,
					campaignProductCatalogOptionDetail: data.campaignProductCatalogOptionDetail,
				}
				this.setState(updateData);
				this.props.updatePropsData({
					...updateData,
					activeStep: 'step-3'
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
	}

	getConfigProdCanvas(configProd, configProdIndex, is_side) {
		let isLoad = JSON.parse(localStorage.getItem('loadDesign')) || false;
		let mockUpSelected = this.state.mockupType.find((mT) => mT.id == this.state.mockUpSelectedId);

		if (mockUpSelected && mockUpSelected.id) {
			let campMockupType = this.state.campaignMockupType.find((cMT) => cMT.mockup_type_id == mockUpSelected.id && cMT.id == this.state.campaignMockupTypeSelectedId);

			if (campMockupType && campMockupType.id) {
				let configProdMockUp = (configProd['shrt-config-prod-mockup'] || []).find((cPM) => this.state.campaignMockupTypeSelectedId == cPM.campaign_mockup_type_id && mockUpSelected.id == cPM.mockup_type_id);
				let campaignMockupCatalog = this.state.campaignMockupCatalog.find((cMC) => cMC.design_mockup_type_id == mockUpSelected.id && cMC.campaign_mockup_type_id == campMockupType.id)
				let campaignMockupCatalogWithConfigProd = this.state.campaignMockupCatalog.find((cMC) => cMC.design_mockup_type_id == mockUpSelected.id && cMC.campaign_mockup_type_id == campMockupType.id && cMC.config_product_id == configProd.id)
				
				if (configProdMockUp && campaignMockupCatalog) {					
					return <DynamicImageLoader
                        key={`product_image_${configProdMockUp.id}`}
						mockup_file_objects={configProdMockUp}
						print_file_objects={campaignMockupCatalogWithConfigProd && campaignMockupCatalogWithConfigProd.canvas?campaignMockupCatalogWithConfigProd:campaignMockupCatalog}
						prev_loading={isLoad} />
					
				} else if (configProdMockUp && !campaignMockupCatalog) {
					return (
						<div className="product-design">
							<div className="product-design-output">
								<img style={{ "width": 150, "height": 150, backgroundColor: "#000" }} src={`${configProdMockUp.small_image || configProdMockUp.large_image}`} loading="lazy" />
							</div>
						</div>
					);
				} else {
					return (
						<p>No product image or configuration found</p>
					)
				}
			} else {
				return (
					<p>No product image or configuration found</p>
				)
			}
		} else {
			return (
				<p>No product image or configuration found</p>
			)
		}
	}

	getConfigProd(configProd, configProdIndex) {
		const isAdded = this.state.selectedCampaignProducts.findIndex((cPC) => cPC.config_product_id == configProd.id);
		const style = {}
		return (
			<div className={"col-lg-2 added-product"} key={`add_product_${configProd.id}`}>
				<div className="bg-white text-center position-relative">
					{
						isAdded == -1 ? <></> : <button className="btn-default" onClick={() => { this.removeSelProd(configProd, configProdIndex) }}>Click to remove</button>
					}
					<div className="pro-title">{configProd.product_name}</div>
					<div className="image-bg-set YYY" style={style} >
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

	getSelectedCampaignProduct(selectedCampaignProduct, sCPIndex, isSideBar) {
		const cP = this.state.configurableProducts.find((cP) => selectedCampaignProduct.config_product_id == cP.id);
		const cPI = this.state.configurableProducts.findIndex((cP) => selectedCampaignProduct.config_product_id == cP.id);
		if (sCPIndex == this.state.selectedCampaignProducts.length - 1) {
			setTimeout(() => {
				localStorage.setItem('loadDesign', false);
			}, 1000);
		}
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

		const addMainProduct = () => {
			let sCP = this.state.selectedCampaignProducts.map((_scp) => { return { ..._scp, is_main_product: false } });
			sCP[sCPIndex].is_main_product = true;
			this.setState({ selectedCampaignProducts: sCP })
		}

		const editSelectedProduct = (id) => {
			this.props.updatePropsData({
                selectedCampaignProducts: this.state.selectedCampaignProducts,
                campaignProductCatalogs: this.state.campaignProductCatalogs,
                campaignProductCatalogOption: this.state.campaignProductCatalogOption,
                campaignProductCatalogOptionDetail: this.state.campaignProductCatalogOptionDetail,
				configProductId: id,
				activeStep: 'edit-product'
            })            
		}

		if (cP) {
			if (isSideBar) {
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
										shrtFavouriteColorAttributes.map((option, optionIndex) => <div key={`basic_list_color_${optionIndex}_${option.attribute_id}`} className="list-color" style={{ backgroundColor: option.config_product_option_value, color:selectedOptionTickColorDecider(option.config_product_option_value)  }} onClick={() => addFavColor(option)}
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
										shrtFavouriteColorAttributes.filter((option) => selectedFavColors.indexOf(option.config_product_option_value) > -1).map((option, optionIndex) => <div key={`basic_list_color_${optionIndex}_${option.attribute_id}`} className={"list-color"} style={{ backgroundColor: option.config_product_option_value }} data-optionid={option.id} onClick={() => selectDefaultOptionDetail(option)}>
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
			} else {

				return (
					<div className="col-md-3 added-product" key={`configurable_product_${cP.id}`}>
						<div className="bg-white text-center position-relative">
							<button className="btn-default" onClick={() => { editSelectedProduct(cP.id) }}>Click to edit</button>
							<div className="pro-title">{cP.product_name}</div>
							<div className="image-bg-set d-inline-block">
								{
									this.getConfigProdCanvas(cP, cPI, false)
								}
							</div>
							<div className="product-switch">
								<label className="switch">
									<input type="checkbox" checked={selectedCampaignProduct.is_main_product} onChange={() => { addMainProduct() }} />
									<span className="slider round"></span>
								</label>
								<em>Use as Main Product</em>
							</div>
						</div>
					</div>
				)
			}
		}
	}


	openLoadTemplate() {
		this.setState({
			openLoadTemplate: true
		});
	}

	openSaveTemplate() {
		this.setState({
			openSaveTemplate: true
		});
	}

	closeTemplateModal() {
		this.setState({
			openLoadTemplate: false,
			openSaveTemplate: false
		}, () => this.updateDesignerTemplate());
	}
	updateDesignerTemplate() {
		if (localStorage.getItem('token')) {
			var dTHeader = {
				'campaign-session': localStorage.getItem('campaign-session'),
				'authorization': `bearer ${localStorage.getItem('token')}`
			}
		} else {
			var dTHeader = {
				'campaign-session': localStorage.getItem('campaign-session'),
			}
		}
		axios.get(`${env.clientHost}/designer-template`, { headers: dTHeader }).then((res) => {
			if (res && res.data && res.data.data && res.data.data.length > 0) {
				this.setState({
					designerTemplate: res.data.data
				});
			} else {
				this.setState({
					designerTemplate: []
				});
			}
		}).catch((err) => {
			if (err.status == 204) {
				this.setState({
					designerTemplate: []
				});
			} else {
				console.log(err);
			}
		});
	}
	addTemplate(templateProduct) {
		Promise.all(templateProduct.map((temp) => new Promise(async (resolve, reject) => {
			if (temp.config_product_id) {
				let configProd = this.state.configurableProducts.find((c) => c.id == temp.config_product_id);
				let configProdIndex = this.state.configurableProducts.findIndex((c) => c.id == temp.config_product_id);
				const isAdded = this.state.selectedCampaignProducts.findIndex((cPC) => cPC.config_product_id == configProd.id);
				if (isAdded == -1) {
					// this.selectTemplateProducts(configProd);
					this.selectProducts(configProd,configProdIndex);
				}	
				resolve(true)
			} else {
				resolve(false)
			}
		}))).then((response) => {
					this.closeTemplateModal();
		});
	}


	selectTemplateProducts(configProd) {
		let data = {
			config_product_id: configProd.id,
			is_main_product: false,
			sales_price: configProd.actual_price || 100,
			session_id: parseInt(localStorage.getItem('campaign-session'))
		}
		var req = axios.post(`${env.clientHost}/campaign-product-catalog`, data).then((response) => response.data);
		req.then((response) => {
			loadingService.hide();
			if (response && response.data && response.data.id) {
				let campaignProductCatalogs = this.state.campaignProductCatalogs || [];
				campaignProductCatalogs.push(response.data);
				this.setState({
					campaignProductCatalogs: campaignProductCatalogs
				}, () => this.selectProductsDefaultOptions(response.data, configProd));
			}
		});
		req.catch((error) => {
			console.log(error);
			toastify.error("Error in request");
			loadingService.hide();
		})
		return req;
	}

	render() {
		return (
			<div className="row m-0">
				<div className="col-md-8 p-5 more-great-product">

					<div className="row collection-header">
						<div className="col-md-6">
							<h1>Choose your product collection</h1>
							<p>Please select the products and colors you want to offer</p>
						</div>
						<div className="col-md-6 padd-top">
							<button className="save-collection" onClick={() => { this.openSaveTemplate() }}><i className="fas fa-save"></i> Save collection as template</button>
							<AddDesignerTemplate open={this.state.openSaveTemplate} templateList={this.state.designerTemplate} configurableProducts={this.state.configurableProducts} close={() => this.closeTemplateModal()} campaignProductCatalogs={this.state.campaignProductCatalogs} selectedCampaignProducts={this.state.selectedCampaignProducts}/>
							<button className="save-collection" onClick={() => { this.openLoadTemplate() }}><i className="fas fa-th"></i> Load template</button>
							<DesignerTemplate open={this.state.openLoadTemplate} templateList={this.state.designerTemplate} configurableProducts={this.state.configurableProducts} close={() => this.closeTemplateModal()} addTemplate={this.addTemplate} />
							{/* <!-- Rounded switch --> */}
							<div className="back-view">
								<em>Back view</em>
								<label className="switch">
									<input type="checkbox" onClick={this.changeMainFrm.bind(this)} />
									<span className="slider round"></span>
								</label>
							</div>
						</div>
					</div>

					<div className="row collection-listing pro-list-collection">
						<div className="col-md-3 add-a-product">
							<a className="bg-white text-center" onClick={() => {
								this.props.updatePropsData({
									campaignProductCatalogs: this.state.campaignProductCatalogs,
									campaignProductCatalogOption: this.state.campaignProductCatalogOption,
									campaignProductCatalogOptionDetail: this.state.campaignProductCatalogOptionDetail,
									selectedCampaignProducts: this.state.selectedCampaignProducts,
									activeStep: 'add-product'
								})
							}}>
								<div className="table-cell">
									<img src="/images/add-product.svg" alt="" loading="lazy" />
									<span>Add a product</span>
								</div>
							</a>
						</div>
						{
							this.state.isCampaignProductCatalogsLoading ?
								[1, 2, 3].map((_p) =>
									<div className="col-md-3 added-product" key={`_ploading_${_p}`}>
										<div className="bg-white text-center position-relative">
											<div className="pro-title"><span className="loading">BASIC</span></div>
											<div className="image-bg-set d-inline-block loading">
												<img src="images/product-t-shirt.svg" alt="" />
											</div>
											<div className="product-switch">
												<label className="switch loading">
													<input type="checkbox" />
													<span className="slider round"></span>
												</label>
												<em className="loading">Use as Main Product</em>
											</div>
										</div>
									</div>
								)
								: <></>
						}
						{
							this.state.selectedCampaignProducts.map((cMC, cMCIndex) => this.getSelectedCampaignProduct(cMC, cMCIndex, false))
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
							{
								this.state.selectedCampaignProducts.map((cMC, cMCIndex) => this.getSelectedCampaignProduct(cMC, cMCIndex, true))
							}
							<div className="empty-box-product">&nbsp;</div>
							<div className="bottom-btn">
								<div className="row">
									<div className="col-md-6">
										<a className="back-btn" onClick={() => { this.props.updatePropsData({ activeStep: 'step-1' }) }}>Back</a>
									</div>
									<div className="col-md-6">
										<a className="next-btn" onClick={(e) => { this.nextStep(e) }}>Next</a>
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

export default StepTwoComponent
