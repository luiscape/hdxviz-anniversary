// sparklines.js

// function to generate time-series
// sparklines using an API endpoint from
// HDX. this function depends on:
// -- c3.js
// -- d3.js
function generateSparkline(data_source, div_id, verbose) {

  var div_id = '#' + div_id

  d3.json(data_source, function(error, json) {
    if (error) return console.warn(error);

    // filtering data
    var data = []
    FilterData = function(d) {
      record = {'period': d.period_end_date, 'value': d.value}
      data.push(record) 
    }

    json['resources'].forEach(FilterData)

    if (verbose) console.log(data);

    c3.generate({
      bindto: div_id,
      data: {
        x: 'period',
        x_format : '%Y-%W',
        json: data,
        keys:{
          value: ['period', 'value'],
        },
        labels: false,
        selection: {
          enabled: false,
          grouped: false,
          multiple: false,
        },
        type: 'area-spline'
      },
      point: {
        show: false
      },
      legend: {
        show: false
      },
      color: { pattern: [ "#478bc9" ] },
      size: {
          height: 100
      },
      axis : {
        x : {
          show: false,
          type : 'timeseries',
          tick : {
            format : "Week of %B %e, %Y"
          }
        },
        y: {
          show: false
        }
      }
    });

  });
}

// Function to generate metadata from
// by pulling data from the statistics API.
function generateMetadata(data_source, div_id, verbose) {
  if (verbose) console.log(data_source)
  d3.json(data_source, function(err, data) {
    if (err) return console.warn(err)

    if (verbose) console.log(data)
    var container_id = div_id + '-title'
    document.getElementById(container_id).innerHTML = '<h4><b>' + data.resources[0].name + '</b></h4>' 
                                                      + '<p>'
                                                      + data.resources[0].description
                                                      + '</p>'
  })
}


// Function to generate the container
// for the upcoming visualizations.
function generateContainer(div_id, metricid) {
  var html = '<!-- Chart row -->'
     + '<div class="col-md-4">'
     + '<div id="' + metricid + '-title"></div>'
     + '<div id="' + metricid + '">'
     + '</div>'

  document.getElementById(div_id).innerHTML += html
}

// generating sparklines
// each function calls the api endpoint
// from a resource independently.
// this causes a performance issue,
// but demonstrates how each call can be made independendtly.
function GenerateGraphics() {
  var metricids = [
        'ckan-number-of-users', 
        'ckan-number-of-datasets', 
        'ckan-number-of-orgs', 
        'ga-users', 
        'ga-uniqueevents-resource-download',
        'ga-uniqueevents-resource-share',
        'ga-uniqueevents-dataset-share',
        'ga-avgsession-duration',
        'calc-ckan-new-users',
        'calc-conversion-register',
        'calc-conversion-download',
        'calc-uniqueevents-total-share',
        'calc-conversion-share',
        'calc-ckan-new-orgs',
        'calc-number-of-new-datasets'
        ]

  for (i = 0; i < metricids.length; i++) {

    // Variables used for fetching
    // data from the our statistics API.
    // If value is weekly, have to change the
    // data parsing type in the C3.js function.
    var metricid = metricids[i]
    var period_type = 'w'
    var data_url = 'http://funnel.space/api/funnels?metricid=' + metricid + '&period_type=' + period_type
    var metadata_url = 'http://funnel.space/api/metrics?metricid=' + metricid
   
    // Calls the sparkline generating function.
    generateContainer('visualizations-container', metricid, false)
    generateSparkline(data_url, metricid, false)
    generateMetadata(metadata_url, metricid, true)

  }
}

// Generating all graphics.
GenerateGraphics()