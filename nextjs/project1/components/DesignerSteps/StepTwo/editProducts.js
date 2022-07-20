import React, { useState, useEffect } from 'react';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import axios from "axios";
import fetch from 'isomorphic-unfetch';
import { min } from '../../../core/utils/validators';
import { toastify } from "../../../core/utils/toastify";
import { loadingService } from '../../../core/components/Loader/loader.service';
import { env } from '../../../configs/env';
import ProductDesignTool from '../../../core/components/ProductDesignTool';
import { parseJSON } from '../../../core/utils/jsonParser';
import nProgress from 'nprogress';
import { result } from 'underscore';


function fetchRequest(apiPath, apiMethod, apiHeaders, apiBody) {
    if (apiBody) {
        var options = {
            method: apiMethod || 'GET',
            headers: apiHeaders || {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: JSON.stringify(apiBody) || {}
        }
    } else {
        var options = {
            method: apiMethod || 'GET',
            headers: apiHeaders || {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    }
    return fetch(`${env.mainHost}/${apiPath}`, options)
}

export const EditProductsComponent = (props) => {

    useEffect(() => {
        nProgress.done(true);
        $("#loading").modal("hide");
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
    });

    const defaultCanvas = {
        objects: [{
            type: 'rect', top: 10,
            left: 10,
            width: 50,
            height: 50,
        }],
        width: 466,
        height: 498
    }

    const getDefaultMockup = () => {
        let defaultMockup = (props.mockupType || []).find((mockupType, i) => mockupType.id);
        if (defaultMockup && defaultMockup.id) {
            return defaultMockup.id;
        }
        return false;
    }

    const [campaignMockupCatalog, setCampaignMockupCatalog] = useState(null);
    useEffect(() => {
        setCampaignMockupCatalog(props.campaignMockupCatalog)
    }, [props.campaignMockupCatalog])



    const selectedMockupTypeId = () => {
        if (props.campaignMockupCatalog && props.campaignMockupCatalog.length > 0) {
            let display_mockup_type_id = props.campaignMockupCatalog.find(c => c && c.display_mockup_type_id).display_mockup_type_id;
            let mockupType = props.mockupType.find(m => m && m.id == display_mockup_type_id);
            if (mockupType) {
                return mockupType.id;
            } else {
                return getDefaultMockup() ? getDefaultMockup() : false;
            }
        } else {
            return getDefaultMockup() ? getDefaultMockup() : false;
        }
    }

    const selectedCampaignMockupTypeId = () => {
        if (props.campaignMockupCatalog && props.campaignMockupCatalog.length > 0) {
            let campaign_mockup_type_id = props.campaignMockupCatalog.find(c => c.campaign_mockup_type_id).campaign_mockup_type_id;
            return campaign_mockup_type_id;
        } else {
            return 1;
        }
    }

    const [filteredCampaignMockupType, setFilteredCampaignMockupType] = useState(selectedCampaignMockupTypeId());
    const [campaignMockupType, setCampaignMockupType] = useState(null);
    const [canvasUpdatedRef, setCanvasUpdatedRef] = useState(null);
    const [filteredMockupType, setFilteredMockupType] = useState(selectedMockupTypeId());

    useEffect(() => {
        setFilteredMockupType(selectedMockupTypeId());
        setFilteredCampaignMockupType(selectedCampaignMockupTypeId());
        setCampaignMockupCatalog(props.campaignMockupCatalog);

        let mTId = selectedMockupTypeId();
        if (mTId) {
            let mT = props.mockupType.find((m) => m.id == mTId);
            if (mT) {
                setCampaignMockupType(mT['shrt-campaign-mockup-type'] || []);
            } else {
                setCampaignMockupCatalog(props.campaignMockupCatalog)
            }
        }
    }, [props.mockupType, props.campaignMockupCatalog, props.campaignMockupCatalog])

    const [moreColor, setMoreColors] = useState(false);
    // Operation Number :
    // deleteObject : 1
    // verticalStreach : 2
    // horizontalStreatch : 3
    // flipImageVertically : 4
    const [canvasOperation, setCanvasOperation] = useState(0);
    const [canvas, setCanvas] = useState(props.canvas);
    useEffect(() => {
        setCanvas(props.canvas);
    }, [props.canvas])
    var designerCanvas = {};
    const [configProductId, setConfigProductId] = useState(props.configProductId);
    const [selectedCampaignProducts, setSelectedCampaignProducts] = useState(props.selectedCampaignProducts);
    const [editCampaignProducts, setEditCampaignProducts] = useState({});
    const [availableOption, setAvailableOption] = useState([]);
    const [availableOptionDetails, setAvailableOptionDetails] = useState([]);
    const [isMainProduct, setIsMainProduct] = useState(false);
    const [options, setOptions] = useState([]);
    const [optionDetails, setOptionDetails] = useState([]);
    const [salesPrice, setSalesPrice] = useState(0);
    const [actualPrice, setActualPrice] = useState(0);
    const [shrtFavouriteColorAttributes, setShrtFavouriteColorAttributes] = useState([]);
    const [shrtSizeAttributes, setShrtSizeAttributes] = useState([]);

    useEffect(() => {
        console.log("Changes in selectedCampaignProducts or configProductId :: ", props.selectedCampaignProducts, props.configProductId);
        if (props.configProductId) {
            setConfigProductId(props.configProductId);
            setConfigurableProduct(getConfigurableProduct(props.configProductId));
            setCampaignProductCatalogs(getCampaignProductCatalogs(props.configProductId));

            setSelectedCampaignProducts(props.selectedCampaignProducts);
            let sCP = props.selectedCampaignProducts.find(cP => cP.config_product_id == props.configProductId);
            if (sCP) {
                setEditCampaignProducts(sCP);
                setAvailableOption(sCP.availableOption);
                setAvailableOptionDetails(sCP.availableOptionDetails);
                setIsMainProduct(sCP.is_main_product);
                setOptions(sCP.options);
                setOptionDetails(sCP.optionDetails);
                setSalesPrice(sCP.sales_price);
                setActualPrice(sCP.actual_price);
                setShrtFavouriteColorAttributes(sCP.shrtFavouriteColorAttributes);
                setShrtSizeAttributes(sCP.shrtSizeAttributes);
            }
        }
    }, [props.selectedCampaignProducts, props.configProductId])

    useEffect(() => {
        if (props.activeStep == 'edit-product' && !props.configProductId) {
            props.updatePropsData({
                activeStep: 'step-2'
            });
            setMoreColors(false)
        }
    }, [props.activeStep])
    const getConfigurableProduct = (id) => {
        return props.configurableProducts.find(cP => cP.id == id)
    }
    const getCampaignProductCatalogs = (id) => {
        return props.campaignProductCatalogs.find(cP => cP.config_product_id == id)
    }
    const [configurableProduct, setConfigurableProduct] = useState(getConfigurableProduct());

    useEffect(() => {
        setConfigurableProduct(getConfigurableProduct(props.configProductId));
    }, [props.configurableProducts, props.configProductId])
    const [campaignProductCatalogs, setCampaignProductCatalogs] = useState(getCampaignProductCatalogs(props.configProductId));
    const [allCampaignProductCatalogs, setAllCampaignProductCatalogs] = useState(props.campaignProductCatalogs);

    useEffect(() => {
        setAllCampaignProductCatalogs(props.campaignProductCatalogs)
        setCampaignProductCatalogs(getCampaignProductCatalogs(props.configProductId));
    }, [props.campaignProductCatalogs])
    const [filteredColor, setFilteredColor] = useState([]);
    var formRef = React.createRef();
    const [campaignProductCatalogOptionDetail, setCampaignProductCatalogOptionDetail] = useState([]);
    useEffect(() => {
        setCampaignProductCatalogOptionDetail(props.campaignProductCatalogOptionDetail);
    }, [props.campaignProductCatalogOptionDetail])

    const [campaignProductCatalogOption, setCampaignProductCatalogOption] = useState([]);
    useEffect(() => {
        setCampaignProductCatalogOption(props.campaignProductCatalogOption);
    }, [props.campaignProductCatalogOption])
    const getCampaignMockupType = () => {
        if (campaignMockupCatalog && campaignMockupCatalog.length > 0) {
            let display_mockup_type_id = (campaignMockupCatalog || []).find(cMC => cMC && cMC.display_mockup_type_id).display_mockup_type_id;
            let mockupType = (props.mockupType || []).find(c => c && c.id == display_mockup_type_id)['shrt-campaign-mockup-type'] || [];
            return mockupType;
        } else {
            return getDefaultMockup() ? getDefaultMockup() : false;
        }
    }
    const [updateobjs,setupdateobjs]=useState();
    const getEditedCanvasObject = (canvasRef,obj) => {
        setupdateobjs(obj)
        setCanvasUpdatedRef(canvasRef);
    }

    const getMainProductSelectedMockup = (is_side = false) => {
        if (configurableProduct && campaignMockupCatalog) {
            let configProdMockUp = (configurableProduct['shrt-config-prod-mockup'] || []).find((cPM) => filteredCampaignMockupType == cPM.campaign_mockup_type_id && filteredMockupType == cPM.mockup_type_id);
            let _campaignMockupCatalog = (campaignMockupCatalog || []).find((cMC) => cMC.design_mockup_type_id == filteredMockupType && cMC.campaign_mockup_type_id == filteredCampaignMockupType)
            let cMCIndex = (campaignMockupCatalog || []).findIndex((cMC) => cMC.design_mockup_type_id == filteredMockupType && cMC.campaign_mockup_type_id == filteredCampaignMockupType)
            let _cMCWithCP = (campaignMockupCatalog || []).find((cMC) => cMC.design_mockup_type_id == filteredMockupType && cMC.campaign_mockup_type_id == filteredCampaignMockupType && cMC.config_product_id == configProductId)
            let _cMCWithCPIndex = (campaignMockupCatalog || []).findIndex((cMC) => cMC.design_mockup_type_id == filteredMockupType && cMC.campaign_mockup_type_id == filteredCampaignMockupType && cMC.config_product_id == configProductId)
            let _canvas = (configProdMockUp && configProdMockUp['shrt-canvas'] ? configProdMockUp['shrt-canvas'] : defaultCanvas);

            let fixedData = {
                objects: parseJSON(_canvas.objects),
                version: _canvas.version,
                background: _canvas.background,
                backgroundImage: parseJSON(_canvas.backgroundImage),
                width: _canvas.width,
                height: _canvas.height
            }

            let objectSize = fixedData.objects.find((o) => o.type = 'rect');

            if (configProdMockUp && (_cMCWithCP || _campaignMockupCatalog) && canvas && canvas.length > 0) {

                var _designCanvas;
                if (_cMCWithCP) {
                    _designCanvas = canvas.find((c) => c.id == _cMCWithCP.canvas_id);                    
                } else {
                    _designCanvas = canvas.find((c) => c.id == _campaignMockupCatalog.canvas_id);
                }
                let fixedDesignCanvas = {
                    ..._designCanvas,
                    objects: parseJSON(_designCanvas.objects || []),
                    version: _designCanvas.version,
                    background: _designCanvas.background,
                    backgroundImage: parseJSON(_designCanvas.backgroundImage || {})
                }
                designerCanvas = fixedDesignCanvas;
                let data = {
                    inner_canvas: fixedDesignCanvas,
                    product_config: {
                        width: fixedData.width,
                        height: fixedData.height,
                        product_image: `${configProdMockUp.small_image || configProdMockUp.large_image}`,
                        background_color: '#000000'

                    },
                    objectSize,
                    is_dynamic: true,
                    operations: canvasOperation,
                    getCanvas: (canv) => {
                        designerCanvas = {
                            ...canv,
                            width: objectSize.width,
                            height: objectSize.height
                        };
                    }
                };
                return (
                    <ProductDesignTool {...data} key={`main_product_view_${_cMCWithCPIndex > -1 ? _cMCWithCPIndex : cMCIndex}`} getEditedCanvasObject={getEditedCanvasObject} />
                );
            } else {
                return (
                    <img key={`main_product_view_${cMCIndex}`} src={configProdMockUp && configProdMockUp.large_image ? `${configProdMockUp.large_image}` : '/static/assets/noimage.jpg'} alt="" style={is_side ? { height: '140px', width: '150px', backgroundColor: '#000000' } : {'backgroundColor': '#000000'}} />
                )
            }
        } else {
            return (
                <img key={`main_product_view_`} src='/static/assets/noimage.jpg' alt="" style={is_side ? { height: '140px', width: '150px' } : {}} />
            )
        }
    }

    const changeProductMockup = (target) => {
        // TODO: cHANGE tARGET uSING hOOK
        setFilteredCampaignMockupType(target)
    }

    const getMainProductMockupList = (cMC) => {
        // shrt-config-prod-mockup
        if (configurableProduct && campaignMockupType) {
            let configProdMockup = (configurableProduct['shrt-config-prod-mockup'] || []).filter((cPM) => filteredMockupType == cPM.mockup_type_id);
            if (configProdMockup && configProdMockup.length > 0) {
                return (
                    <div key={`config_prod_mockup`} >
                        {
                            configProdMockup.map((cPM, cPMIndex) => {
                                return (
                                    <a href="#" key={`config_prod_mockup_list_${cPM.id}`} className={filteredCampaignMockupType == cPM.campaign_mockup_type_id && filteredMockupType == cPM.mockup_type_id ? "active" : ''} onClick={() => changeProductMockup(cPM.campaign_mockup_type_id)} >
                                        <span>{campaignMockupType.find((cMT) => cMT.id == cPM.campaign_mockup_type_id) ? campaignMockupType.find((cMT) => cMT.id == cPM.campaign_mockup_type_id).title : "Test"}</span>
                                        <div className="small-view">
                                            <img width="45" src={`${cPM.large_image}`} alt="" style={{ background: '#000000' }} />
                                        </div>
                                    </a>
                                )
                            })
                        }
                    </div>
                )
            } else {
                return (
                    <div key={`config_prod_mockup_${cMC.id}`}>
                        <a href="#" key={`config_prod_mockup_list_${cMC.id}`} className="active">
                            <span>No Image</span>
                            <div className="small-view" >
                                <img width="45" src="/static/noimage.jpeg" style={{ background: '#000000' }} />
                            </div>
                        </a>
                    </div>
                )
            }
        }

    }


    function deleteObject() {
        setCanvasOperation(1);
    }

    function verticalStreach() {
        setCanvasOperation(2);
    }

    function horizontalStreatch() {
        setCanvasOperation(3);
    }

    function flipImageVertically() {
        setCanvasOperation(4);
    }

    function storeFilteredColor(color) {
        let index = filteredColor.findIndex(c => c == color);
        if (index > -1) {
            var filtered = [...filteredColor];
            filtered.splice(index, 1);
        } else {
            var filtered = [...filteredColor];
            filtered.push(color);
        }
        setFilteredColor(filtered);
    }


    function addProductPrice(e) {
        var _campaignProductCatalogs = campaignProductCatalogs;
        _campaignProductCatalogs.sales_price = e.target.value;
        setCampaignProductCatalogs({ ..._campaignProductCatalogs });
    }

    function setMainProduct(e) {
        var _campaignProductCatalogs = campaignProductCatalogs;
        _campaignProductCatalogs.is_main_product = e.target.checked;
        setCampaignProductCatalogs({ ..._campaignProductCatalogs });
    }

    function handleSubmit(e) {
        e.preventDefault();
    }
    function storeData() {
        return new Promise(async (resolve, reject) => {
            if (salesPrice - actualPrice < 0) {
                reject({ msg: "Please update your price error." })
                return;
            }
            let cMCWithConfigProdId = (campaignMockupCatalog || []).find((cMC) => cMC.design_mockup_type_id == filteredMockupType && cMC.campaign_mockup_type_id == filteredCampaignMockupType && cMC.config_product_id == configProductId);
            let cMCWithConfigProdIdIndex = (campaignMockupCatalog || []).findIndex((cMC) => cMC.design_mockup_type_id == filteredMockupType && cMC.campaign_mockup_type_id == filteredCampaignMockupType && cMC.config_product_id == configProductId);
            let _cMC = [...campaignMockupCatalog];
            if (cMCWithConfigProdIdIndex > -1) {
                let canvasData={
                    objects: updateobjs?updateobjs:designerCanvas.objects,
                    background: designerCanvas.background,
                    backgroundImage: designerCanvas.backgroundImage,
                    height: designerCanvas.height,
                    width: designerCanvas.width,
                    session_id: parseInt(localStorage.getItem('campaign-session'))
                }
                var updateData = fetchRequest(`canvas/${cMCWithConfigProdId.canvas_id}`, 'PUT', {
                    'Content-Type': 'application/json',
                },canvasData ).then(r => r.json());
                await updateData;
                if(updateobjs){
                    canvas.find(v => v.id === cMCWithConfigProdId.canvas_id).objects = updateobjs;
                }
                
                var newCanvas=false;    
            } else {
                // Add new canvas
                let canvasData = {
                    objects: updateobjs?updateobjs:designerCanvas.objects,
                    background: designerCanvas.background,
                    backgroundImage: designerCanvas.backgroundImage,
                    height: designerCanvas.height,
                    width: designerCanvas.width,
                    session_id: parseInt(localStorage.getItem('campaign-session'))
                }
                var addNewCanvas = await fetchRequest(`canvas`, 'POST', {
                    'Content-Type': 'application/json'
                }, canvasData).then(r => r.json());
                var newCanvas = addNewCanvas.data;
                let _cMCWithConfigProdId = {
                    campaign_mockup_type_id: filteredCampaignMockupType,
                    canvas_id: addNewCanvas.data.id,
                    config_product_id: configProductId,
                    design_mockup_type_id: filteredMockupType,
                    display_mockup_type_id: filteredMockupType,
                    session_id: parseInt(localStorage.getItem('campaign-session'))
                };
                // Updated campaign mockup catalog 
                var updateData = fetchRequest(`campaign-mockup-catalog`, 'POST', {
                    'Content-Type': 'application/json'
                }, _cMCWithConfigProdId).then(r => r.json());
                let newCMC = await updateData;
                _cMC.push(newCMC.data);
            }

            let selProducts = selectedCampaignProducts;
            let sCP = selectedCampaignProducts.findIndex(cP => cP.config_product_id == configProductId);
            if (selProducts && selProducts[sCP]) {
                if (isMainProduct) {
                    selProducts = selectedCampaignProducts.map(cp => { return { ...cp, is_main_product: false } });
                    selProducts[sCP].is_main_product = true;
                }
                selProducts[sCP].options = options;
                selProducts[sCP].optionDetails = optionDetails;
                selProducts[sCP].actual_price = actualPrice;
                selProducts[sCP].sales_price = salesPrice;

                axios.patch(`${env.clientHost}/campaign-product-catalog`, {
                    campaignProdCatalogs: selProducts,
                    sessionId: parseInt(localStorage.getItem('campaign-session'))
                }).then((response) => {
                    if (response.status == 200) {
                        let data = response.data.data;
                        let updateData = {
                            campaignProductCatalogs: data.campaignProductCatalogs,
                            campaignProductCatalogOption: data.campaignProductCatalogOption,
                            campaignProductCatalogOptionDetail: data.campaignProductCatalogOptionDetail,
                            selectedCampaignProducts: selProducts,
                            campaignMockupCatalog: _cMC,
                            updatedProductDesignObjects: designerCanvas.objects,
                            newCanvas
                        }
                        resolve(updateData);
                    } else {
                        throw new Error("Error in processing.");
                    }
                }).catch((error) => {
                    loadingService.hide();
                    toastify.error(error.msg || error.message || error);
                    console.log(error);
                    resolve(false);
                    return false;
                });
            }
        })

    }

    function saveCongifProductDesign() {
        storeData().then((response) => {
            if (response) {
                let updatedResponseCampaignMockupCatalog = response.campaignMockupCatalog;
                if (canvasUpdatedRef) {
                    response.campaignMockupCatalog.forEach((_innerCMC,i) => {
                        if (_innerCMC.config_product_id && _innerCMC.config_product_id === props.configProductId) {
                            _innerCMC.canvas = {
                                svg: canvasUpdatedRef,
                                objects: response.updatedProductDesignObjects
                            }
                        }
                        updatedResponseCampaignMockupCatalog[i] = _innerCMC;
                    });
                }
                toastify.info("Product Updated Successfully!");
                localStorage.setItem('loadDesign', true);
                props.updatePropsData({
                    campaignProductCatalogs: response.campaignProductCatalogs,
                    campaignProductCatalogOption: response.campaignProductCatalogOption,
                    campaignProductCatalogOptionDetail: response.campaignProductCatalogOptionDetail,
                    selectedCampaignProducts: response.selectedCampaignProducts,
                    campaignMockupCatalog: updatedResponseCampaignMockupCatalog,
                    activeStep: 'step-2',
                    canvas: response.newCanvas ? [...canvas, response.newCanvas] : canvas
                });
                setMoreColors(false);
            }
        }).catch((err) => {
            if (err.msg) {
                toastify.error(err.msg);
            }
            console.log(err);
        })
    }

    const updateProductOptions = (_options, _optionDetails) => {
        let sCP = selectedCampaignProducts.findIndex(cP => cP.config_product_id == configProductId);
        if (sCP > -1) {
            let selProducts = selectedCampaignProducts;

            let editProduct = {
                ...selProducts[sCP],
                options: _options,
                optionDetails: _optionDetails
            }
            setEditCampaignProducts(editProduct);
            setOptions(editProduct.options);
            setOptionDetails(editProduct.optionDetails);
        };
    }
    if (editCampaignProducts && configurableProduct) {
        let selectedFavColors = availableOptionDetails.filter((oPD) => optionDetails.findIndex(sFCA => sFCA.config_product_option_value == oPD.config_product_option_value) > -1).map(cPCOD => cPCOD.config_product_option_value);
        let allSelectedFavColors = availableOptionDetails.filter((oPD) => optionDetails.findIndex(sFCA => sFCA.config_product_option_value == oPD.config_product_option_value) > -1)
        let favAttributeId = allSelectedFavColors.find(sFCA => sFCA.attributeId);
        let defaultColor = (optionDetails || []).find((oPD) => oPD.attribute_id == favAttributeId ? favAttributeId.attributeId : 1 && oPD.is_default_option);
        if (!defaultColor) {
            defaultColor = (optionDetails || []).find((oPD) => oPD.attribute_id == favAttributeId ? favAttributeId.attributeId : 1);
        }
        const addProductPrice = (e) => {
            setSalesPrice(e.target.value);
        }
        const addFavColor = (optionDetailValues) => {
            let isOptionAdded = (options || []).findIndex((oPD) => oPD.attribute_id == (favAttributeId ? favAttributeId.attributeId : 1));
            let isOptionDetailsAdded = (optionDetails || []).findIndex((oPD) => oPD.attribute_id == (favAttributeId ? favAttributeId.attributeId : 1) && oPD.config_product_option_value == optionDetailValues.config_product_option_value);
            let colorsAvailable = (optionDetails || []).filter((oPD) => oPD.attribute_id == (favAttributeId ? favAttributeId.attributeId : 1));

            if (isOptionAdded > -1) {
                if (isOptionDetailsAdded > -1 && colorsAvailable.length > 1) {
                    if (optionDetails[isOptionDetailsAdded].is_default_option == true) { return false; }

                    let _optionDetails = optionDetails;
                    _optionDetails.splice(isOptionDetailsAdded, 1)
                    let optionDetailsLength = (options || []).filter((oPD) => oPD.attribute_id == (favAttributeId ? favAttributeId.attributeId : 1));
                    if (optionDetailsLength.length == 0) {
                        let _options = options;
                        _options.splice(isOptionAdded, 1);
                        // setOptionDetails(_optionDetails);
                        updateProductOptions(_options, _optionDetails);
                    } else {
                        updateProductOptions(options, _optionDetails);
                    }
                } else {
                    let _optionDetails = optionDetails;
                    _optionDetails.push({
                        attribute_id: (favAttributeId ? favAttributeId.attributeId : 1),
                        config_product_option_price: optionDetailValues.config_product_option_price,
                        config_product_option_quantity: optionDetailValues.config_product_option_quantity,
                        config_product_option_value: optionDetailValues.config_product_option_value,
                        is_default_option: optionDetailValues.is_default_option,
                        session_id: parseInt(localStorage.getItem('campaign-session'))
                    });
                    updateProductOptions(options, _optionDetails);
                }
            } else {
                let _options = options;
                _options.push({
                    product_option_required: true,
                    attribute_id: (favAttributeId ? favAttributeId.attributeId : 1),
                    session_id: parseInt(localStorage.getItem('campaign-session'))
                });
                let _optionDetails = optionDetails;
                _optionDetails.push({
                    attribute_id: (favAttributeId ? favAttributeId.attributeId : 1),
                    config_product_option_price: optionDetailValues.config_product_option_price,
                    config_product_option_quantity: optionDetailValues.config_product_option_quantity,
                    config_product_option_value: optionDetailValues.config_product_option_value,
                    is_default_option: optionDetailValues.is_default_option,
                    session_id: parseInt(localStorage.getItem('campaign-session'))
                });
                updateProductOptions(_options, _optionDetails);

            }
        }

        const selectDefaultOptionDetail = (_optionDetails) => {
            let isOptionDetailsAdded = (optionDetails || []).findIndex((oPD) => oPD.attribute_id == (favAttributeId ? favAttributeId.attributeId : 1) && oPD.config_product_option_value == _optionDetails.config_product_option_value);
            if (isOptionDetailsAdded > -1) {
                let updateMainColorOD = optionDetails.map(oPD => {
                    return {
                        ...oPD,
                        is_default_option: oPD.attribute_id == (favAttributeId ? favAttributeId.attributeId : 1) ? false : oPD.is_default_option,
                    }
                });
                updateMainColorOD[isOptionDetailsAdded].is_default_option = true;
                updateProductOptions(options, updateMainColorOD);
            }
        }

        const addMainProduct = () => {
            setIsMainProduct(!isMainProduct);
        }

        return (
            <div className="row m-0">
                <div className="col-md-8 p-5 product-design-edit-view">
                    <div className="pro-selection-view bg-white text-center">
                        <div className="title">{configurableProduct.product_name}</div>
                        <div className="product-image-view" style={{ textAlign: 'center' }}>
                            {
                                getMainProductSelectedMockup()
                            }
                        </div>
                        <div className="view-change">
                            {
                                getMainProductMockupList()
                            }
                        </div>
                        <div className="after-upload-options">
                            <a onClick={() => { deleteObject() }}>
                                <img src="/images/icon-01.svg" width="20" alt="" />
                            </a>
                            <a onClick={() => { verticalStreach() }}>
                                <img src="/images/icon-02.svg" width="40" alt="" />
                            </a>
                            <a onClick={() => { horizontalStreatch() }}>
                                <img src="/images/icon-03.svg" width="22" alt="" />
                            </a>
                            <a onClick={() => { flipImageVertically() }}>
                                <img src="/images/icon-04.svg" width="32" alt="" />
                            </a>
                        </div>
                    </div>

                </div>
                <div className="col-md-4 p-0">
                    <div className="step edit-design">
                        <h5>Edit Design</h5>
                    </div>
                    <div className="bg-white height-100vh clearfix">
                        <div className="edit-design-sidebar">
                            <div className={shrtFavouriteColorAttributes.length > 0 ? "color-sections" : "d-none"}>
                                <h5>Color selection</h5>
                                <div className="row">
                                    <div className="col-md-8">
                                        <div className="fav-color-list">
                                            {
                                                shrtFavouriteColorAttributes.map((option, optionIndex) =>
                                                    <div
                                                        key={`sel_list_color_${optionIndex}_${option.attribute_id}`}
                                                        className={selectedFavColors.indexOf(option.config_product_option_value) > -1 ? "list-color active" : "list-color"}
                                                        style={{ backgroundColor: option.config_product_option_value }}
                                                        onClick={() => addFavColor(option)}>
                                                        {
                                                            selectedFavColors.indexOf(option.config_product_option_value) > -1 ?
                                                                <i className="fa fa-check"></i> : <></>
                                                        }
                                                    </div>)
                                            }
                                        </div>
                                    </div>
                                    <div className="col-md-4 text-center">
                                        <div className="black-color-link">
                                            <a onClick={() => setMoreColors(!moreColor)} style={{ backgroundColor: defaultColor && defaultColor.config_product_option_value ? defaultColor.config_product_option_value : '' }} ><i className="fas fa-caret-down"></i></a>
                                        </div>
                                        <p>Main Product Color</p>
                                    </div>
                                </div>
                                <div className={moreColor ? "black-color-select" : "d-none"}>
                                    <span className="close-img" onClick={() => setMoreColors(false)}><i className="fas fa-times"></i></span>
                                    <div className="favourite-product-color">
                                        <h5>Please select your main product color</h5>
                                        <div className="fav-color-list">
                                            {
                                                shrtFavouriteColorAttributes.filter((option) => selectedFavColors.indexOf(option.config_product_option_value) > -1).map((option, optionIndex) =>
                                                    <div
                                                        key={`main_color_list_${optionIndex}_${option.attribute_id}`}
                                                        className={defaultColor && defaultColor.config_product_option_value == option.config_product_option_value ? "list-color active" : "list-color"}
                                                        style={{ backgroundColor: option.config_product_option_value }}
                                                        onClick={() => selectDefaultOptionDetail(option)}
                                                    >
                                                        {
                                                            defaultColor && defaultColor.config_product_option_value == option.config_product_option_value ?
                                                                <i className="fa fa-check"></i> : <></>
                                                        }
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="set-price">
                                <div className="row">
                                    <div className="col-md-8">
                                        <h5>Set a price</h5>
                                    </div>
                                    <div className="col-md-4 text-center">
                                        <Form ref={reff => formRef = reff} onSubmit={e => handleSubmit(e)}>
                                            <span className="price-bg">
                                                <Input type="number"
                                                    minLength={actualPrice || 0}
                                                    value={salesPrice || 0}
                                                    onChange={(e) => addProductPrice(e)}
                                                    validations={[min]} />
                                            </span>
                                        </Form>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-8">
                                        <h5>Your profit per item</h5>
                                    </div>
                                    <div className="col-md-4 text-center">
                                        <span className="price">€ {salesPrice - actualPrice}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="use-main-product">
                                <div className="row">
                                    <div className="col-md-8">
                                        <h5>Use as main product</h5>
                                    </div>
                                    <div className="col-md-4 text-center">
                                        <label className="switch">
                                            <input type="checkbox" checked={isMainProduct} onChange={addMainProduct} />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="product-info">
                                <h5>Product Information</h5>
                                <p>The fashionable all-rounder; our Unisex Hoodie adds something to almost every look. The wide range of color selection gives you a lot of freedom when it comes to styling. It guarantees you a stylish look and functionality!</p>
                                <ul>
                                    <li>Material: 80% Cotton, 20% Polyester</li>
                                    <li>Grammage: 280 g/m²</li>
                                    <li>Processing: Double stitching at the hems</li>
                                    <li>Form: Modern, straight cut + 1x1 rib collar</li>
                                    <li>Extras: Detachable label + Preshrunk</li>
                                    <li>Sizes: XS, S, M, L, XL, XXL, 3XL, 4XL, 5XL</li>
                                </ul>
                                <div className="row pt-4 pb-4">
                                    <div className="col-md-4">
                                        <img className="w-100" src="/static/images/bild10.png" alt="" />
                                    </div>
                                    <div className="col-md-4">
                                        <img className="w-100" src="/static/images/bild10.png" alt="" />
                                    </div>
                                    <div className="col-md-4">
                                        <img className="w-100" src="/static/images/bild10.png" alt="" />
                                    </div>
                                </div>
                            </div>
                            <div className="bottom-btn">
                                <div className="row">
                                    <div className="col-md-6">
                                        <a className="back-btn" onClick={() => { props.updatePropsData({ activeStep: 'step-2' }) }}>Back</a>
                                    </div>
                                    <div className="col-md-6">
                                        <a className="next-btn" onClick={() => saveCongifProductDesign()}>Save</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )

    } else {
        return (<div>Loading..</div>)
    }

}
