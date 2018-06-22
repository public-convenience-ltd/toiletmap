import React, { Component } from 'react';

import _ from 'lodash';
import moment from 'moment';

// import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';
// import RaisedButton from 'material-ui/RaisedButton';
// import SelectField from 'material-ui/SelectField';
// import MenuItem from 'material-ui/MenuItem';
// import RefreshIcon from 'material-ui/svg-icons/navigation/refresh';
// import DatePicker from 'material-ui/DatePicker';
// import AutoComplete from 'material-ui/AutoComplete';

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
    return (
      <React.Fragment>{null}</React.Fragment>
      // <Toolbar
      // style={{
      //     display: 'flex',
      //     flexFlow: 'row wrap',
      //     justifyContent:'space-between',
      //     paddingLeft: '10px',
      //     height: 'auto',
      //     overflow: 'hidden',
      //     marginLeft: '-256px',
      //     marginRight: '-256px'
      // }}>
      //     <ToolbarGroup>
      //         <ToolbarTitle text="Timescale"/>
      //         <DatePicker
      //             hintText="From"
      //             container="inline"
      //             mode="landscape"
      //             style={{width: '156px'}}
      //             value={this.state.start.toDate()}
      //             minDate={this.state.minDate.toDate()}
      //             maxDate={this.state.maxDate.toDate()}
      //             formatDate={date => moment(date).format('MMM Do YYYY')}
      //             onChange={_.partial(this.changeTimescale, 'start')}
      //             />
      //         <ToolbarTitle text="to"/>
      //         <DatePicker
      //             hintText="To"
      //             container="inline"
      //             mode="landscape"
      //             style={{width: '156px'}}
      //             value={this.state.end.toDate()}
      //             minDate={this.state.minDate.toDate()}
      //             maxDate={this.state.maxDate.toDate()}
      //             formatDate={date => moment(date).format('MMM Do YYYY')}
      //             onChange={_.partial(this.changeTimescale, 'end')}
      //             />
      //     </ToolbarGroup>
      //     <ToolbarGroup>
      //         <ToolbarTitle text="Geography"/>
      //         <SelectField
      //             value={this.state.areaType}
      //             onChange={this.changeAreaType}
      //             >
      //             { _.map(this.state.areaTypeList, (type, i) => {
      //                 return (
      //                     <MenuItem value={type} primaryText={type} key={type + '_' + i} />
      //                 );
      //             })}
      //             <MenuItem value={''} primaryText="No Area Data"/>
      //         </SelectField>
      //         <AutoComplete
      //           id="area"
      //           openOnFocus={true}
      //           filter={AutoComplete.fuzzyFilter}
      //           dataSource={this.state.areaData[this.state.areaType]}
      //           onNewRequest={this.changeArea}
      //           searchText={this.state.area}
      //         />
      //     </ToolbarGroup>
      //     <ToolbarGroup>
      //         <RaisedButton
      //           label="Refresh"
      //           icon={<RefreshIcon />}
      //           primary={true}
      //           onClick={this.onSubmit}
      //           disabled={this.state.fetching}
      //           />
      //     </ToolbarGroup>
      // </Toolbar>
    );
  }
}

export default QueryScoper;
