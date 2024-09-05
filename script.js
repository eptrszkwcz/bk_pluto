// Allow for variables in the css 
var cssclass = document.querySelector(":root");
var mystyle = window.getComputedStyle(cssclass);

mapboxgl.accessToken = 'pk.eyJ1IjoicHRyc3prd2N6IiwiYSI6ImNscGkxOHVvbjA2eW8ybG80NDJ3ajBtMWwifQ.L2qe-aJO35nls3sfd0WKPA';


//ASSIGN CONSTANTS ---------------------------------------------------------------

const filterGroup = document.getElementById('filter-group');
 
const map = new mapboxgl.Map({
    container: 'map', // container ID
    // style: 'mapbox://styles/mapbox/streets-v12', // style URL
    style: 'mapbox://styles/ptrszkwcz/clqmt03br00g201qrfnt9442u',
    center: [-73.9541188280487, 40.72451965912298], // starting position [lng, lat]
    zoom: 14 // starting zoom
});

// Dont forget this part for Hover!
let hoveredPolygonId = null;
let clickedPolygonId = null;

// Here we assign styling for the different options (geometry will remain the same) 
fill_styling = [
    [ 'interpolate', ['linear'], ['get', 'YearBuilt'],
        1900, '#142a8c',
        1950, '#ab2dc4',
        2000, '#d92e4a'],
    [ 'interpolate', ['linear'], ['get', 'BuiltFAR'],
        0, '#0b5c5c',
        5, '#2dd668',
        10, '#2efc1c'],
    [ 'match', ['get','LandUse'],
        '01', '#8f8f19',
        '02', '#c2c21c',
        '03', '#f7f726',
        '04', '#d69a2a',
        '05', '#d84f4c',
        '06', '#9d64b2',
        '07', '#9d64b2',
        '08', '#697ef0',
        '09', 'rgba(68,138,101,0.45)',
        '10', '#b5b5b5',
        '11', '#1c1c1c',
        'rgba(0,0,0,0)']
]

const prim_style_layer = 'BK_Pluto_4326-1r3l0b'


//SYMBOLOGY TOGGLE - IN LEGEND ---------------------------------------------------------------

// These functions turn on/off the relevant legend material
function setclasses(intlist){
    document.getElementById("entry-".concat(intlist[0])).classList.toggle("active");
    document.getElementById("toggle-".concat(intlist[0])).classList.toggle("active");
    document.getElementById("label-".concat(intlist[0])).classList.toggle("active");

    for (let i = 0; i < (intlist.length-1); i++){
        document.getElementById("entry-".concat(intlist[i+1])).classList.remove("active");
        document.getElementById("toggle-".concat(intlist[i+1])).classList.remove("active");
        document.getElementById("label-".concat(intlist[i+1])).classList.remove("active");
    }
}

let viz_type = 3; //set this to list length of fill_styling (or any integer not in range list length)

function toggle0() {
    let viz_status = map.getLayoutProperty('A-PrimStyle', 'visibility');

    if ((viz_type != 0) || (viz_type == 0 && viz_status === "none")){
        map.setLayoutProperty('A-PrimStyle', 'visibility','visible');
        map.setPaintProperty('A-PrimStyle', 'fill-color', fill_styling[0]);
        viz_type = 0;
    }
    else {
        map.setLayoutProperty('A-PrimStyle', 'visibility', 'none');
        viz_type = 3;
    }
    
    setclasses([0,1,2])
}

function toggle1() {
    let viz_status = map.getLayoutProperty('A-PrimStyle', 'visibility');

    if ((viz_type != 1) || (viz_type == 1 && viz_status === "none")){
        map.setLayoutProperty('A-PrimStyle', 'visibility','visible');
        map.setPaintProperty('A-PrimStyle', 'fill-color', fill_styling[1])
        viz_type = 1;
    }
    else {
        map.setLayoutProperty('A-PrimStyle', 'visibility', 'none');
        viz_type = 3;
    }

    setclasses([1,0,2])
}

function toggle2() {
    let viz_status = map.getLayoutProperty('A-PrimStyle', 'visibility');

    if ((viz_type != 2) || (viz_type == 2 && viz_status === "none")){
        map.setLayoutProperty('A-PrimStyle', 'visibility','visible');
        map.setPaintProperty('A-PrimStyle', 'fill-color', fill_styling[2])
        viz_type = 2;
    }
    else {
        map.setLayoutProperty('A-PrimStyle', 'visibility', 'none');
        viz_type = 3;
    }

    setclasses([2,0,1])
}


