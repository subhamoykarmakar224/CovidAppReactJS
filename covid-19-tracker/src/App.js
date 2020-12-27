import React, { useState, useEffect } from "react";
import './App.css';
import { Card, CardContent, FormControl, MenuItem, Select } from '@material-ui/core';
import InfoBox from "./components/InfoBox";
import Map from "./components/Map";
import Table from "./components/Table";
import { sortData, prettyPrintStat } from "./util/util";
import LineGraph from "./components/LineGraph";
import "leaflet/dist/leaflet.css";

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({
    lat: 34.80746, lng: -40.4796
  });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState('cases');

  // First Load API call for the worldwide case
  useEffect(()=> {
    fetch('https://disease.sh/v3/covid-19/all')
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      })
  }, []);

  // Fetch and Populate the Dropdown box.
  useEffect(() => {
    const getCountriesData = async() => {
      fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => (
            {
              name: country.country,
              value: country.countryInfo.iso2
            }));

          const sortedData = sortData(data);

          setMapCountries(data);
          setTableData(sortedData);
          setCountries(countries);
        });
    };
    getCountriesData();
  }, []);

  // Country Dropdown onChange handler function
  const onCountryChange = async (e) => {
    const countryCode = e.target.value;
    const url = countryCode === 'worldwide' ? 
    'https://disease.sh/v3/covid-19/all' :
    `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCountry(countryCode);
        setCountryInfo(data);
        // console.log(data.countryInfo)
        // setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        try {
          setMapCenter([data.countryInfo.lat, data.countryInfo.long]);  
        } catch (error) {
          setMapCenter([34.80746, -40.4796]);
        }
        
      });
  };

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
        {/* Header :: Title + Dropdown field */}
        <h1>COVID-19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              value={country}
              onChange={onCountryChange}
              >
                <MenuItem value="worldwide">Worldwide</MenuItem>
                {
                  countries.map(country => (
                    <MenuItem value={country.value}>{country.name}</MenuItem>
                  ))
                }
              </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          <InfoBox title="Coronavirus Cases"
            isRed
            active={casesType === "cases" }
            onClick= { e => setCasesType('cases') }
            cases={prettyPrintStat(countryInfo.todayCases)} 
            total={prettyPrintStat(countryInfo.cases)} />

          <InfoBox title="Recovered"
            isRed
            isGreen
            active={casesType === "recovered" }
            onClick= { e => setCasesType('recovered') }
            cases={prettyPrintStat(countryInfo.todayRecovered)} 
            total={prettyPrintStat(countryInfo.recovered)} />

          <InfoBox title="Deaths" 
            active={casesType === "deaths" }
            onClick= { e => setCasesType('deaths') }
            cases={prettyPrintStat(countryInfo.todayDeaths)} 
            total={prettyPrintStat(countryInfo.deaths)} />

        </div>

        {/* Map */}
        <Map 
          casesType={casesType}
          countries={mapCountries}
          center={mapCenter} 
          zoom={mapZoom} />
      </div>

      <Card className="app__right">
        <CardContent>
          <h3>Live Cases by Country</h3>
          {/* Table */}
          <Table countries={tableData} />

          <h3 className="app__right__graphTitle">Worldwide new {casesType} </h3>
          <LineGraph 
            className="app__graph"
            casesType={casesType}
          />
          {/* Graph */}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
