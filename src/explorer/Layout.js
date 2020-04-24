import React, { useState } from 'react';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import StatsIcon from '@material-ui/icons/Assessment';
import SearchIcon from '@material-ui/icons/Search';

import { Link, useRouteMatch } from 'react-router-dom';

function Layout(props) {
  let match = useRouteMatch();
  let [isDrawerOpen, setDrawerOpen] = useState(false);

  return (
    <div style={{flexGrow: 1}}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="Menu"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" color="inherit" style={{flex: 1}}>
            Toilet Map Explorer
          </Typography>
          {props.auth.isAuthenticated() ? (
            <Button onClick={props.auth.logout} color="inherit">
              Logout
            </Button>
          ) : (
            <Button onClick={props.auth.login} color="inherit">
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Drawer open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <div
          tabIndex={0}
          role="button"
          onClick={() => setDrawerOpen(false)}
          onKeyDown={() => setDrawerOpen(false)}
        >
          <div>
            <List>
              <ListItem button>
                <Link
                  to={`${match.path}/statistics`}
                >
                  <ListItemIcon>
                    <StatsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Statistics" />
                </Link>
              </ListItem>
              <ListItem button>
                <Link
                  to={`${match.path}/areas`}
                >
                  <ListItemIcon>
                    <StatsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Statistics by Area" />
                </Link>
              </ListItem>
              <ListItem button>
                <Link to={`${match.path}/search`}>
                  <ListItemIcon>
                    <SearchIcon />
                  </ListItemIcon>
                  <ListItemText primary="Search" />
                </Link>
              </ListItem>
            </List>
          </div>
        </div>
      </Drawer>

      <div>{props.children}</div>
    </div>
  );
}

export default Layout;
