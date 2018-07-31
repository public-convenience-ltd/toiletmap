import React, { Component } from 'react';
import UpdateAdminGeo from './tools/UpdateAdminGeo';
import LgaImporter from './tools/LgaImporter';

class Tools extends Component {
  render() {
    return (
      <div>
        <h1>Tools</h1>
        <UpdateAdminGeo />
        &nbsp;
        <LgaImporter />
        &nbsp;
      </div>
    );
  }
}

export default Tools;
