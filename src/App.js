import React, { Component } from "react";
import PropTypes from "prop-types";
import "./App.css";
import darkBaseTheme from "material-ui/styles/baseThemes/darkBaseTheme";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import AppBar from "material-ui/AppBar";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Divider from "@material-ui/core/Divider";
// import MediaCard from "./components/MediaCard"; // was using this in earlier version
import Toggles from "./components/TogglesX.js";
import ToAddressForm from "./forms/ToAddressForm";
import FromAddressForm from "./forms/FromAddressForm";
import LabelSize from "./forms/LabelSize";
import LabelFormat from "./forms/LabelFormat";
import Button from "@material-ui/core/Button";
import Package from "./forms/Package";
import axios from "axios";
import CircularIndeterminate from "./components/CircularIndeterminate";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import Swal from "sweetalert2";
import routes from "./routes";
import { Link } from "react-router-dom";
import RateErrors from "./components/RateErrors";

// const styles = {
//   card: {
//     maxWidth: 345,
//   },
//   media: {
//     height: 140,
//   },
// };

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      rates: "",
      isLoading: false,
      data: [],
      messages: [],
      carrierAccounts: [],
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleTouchTap = this.handleTouchTap.bind(this);
    this.getRates = this.getRates.bind(this);
    this.dotGet = this.dotGet.bind(this);
    this.stopLoading = this.stopLoading.bind(this);
    this.showDetails = this.showDetails.bind(this);
  }

  handleClick(e) {
    this.setState({ anchorEl: e.currentTarget });
  }

  handleTouchTap(e) {
    this.setState({ anchorEl: null });
    this.setState({rates: ""});
  }
  getRates() {
    let setLength = 1;
    let setWidth = 1;
    let setHeight = 1;
    let setWeight = 0;
    let setPDP = "";
    let carrierAccounts = [];
    this.setState({ isLoading: true });
    let ca = document.getElementsByClassName("toggle");
    for (let i = 0; i < ca.length; i++) {
      let valid = ca[i].firstChild.getAttribute("data-toggled");
      if (valid == "true") {
        carrierAccounts.push(ca[i].firstChild.id);
      }
    }
    if (document.getElementById("length")) {
      setLength = document.getElementById("length").value;
    }
    if (document.getElementById("width")) {
      setWidth = document.getElementById("width").value;
    }
    if (document.getElementById("height")) {
      setHeight = document.getElementById("height").value;
    }
    if (document.getElementById("weight")) {
      setWeight = document.getElementById("weight").value;
    }
    if (document.getElementById("PDP")) {
      setPDP = document.getElementById("PDP").value;
    }
    if (setWeight) {
      let shipment = {
        labelSize: document.getElementById("labelSizeValue").value,
        labelFormat: document.getElementById("labelFormatValue").value,
        fromName: document.getElementById("from-name").value,
        fromStreet1: document.getElementById("from-street1").value,
        fromStreet2: document.getElementById("from-street2").value,
        fromCity: document.getElementById("from-city").value,
        fromState: document.getElementById("from-state").value,
        fromCountry: document.getElementById("from-country").value,
        fromZip: document.getElementById("from-zip").value,
        toName: document.getElementById("to-name").value,
        toStreet1: document.getElementById("to-street1").value,
        toStreet2: document.getElementById("to-street2").value,
        toCity: document.getElementById("to-city").value,
        toState: document.getElementById("to-state").value,
        toCountry: document.getElementById("to-country").value,
        toZip: document.getElementById("to-zip").value,
        carrier_accounts: carrierAccounts,
        length: parseInt(setLength),
        width: parseInt(setWidth),
        height: parseInt(setHeight),
        weight: parseInt(setWeight),
        predefinedPackage: setPDP,
      };
      setTimeout(this.dotGet({ shipment }), 1000);
      this.setState({ rates: true });
    } else {
      alert("You must specify a weight");
    }
  }

  dotGet(shipment) {
    let that = this; // this is a way to access this.state within the scope of the below nested function
    axios
      .post(`http://localhost:3001/rates`, { shipment })
      .then(function (response) {
        let temp = response.data.messages;
        that.setState({ data: response.data.rates }); //see here we are referencing that.setState instead of this.setState
        that.setState({ messages: temp });
        console.log(that.state.messages);
        that.stopLoading();
      });
  }

  stopLoading() {
    this.setState({ isLoading: false });
  }

  showDetails(e, d) {
    e.preventDefault(); //preventing some default logic that normally happens with an onclick event.
    //Below we are going to display some shipment/rate identifying numbers when the user clicks on 'details'.
    // EasyPost persists these ID's in their system so you can refer to them again. We are displaying them with Sweet Alerts
    console.log(d);
    Swal({
      html:
        `<h3>Rate Details</h3><table className="detailsTable"><tr><td><b>Shipment ID:</b> ${d.shipment_id}</td></tr>` +
        `<tr><td><b>Rate ID:</b> ${d.id}</td></tr>` +
        `<tr><td><b>Carrier:</b> ${d.carrier}</td></tr>` +
        `<tr><td><b>Service:</b> ${d.service}</td></tr>` +
        `<tr><td><b>delivery_date:</b> ${d.delivery_date}</td></tr>` +
        `<tr><td><b>delivery_date_guaranteed:</b> ${d.delivery_date_guaranteed}</td></tr>` +
        `<tr><td><b>delivery_days:</b> ${d.delivery_days}</td></tr>` +
        `</table>`,
    });
  }

  render() {
    const { anchorEl } = this.state;
    let results = this.state.data.map((d, i) => {
      // Mapping through results and rendering cards only as many as are needed
      return (
        <Card id="cardy">
          <CardActionArea className="mediaCard">
            {d.carrier === "USPS" && (
              <CardMedia
                className="mediaImg"
                height="140px"
                image="http://allvectorlogo.com/img/2016/06/united-states-postal-service-usps-logo.png"
                component="img"
              />
            )}

            {d.carrier === "UPS" && (
              <CardMedia
                className="mediaImg"
                image="https://www.ups.com/img/ups_logo.jpg"
                component="img"
                zoom=".2"
              />
            )}
            <CardContent>
              <Typography gutterBottom variant="headline" component="h1">
                {d.carrier}
              </Typography>
              <Typography component="p">${d.rate}</Typography>
              <Typography component="span">{d.service}</Typography>
              {d.est_delivery_days && (
                <Typography component="span">
                  <br></br>
                  Estimated Days for Delivery: {d.est_delivery_days}
                </Typography>
              )}
              {d.delivery_days && d.delivery_date_guaranteed && (
                <Typography component="span">
                  <br></br>
                  Guaranteed Delivery Days: {d.delivery_days}
                </Typography>
              )}
              {!d.est_delivery_days && !d.delivery_days && (
                <Typography component="span">
                  <br></br>
                  <hr style={{ width: "10px" }}></hr>
                  <hr style={{ width: "10px" }}></hr>
                </Typography>
              )}
            </CardContent>
          </CardActionArea>
          <CardActions>
            {/* <Button size="small" color="primary">
              Purchase
  </Button> */}
            <Button
              size="small"
              color="default"
              onClick={(e) => this.showDetails(e, d)}
            >
              Details
            </Button>
            <Button size="small" color="primary">
              <Link to="/Purchase">Purchase</Link>
            </Button>
          </CardActions>
        </Card>
      );
    });
    // let errors = this.state.messages.map((d, i) => {  // was thinking about how to handle rate error messages should they occur, future plans.
    //   return (
    //     <div className='errors'>
    //       {d}
    //     </div>

    //   )
    // })
    return (
      <div className="App">
        <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
          <AppBar
            title="Compare Shipping Retail Rates"
            iconClassNameRight="muidocs-icon-navigation-expand-more"
            href="#"
            // onTouchTap={this.handleTouchTap}
            onClick={this.handleClick}
            className="AppBar"
          />
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={this.handleClose}
          >
            <MenuItem onClick={this.handleTouchTap}>&larr;</MenuItem>
            <Divider />
            <Link to={{ pathname: "/" }}>
              <MenuItem onClick={this.handleTouchTap}>Get Rates</MenuItem>
            </Link>
            <Divider />
            <Link to={{ pathname: "/purchase", state: { rate: "bar" } }}>
              <MenuItem onClick={this.handleTouchTap}>Purchase Rate</MenuItem>
            </Link>
            <Divider />
            <Link to={{ pathname: "/dashboard", state: { rate: "bar" } }}>
              <MenuItem onClick={this.handleTouchTap}>
                Shipment Dashboard
              </MenuItem>
            </Link>
            <Divider />
            <MenuItem onClick={this.handleTouchTap}>Logout</MenuItem>
          </Menu>
          {!this.state.rates && window.location.hash === "#/" && window.location.hash !== "#/dashboard" && (
            <div className="bodyWrap">
              <div>
                <Toggles className="toggles" />
              </div>
              <div>
                <h3>From Address</h3>
                <FromAddressForm />
              </div>
              <div>
                <h3>To Address</h3>
                <ToAddressForm />
              </div>
              <div>
                <h3>Package</h3>
                <Package />
              </div>
              <div className="optionsWrapper">
                <h3>Options</h3>
                <LabelSize />
                <br></br>
                <LabelFormat />
              </div>
            </div>
          )}
          {!this.state.rates && window.location.hash === "#/" && (
            <Button
              className="getRates"
              color="primary"
              variant="outlined"
              onClick={this.getRates}
            >
              Get Shipping Rates
            </Button>
          )}
          {/* <br></br> <br></br>
          <ul className="line">
            <Divider />
          </ul>
          <br></br> */}
          {this.state.isLoading && <CircularIndeterminate />}
          <br></br>
          {this.state.rates && <h3>Rates</h3>}
          {this.state.rates && !this.state.isLoading && (
            <div className="cardWrap">
              {this.state.data && this.state.rates && !this.state.isLoading && (
                <div className="resultsWrapper">
                  {results}
                  <br></br>
                  <br></br>
                  {this.state.messages.length > 0 && <RateErrors errors={this.state.messages} />}
                </div>
              )}
            </div>
          )}
        </MuiThemeProvider>
        {routes}
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default App;
