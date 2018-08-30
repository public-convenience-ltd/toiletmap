import React, { Component } from 'react';
import moment from 'moment';

import AppBar from '@material-ui/core/AppBar';

import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

import { withStyles } from '@material-ui/core/styles';

import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import StatsIcon from '@material-ui/icons/Assessment';
import SearchIcon from '@material-ui/icons/Search';
//import ToolsIcon from '@material-ui/icons/Build';
import { Link } from '@reach/router';

const styles = {
  root: {
    flexGrow: 1,
  },
  flex: {
    flex: 1,
  },
  childContainer: {
    marginLeft: '10%',
    marginRight: '10%',
  },
};

class AppLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      navOpen: false,
      defaultStatScope: {
        start: '2015-01-23',
        end: moment()
          .add(1, 'days')
          .format('YYYY-MM-DD'),
        areaType: 'All',
        area: 'All',
      },
    };
  }

  toggleDrawer = open => () => {
    this.setState({ drawer: open });
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="Menu"
              onClick={this.toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="title"
              color="inherit"
              className={classes.flex}
            >
              GBPTM Explorer
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer open={this.state.drawer} onClose={this.toggleDrawer(false)}>
          <div
            tabIndex={0}
            role="button"
            onClick={this.toggleDrawer(false)}
            onKeyDown={this.toggleDrawer(false)}
          >
            <div className={classes.list}>
              <List>
                <ListItem button>
                  <Link
                    to="statistics"
                    state={{ ...this.state.defaultStatScope }}
                  >
                    <ListItemIcon>
                      <StatsIcon />
                    </ListItemIcon>
                    <ListItemText primary="Statistics" />
                  </Link>
                </ListItem>
                <ListItem button>
                  <Link
                    to="/statistics/areas"
                    state={{ ...this.state.defaultStatScope }}
                  >
                    <ListItemIcon>
                      <StatsIcon />
                    </ListItemIcon>
                    <ListItemText primary="Statistics by Area" />
                  </Link>
                </ListItem>
                <ListItem button>
                  <Link to="/search">
                    <ListItemIcon>
                      <SearchIcon />
                    </ListItemIcon>
                    <ListItemText primary="Search" />
                  </Link>
                </ListItem>
                {/* <ListItem button>
                            <Link to={"/tools"}>
                                <ListItemIcon>
                                    <ToolsIcon />
                                </ListItemIcon>
                                <ListItemText primary="Tools" />
                            </Link>
                        </ListItem> */}
              </List>
            </div>
          </div>
        </Drawer>

        <div className={classes.childContainer}>{this.props.children}</div>
      </div>
    );
  }
}

export default withStyles(styles)(AppLayout);
