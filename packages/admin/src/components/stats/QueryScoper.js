import React, { Component } from 'react';

import _ from 'lodash';
import moment from 'moment';

class QueryScoper extends Component {
  constructor(props) {
    super(props);

    this.state = {
      start: moment(this.props.start),
      end: moment(this.props.end),
      area: this.props.area,
      areaType: this.props.areaType,
      areaData: this.props.areaData,
      areaTypeList: this.props.areaTypeList,
      areaList: this.props.areaList,
      minDate: this.props.minDate,
      maxDate: this.props.maxDate,
    };
  }

  changeTimescale = (key, event, value) => {
    this.setState({
      [key]: moment(value),
    });
  };

  changeAreaType = (event, index, value) => {
    this.setState({
      area: 'All',
      areaType: value,
    });
  };

  changeArea = value => {
    this.setState({
      area: value,
    });
  };

  onSubmit = () => {
    var q = _.pick(this.state, 'start', 'end', 'area', 'areaType');
    q.start = q.start.format('YYYY-MM-DD');
    q.end = q.end.format('YYYY-MM-DD');
    this.props.onChange(q);
  };

  render() {
    return <React.Fragment>{null}</React.Fragment>;
  }
}

export default QueryScoper;
