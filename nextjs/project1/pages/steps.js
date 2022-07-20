import React, { Component } from 'react'
import DesignerLayoutHoc from '../core/components/Layout/Designer/DesignerLayoutHoc';
import StepOneComponent from '../components/DesignerSteps/StepOne';
import DesignBaseCtrl from '../core/components/ProductDesignBase';

class stepOne extends Component  {
	constructor(props) {
		super(props);		
	}
	
	render(){
		return (
			<DesignerLayoutHoc>
				<DesignBaseCtrl ></DesignBaseCtrl>
			</DesignerLayoutHoc>
		)
	}
}

export default stepOne;

