import React, { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import useSWR from "swr"; // React hook to fetch the data
import lookup from "country-code-lookup"; // npm module to get ISO Code for countries

import "./App.scss";

// Mapbox css - needed to make tooltips work later in this article
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = "pk.eyJ1IjoiYmV2a29sb2xpIiwiYSI6ImNrOTQyM216cjAxbHgzcWxnYjMyNGNrdXUifQ.ek8ioeDEErkXLCOZ7YC-Ww";

function App() {
  const mapboxElRef = useRef(null); // DOM element to render map
  const fetcher = url =>
    fetch(url)
      .then(r => r.json())
      .then(data =>
        data.map((point, index) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [
              point.coordinates.longitude,
              point.coordinates.latitude
            ]
          },
          properties: {
            id: index, // unique identifier in this case the index
            country: point.country,
            province: point.province,
            cases: point.stats.confirmed,
            deaths: point.stats.deaths
          }
        }))
      );

  // Fetching our data with swr package
  const { data } = useSWR("https://corona.lmao.ninja/v2/jhucsse", fetcher);

  // Initialize our map
  useEffect(() => {
    // You can store the map instance with useRef too
    if (data) {
      const map = new mapboxgl.Map({
        container: mapboxElRef.current,
        style: "mapbox://styles/notalemesa/ck8dqwdum09ju1ioj65e3ql3k",
        center: [16, 27], // initial geo location
        zoom: 2 // initial zoom
      });

      map.addControl(new mapboxgl.NavigationControl());

      // Call this method when the map is loaded
      
      map.once("load", function() {
        // Add our SOURCE
        // with id "points"
        map.addSource("points", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: data
          }
        });

        // Add our layer
        map.addLayer({
          id: "circles",
          source: "points", // this should be the id of the source
          type: "circle",
          // paint properties
          paint: {
            "circle-opacity": 0.75,
            "circle-stroke-width": [
              "interpolate",
              ["linear"],
              ["get", "cases"],
              1, 1,
              100000, 1.75,
            ],
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["get", "cases"],
              1, 4,
              1000, 8,
              4000, 10,
              8000, 14,
              12000, 18,
              100000, 40
            ],
            "circle-color": [
              "interpolate",
              ["linear"],
              ["get", "cases"],
              1, '#ffffb2',
              5000, '#fed976',
              10000, '#feb24c',
              25000, '#fd8d3c',
              50000, '#fc4e2a',
              75000, '#e31a1c',
              100000, '#b10026'
            ]
          }
        });
      });
    }

    // Add navigation controls to the top right of the canvas
  }, [data]);

  return (
    <div className="App">
      <div className="mapContainer">
        {/* Assigned Mapbox container */}
        <div className="mapBox" ref={mapboxElRef} />
      </div>
    </div>
  );
}

export default App;