map.on('load', () => {

    map.addSource('source-A', {
        'type': 'vector',
        'url': "mapbox://ptrszkwcz.ckwtmvi8",
        'promoteId':'UniqueID' // Because mapbox fucks up when assigning IDs, make own IDs in QGIS and then set here!!!
    });

       map.addLayer({
        'id': 'A-PrimStyle',
        'type': 'fill',
        'source': 'source-A', 
        'source-layer':prim_style_layer,
        'layout': {
            'visibility': 'none'
        },
        'paint': {
            'fill-opacity': 0.7,
            'fill-color': fill_styling[0]
            },
        });


    //HIHGLIGHT ON HOVER, POLYGON ---------------------------------------------------------------
    map.addLayer({
        'id': 'A-Hover-line',
        'type': 'line',
        'source': 'source-A',
        'source-layer':prim_style_layer, 
        'layout': {},
        'paint': {
            'line-color': [ 'case', 
                ['boolean', ['feature-state', 'hover'], false], mystyle.getPropertyValue("--highl_color"), '#636363'],
            'line-width': [ 'case', 
                ['boolean', ['feature-state', 'hover'], false], 1.5, 0],
        }
    }); 

    map.addLayer({
        'id': 'A-Hover-fill',
        'type': 'fill',
        'source': 'source-A', 
        'source-layer':prim_style_layer, 
        'layout': {},
        'paint': {
            'fill-color': mystyle.getPropertyValue("--highl_color"),
            'fill-opacity': [ 'case', 
                ['boolean', ['feature-state', 'hover'], false], 0.15, 0],
        }
    }); 


    //HIHGLIGHT ON CLICK, POINT ---------------------------------------------------------------
    map.addLayer({
        'id': 'A-Click-line',
        'type': 'line',
        'source': 'source-A', 
        'source-layer':prim_style_layer,
        'layout': {},
        'paint': {
            'line-color': [ 'case', 
                ['boolean', ['feature-state', 'click'], false], mystyle.getPropertyValue("--highl_color"), '#636363'],
            'line-width': [ 'case', 
                ['boolean', ['feature-state', 'click'], false], 2.5, 0],
        }
    }); 

    map.addLayer({
        'id': 'A-Click-fill',
        'type': 'fill',
        'source': 'source-A', 
        'source-layer':prim_style_layer,
        'layout': {},
        'paint': {
            'fill-color': mystyle.getPropertyValue("--highl_color"),
            'fill-opacity': [ 'case', 
                ['boolean', ['feature-state', 'click'], false], 0.3, 0],
        }
    }); 

    // POPUP ON CLICK ---------------------------------------------------------------
    const popup = new mapboxgl.Popup({
        // closeButton: false,
    });

    // this function finds the center of a feature (to set popup) 
    function getFeatureCenter(feature) {
        let center = [];
        let latitude = 0;
        let longitude = 0;
        let height = 0;
        let coordinates = [];
        feature.geometry.coordinates.forEach(function (c) {
            let dupe = [];
            if (feature.geometry.type === "MultiPolygon")
                dupe.push(...c[0]); //deep clone to avoid modifying the original array
            else 
                dupe.push(...c); //deep clone to avoid modifying the original array
            dupe.splice(-1, 1); //features in mapbox repeat the first coordinates at the end. We remove it.
            coordinates = coordinates.concat(dupe);
        });
        if (feature.geometry.type === "Point") {
            center = coordinates[0];
        }
        else {
            coordinates.forEach(function (c) {
                latitude += c[0];
                longitude += c[1];
            });
            center = [latitude / coordinates.length, longitude / coordinates.length];
        }

        return center;
    }

    // this function adds a comma to numbers  
    function numberWithCommas(x) {
        x = x.toString();
        var pattern = /(-?\d+)(\d{3})/;
        while (pattern.test(x))
            x = x.replace(pattern, "$1,$2");
        return x;
    }

    map.on('click', 'A-PrimStyle', (e) => {
        new mapboxgl.Popup()
        feature = e.features[0]
        // console.log(feature.geometry.coordinates[0])

        // clean popup numbers 
        let plant_cap = numberWithCommas(Math.round(feature.properties.capacity_m))
        let pow_gen = numberWithCommas(Math.round(feature.properties.estimate_4))
        let cap_fac = Math.round(feature.properties.CapFac*100)

        // popup.setLngLat(feature.geometry.coordinates)
        popup.setLngLat(getFeatureCenter(feature))
        // popup.setLngLat(e.lngLat)
        .setHTML(`
                <div class = "pop-title">${feature.properties.UniqueID}</div>
                <div class = "pop-line"></div>

                <div class = "pop-entry">
                    <div class = "pop-field">Year Constructed</div>
                    <div class = "pop-value">${feature.properties.YearBuilt}</div>
                </div>
                <div class = "pop-entry">
                    <div class = "pop-field">Overall FAR</div>
                    <div class = "pop-unit">(FAR)</div>
                    <div class = "pop-value">${feature.properties.BuiltFAR}</div>
                </div>
                <div class = "pop-entry">
                    <div class = "pop-field">Number of Floors</div>
                    <div class = "pop-value">${feature.properties.NumFloors}</div>
                </div>
                <div class = "pop-entry">
                    <div class = "pop-field">Land Use</div>
                    <div class = "pop-value">${feature.properties.LandUse}</div>
                </div>
                  `)
        .addTo(map);
    });
    
    // HIGHLIGHT ON CLICK BOOLEAN ---------------------------------------------------------------
    map.on('click', 'A-PrimStyle', (e) => {
        if (e.features.length > 0) {
            if (clickedPolygonId !== null) {
                map.setFeatureState(
                    { source: 'source-A', sourceLayer: prim_style_layer, id: clickedPolygonId },
                    { click: false}
                    );
            }

            clickedPolygonId = e.features[0].id;
            // hoveredPolygonId = e.features[0].properties.featID;

            map.setFeatureState(
                { source: 'source-A', sourceLayer: prim_style_layer, id: clickedPolygonId },
                { click: true}
            );
        } 
    });

    
 
    // CLICK HIGHLIGHT CLOSE ON CLICK ANYWHERE + ON "X" --------------------------------------------------------------- 
    map.on('click', (e) => {
        let counter = 0;
        const quer_features = map.queryRenderedFeatures(e.point);
        for (let i = 0; i < quer_features.length; i++) {
            if (quer_features[i].layer.id === 'A-PrimStyle'){
                counter += 1;
            }
        }
        if (counter == 0) {
            map.setFeatureState(
                    { source: 'source-A', sourceLayer: prim_style_layer, id: clickedPolygonId },
                    { click: false }
                );
        }
        else{
            let x_Div = document.querySelector('.mapboxgl-popup-close-button')

            x_Div.addEventListener('click', function() {
                console.log('BOOM');
                map.setFeatureState(
                    { source: 'source-A', sourceLayer: prim_style_layer, id: clickedPolygonId },
                    { click: false }
                );
            });

        }
    }); 


    // CHANGE MOUSE APPEARANCE --------------------------------------------------------------- 
    map.on('mouseenter', 'A-PrimStyle', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    
    map.on('mouseleave', 'A-PrimStyle', () => {
        map.getCanvas().style.cursor = 'move';
    });

  
    
    // HIGHLIGHT ON HOVER BOOLEAN --------------------------------------------------------------- 
    map.on('mousemove', 'A-PrimStyle', (e) => {
        if (e.features.length > 0) {

            if (hoveredPolygonId !== null) {
                map.setFeatureState(
                    { source: 'source-A', sourceLayer: prim_style_layer, id: hoveredPolygonId },
                    { hover: false }
                    );
            }

            hoveredPolygonId = e.features[0].id;
            // hoveredPolygonId = e.features[0].properties.featID;

            map.setFeatureState(
                { source: 'source-A', sourceLayer: prim_style_layer, id: hoveredPolygonId },
                { hover: true }
            );
        }
    });
 
        
    // When the mouse leaves the state-fill layer, update the feature state of the
    map.on('mouseleave', 'A-PrimStyle', () => {
        if (hoveredPolygonId !== null) {
            map.setFeatureState(
                { source: 'source-A', sourceLayer: prim_style_layer, id: hoveredPolygonId },
                { hover: false }
            );
        }
        hoveredPolygonId = null;
    });

});
