// Dev-helper
function print_filter(filter){
    var f=eval(filter);
    if (typeof(f.length) != "undefined") {}else{}
    if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
    if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
    console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
};

// Defining the chart elements.
var categories_pie          = dc.pieChart("#categories");

// Histograms
var severity_bar            = dc.barChart("#severity");
var exposure_bar            = dc.lineChart("#exposure");
var hazard_bar              = dc.barChart("#hazard");
var poverty_bar             = dc.barChart("#poverty");

// Map
var adm4_map                = dc.geoChoroplethChart("#map");

// Indexing data.
var cf = crossfilter(data);

// Defining the cross-filter dimensions.
cf.pcode = cf.dimension(function(d){ return d.p_code });
cf.category = cf.dimension(function(d){ return d.severity_category; });

// Defining the histogram bins.
cf.exposure = cf.dimension(function(d) { return d.exposure_population });
cf.severity = cf.dimension(function(d) { d.severity_bin = Math.round(d.severity_normalized); return d.severity_bin; });
cf.hazard = cf.dimension(function(d) { d.hazard_intensiry_bin = Math.round(d.hazard_intensiry); return d.hazard_intensiry_bin; });
cf.poverty = cf.dimension(function(d) { d.vulnerability_poverty_bin = Math.round(d.vulnerability_poverty); return d.vulnerability_poverty_bin; });

// Organizing the cross-filter groups.
var all = cf.groupAll();
var pcode = cf.pcode.group();
var category = cf.category.group();
var severity = cf.severity.group();
var exposure = cf.exposure.group();
var hazard = cf.hazard.group();
var poverty = cf.poverty.group();

severity_bar.width(200).height(100)
        .x(d3.scale.linear().domain([0,10]))
        .margins({top: 20, left: 40, right: 30, bottom: 20})
        .brushOn(true)
        .dimension(cf.severity)
        .group(severity)
        .elasticY(true)
        .renderVerticalGridLines(true)
        .centerBar(true);

exposure_bar.width(200).height(100)
        .x(d3.scale.linear().domain([0,2]))
        .margins({top: 20, left: 40, right: 30, bottom: 20})
        .brushOn(true)
        .dimension(cf.exposure)
        .group(exposure)
        .elasticY(true)
        .renderArea(true)
        .renderVerticalGridLines(true);

hazard_bar.width(200).height(100)
        .x(d3.scale.linear().domain([0,10]))
        .margins({top: 20, left: 40, right: 30, bottom: 20})
        .brushOn(true)
        .dimension(cf.hazard)
        .group(hazard)
        .elasticY(true)
        .elasticX(false)
        .renderVerticalGridLines(true)
        .centerBar(true);

poverty_bar.width(200).height(100)
        .x(d3.scale.linear().domain([0,10]))
        .margins({top: 20, left: 40, right: 30, bottom: 20})
        .brushOn(true)
        .dimension(cf.hazard)
        .group(hazard)
        .renderVerticalGridLines(true)
        .elasticY(true)
        .centerBar(true);

categories_pie.width(500).height(200)
        .dimension(cf.category)
        .ordering(function(d){ return -d.category })
        .group(category)
        .colors(['#ffffb2','#fed976','#feb24c','#fd8d3c','#f03b20','#bd0026'])
        .colorDomain([0,5])
        .innerRadius(70)
        .legend(dc.legend(['Lowest', 'Low', 'Medium-low', 'Medium-high', 'High', 'Highest']).x(2).y(30).itemHeight(13).gap(5))
        .renderLabel(true)
        .renderTitle(false)
        .filter('5.High')
        .filter('6.Highest')
        .colorAccessor(function(d, i){return i%6;});

dc.dataCount("#count-info")
    .dimension(cf)
    .group(all);

// Map properties.
var center_points = [85.3, 28];
var map_scale = 4300;
// var margin = {top: 200, right: 0, bottom: 20, left: 0}
// var map_width = document.getElementById("map").offsetWidth
// var map_height = document.getElementById("map").offsetHeight;

// Adm4 map.
adm4_map.width(700).height(450)
        .dimension(cf.pcode)
        .group(pcode)
        .colors(['#ecf0f1', '#16a085'])
        .colorDomain([0, 1])
        .colorAccessor(function (d) {
            if(d>0){
                return 1;
            } else {
                return 0;
            }
        })
        .overlayGeoJson(adm4.features, "OCHA_PCODE", function (d) {
            return d.properties.OCHA_PCODE;
        })
        .projection(d3.geo.mercator()
            .center(center_points)
            .scale(map_scale))
        .title(function(d){
            return d.VDC_NAME;
        });
        
dc.renderAll();

var projection = d3.geo.mercator()
    .center(center_points)
    .scale(map_scale);

var path = d3.geo.path()
    .projection(projection);

var g = d3.selectAll("#map")
    .select("svg")
    .append("g");

// Adm0 map.     
g.selectAll("path")
    .data(adm0.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("stroke",'#2c3e50')
    .attr("stroke-width",'2px')
    .attr("fill",'none')
    .attr("class","macroregiao");
    
var mapLabels = d3.selectAll("#map")
    .select("svg")
    .append("g");
