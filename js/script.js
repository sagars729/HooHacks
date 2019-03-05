var markers = [];
var map;
var autocomplete;
var snapmap = document.getElementById('snap')
var poistr = '<div class="row"><div class="col s6"><p class="centerel">type</p></div><div class="col s6"><p class="centerel">name</p></div></div>'
var nmstr = '<p class="centerel">No Marker Selected. Hover Over a Marker To Select.</p>'
var compstr = '<div class="row" id="compare"><div class="col s4"><p class="centerel"><strong>Category</strong></p></div><div class="col s4"><p class="centerel"><strong>Min</strong></p></div><div class="col s4"><p class="centerel"><strong>Max</strong></p></div></div>'
var compstrchi = '<div class="row" id="compare"><div class="col s4"><p class="centerel"><strong>Category</strong></p></div><div class="col s2"><p class="centerel"><strong>Min</strong></p></div><div class="col s2"><p class="centerel"><strong>MNIND</strong></p></div><div class="col s2"><p class="centerel"><strong>Max</strong></p></div><div class="col s2"><p class="centerel"><strong>MXIND</strong></p></div></div>'
google.charts.load('current', {'packages':['corechart']});
var cinfo;
async function update(){
    for(i=0; i < markers.length; i+=1){
        lat = markers[i].position.lat();
        lng = markers[i].position.lng();
        await $.get({
            url: 'https://maps.googleapis.com/maps/api/geocode/json',
            data: {'latlng':lat+','+lng,'key': 'AIzaSyBaQGwmf-KpZHzdv0q5uguQZ5S5fVhxp80'},
            success: function(data){
                var comp = data["results"][0]["address_components"]
                for (j=0; j < comp.length; j+=1){
                    if (data["results"].length <= 0) continue;
                    if (comp[j]["types"].length == 1 && comp[j]["types"][0] == "postal_code"){
                        getCInfo(comp[j]["long_name"],true,i);
                    }
                }
            },
            error: function(data){
                console.log(data)
            }
        });
    }
    return true;
}
function compare(){
    var mn = {'avg_prop_tax': -1, 'exptotal': -1, 'salavecy': -1, 'eduindex': -1, 'rskcyrisk': -1, 'cocrmcytotc': -1, 'tmpavejul': -1}
    var mx = {'avg_prop_tax': -1, 'exptotal': -1, 'salavecy': -1, 'eduindex': -1, 'rskcyrisk': -1, 'cocrmcytotc': -1, 'tmpavejul': -1}
    var keys = ["avg_prop_tax","exptotal","salavecy","eduindex","rskcyrisk","cocrmcytotc","tmpavejul"]
    var mnpos = [0,0,0,0,0,0,0]
    var mxpos = [0,0,0,0,0,0,0]
    for(i=0; i < markers.length; i+=1){
        for(j = 0; j < keys.length; j+=1){
            v = markers[i]["cinfo"][keys[j]]
            if(mn[keys[j]] == -1 || mn[keys[j]] > v){ 
                mn[keys[j]] = v;
                mnpos[j] = i;
            }
            if(mx[keys[j]] == -1 || mx[keys[j]] < v){
                mx[keys[j]] = v;
                mxpos[j] = i;
            }
        }
    }
    document.getElementById("compare").innerHTML = compstr;
    var labs = ["Average Property Tax","Total Expenditure","Average Employee Salary","Education Index","Total Climate Index","Total Crime Index","Average Temperature In July"]
    for(i=0; i < keys.length; i+=1){
        document.getElementById("compare").innerHTML+=compstrchi.replace('Category',labs[i]).replace('<strong>Max</strong>',mx[keys[i]]).replace('<strong>MNIND</strong>',mnpos[i]).replace('<strong>Min</strong>',mn[keys[i]]).replace('<strong>MXIND</strong>',mxpos[i])
    }
    
}
function revGeoCode(lat,lng){
    $.get({
        url: 'https://maps.googleapis.com/maps/api/geocode/json',
        data: {'latlng':lat+','+lng,'key': 'AIzaSyBaQGwmf-KpZHzdv0q5uguQZ5S5fVhxp80'},
        success: function(data){
            if (data["results"].length <= 0) return;
            document.getElementById('addtext').innerHTML = data["results"][0]["formatted_address"]
            var comp = data["results"][0]["address_components"]
            for (i=0; i < comp.length; i+=1){
                if (comp[i]["types"].length == 1 && comp[i]["types"][0] == "postal_code"){
                    console.log(comp[i]["long_name"])
                    getPOI(comp[i]["long_name"])
                    getCInfo(comp[i]["long_name"],false,-1)
                }
            }
        },
        error: function(data){
            console.log(data)
        }
    });
}
function onDragEnd(){
    snapmap.src = "https://map.snapchat.com/embed/1551588780046/@" + this.position.lat() + "," + this.position.lng() + ",12.00z";
    update()
    setTimeout(function(){ compare();}, 1000);
}
function onMouseOver(){
    document.getElementById("lattext").innerHTML = Math.round(this.position.lat()*1000)/1000;
    document.getElementById("lngtext").innerHTML = Math.round(this.position.lng()*1000)/1000;
    revGeoCode(this.position.lat(),this.position.lng())
}
function onClickMarker(){
    return;
}
function onPlaceChanged(){
    var place = autocomplete.getPlace();
    if(place.geometry){
        loc = place.geometry.location
        map.panTo(place.geometry.location);
        map.setZoom(14);
        var marker = new google.maps.Marker({'position': {lat: loc.lat(), lng: loc.lng()}, 'map':map, 'animation': google.maps.Animation.DROP, 'draggable': true, 'label': "" + markers.length})
        marker.addListener('dragend', onDragEnd);
        marker.addListener('mouseover', onMouseOver);
        marker.addListener('click', onClickMarker);
        markers.push(marker)
        snapmap.src = "https://map.snapchat.com/embed/1551588780046/@" + loc.lat() + "," + loc.lng() + ",12.00z";
        update()
        setTimeout(function(){ compare();}, 1000);
    }
}
function showRaceStats(){
    clearData()
    var content = document.getElementById('chart_div');
    if(!cinfo){ content.innerHTML = nmstr; return; }
    document.getElementById("card_title").innerHTML = "Race and Gender" 
    
    var data = google.visualization.arrayToDataTable([
        ['Gender', 'Number of People'],
        ['Female', parseInt(cinfo["popfemale"])],            
        ['Male', parseInt(cinfo["popmale"])],            
    ]);
    var options = {'title':'Gender Distribution'};
    var chart = new google.visualization.PieChart(document.getElementById('multi_chart_1'));
    chart.draw(data,options);
    
    var data = google.visualization.arrayToDataTable([
        ['Race', 'Number of People'],
        ['American Indian', parseInt(cinfo["raceamerind"])],            
        ['Asian', parseInt(cinfo["raceasian"])],  
        ['Black', parseInt(cinfo["raceblack"])],            
        ['Hawaiian', parseInt(cinfo["racehawai"])], 
        ['Hispanic', parseInt(cinfo["racehisp"])],            
        ['Multi', parseInt(cinfo["racemulti"])], 
        ['White', parseInt(cinfo["raceother"])]
        
    ]);
    var options = {'title':'Race Distribution'};
    var chart = new google.visualization.PieChart(document.getElementById('multi_chart_2'));
    chart.draw(data,options);
}
function showLivingStats(){
    clearData()
    var content = document.getElementById('chart_div');
    if(!cinfo){ content.innerHTML = nmstr; return; }
    document.getElementById("card_title").innerHTML = "Cost of Living" 
    var lower = document.getElementById('lower');
    lower.innerHTML = '<br><div class="row"><div class="col s6">Average Property Tax</div><div class="col s6">avgprop</div></div><div class="row"><div class="col s6">Sales Tax Rate</div><div class="col s6">avgsal</div></div><div class="row"><div class="col s6">Total Expenditure Per Household</div><div class="col s6">totexp</div></div></div><div class="row"><div class="col s6">Travel Time</div><div class="col s6">tratim</div></div></div>'.replace("avgprop",cinfo["avg_prop_tax"]).replace("avgsal",cinfo["salestaxrate"]).replace("totexp",cinfo["exptotal"]).replace("tratim",cinfo["trwave"])
}
function showHousingStats(){
    clearData()
    document.getElementById("card_title").innerHTML = "Housing Stats"
    var content = document.getElementById('chart_div');
    if(!cinfo){ content.innerHTML = nmstr; return; }
    
    var data = google.visualization.arrayToDataTable([
        ['Type', 'Price'],
        ['One-Bed', parseInt(cinfo["one_bed_county"])],            
        ['Studio', parseInt(cinfo["studio_county"])],            
        ['Two-Bed', parseInt(cinfo["two_bed_county"])], 
        ['Three-Bed', parseInt(cinfo["three_bed_county"])],
        ['Four-Bed', parseInt(cinfo["four_bed_county"])],
    ]);
    var options = {'title':'Price of Various Housing'};
    var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
    chart.draw(data,options);
    var lower = document.getElementById('lower');
    lower.innerHTML = '<br><div class="row"><div class="col s6">Day Population</div><div class="col s6">daypop</div></div><div class="row"><div class="col s6">Total Dwellings</div><div class="col s6">totdwe</div></div><div class="row"><div class="col s6">Total Vacant Dwellings</div><div class="col s6">dwlv</div></div></div>'.replace("daypop",cinfo["daypop"]).replace("totdwe",cinfo["dwltotal"]).replace("dwlv",cinfo["dwlvacnt"])
}
function showIncomeStats(){
    clearData()
    document.getElementById("card_title").innerHTML = "Income Distribution"
    var content = document.getElementById('chart_div');
    var lower = document.getElementById('lower');
    lower.innerHTML = '<br><div class="row"><div class="col s6">Median Household Income</div><div class="col s6">medinc</div></div><div class="row"><div class="col s6">Average Employee Salary</div><div class="col s6">avgsal</div></div><div class="row"><div class="col s6">Average Household Income</div><div class="col s6">avginc</div></div></div>'.replace("medinc",cinfo["inccymedd"]).replace("avginc",cinfo["inccyavehh"]).replace("avgsal",cinfo["salavecy"])
    if(!cinfo){ content.innerHTML = nmstr; return; }
    
    var data = google.visualization.arrayToDataTable([
        ['Income', 'Number of People'],
        ['0-10k', parseInt(cinfo["hincy00_10"])],            
        ['10k-15k', parseInt(cinfo["hincy10_15"])],            
        ['15k-20k', parseInt(cinfo["hincy15_20"])],
        ['20k-25k', parseInt(cinfo["hincy20_25"])], 
        ['25k-30k', parseInt(cinfo["hincy25_30"])],
        ['30k-35k', parseInt(cinfo["hincy30_35"])],            
        ['35k-40k', parseInt(cinfo["hincy35_40"])],            
        ['40k-45k', parseInt(cinfo["hincy40_45"])],
        ['45k-50k', parseInt(cinfo["hincy45_50"])], 
        ['50k-60k', parseInt(cinfo["hincy50_60"])],
        ['60k-75k', parseInt(cinfo["hincy60_75"])],
        ['75k-100k', parseInt(cinfo["hincy75_100"])], 
        ['100k-125k', parseInt(cinfo["hincy100_125"])],
        ['125k-150k', parseInt(cinfo["hincy125_150"])],            
        ['150k-200k', parseInt(cinfo["hincy150_200"])],            
        ['200k-250k', parseInt(cinfo["hincy200_250"])],
        ['250k-500k', parseInt(cinfo["hincy250_500"])], 
        ['500k+', parseInt(cinfo["hincygt_500"])]
    ]);
    var options = {'title':'Income Distribution'};
    var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
    chart.draw(data,options);
}
function showEduStats(){
    clearData()
    document.getElementById("card_title").innerHTML = "Education Distribution"
    var content = document.getElementById('chart_div');
    if(!cinfo){ content.innerHTML = nmstr; return; }
    
    var data = google.visualization.arrayToDataTable([
        ['Education Level', 'Number of People'],
        ['< 9th Grade', parseInt(cinfo["edultgr9"])],            
        ['Some High School', parseInt(cinfo["edushsch"])],            
        ['High School Graduate', parseInt(cinfo["eduhsch"])], 
        ['Some College', parseInt(cinfo["eduscoll"])],
        ['Associate Degree', parseInt(cinfo["eduassoc"])],
        ['Bachelor\'s Degree', parseInt(cinfo["edubach"])],            
        ['Graduate Degree', parseInt(cinfo["edugrad"])]
        
    ]);
    var options = {'title':'Education Distribution'};
    var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
    chart.draw(data,options);
    var lower = document.getElementById('lower');
    lower.innerHTML = '<br><div class="row"><div class="col s6">Education Index</div><div class="col s6">eduind</div></div><div class="row"><div class="col s6">Nearest Four Year Public College</div><div class="col s6">fouryr</div></div><div class="row"><div class="col s6">Nearest Two Year Public College</div><div class="col s6">twoyr</div></div></div>'.replace("eduind",cinfo["eduindex"]).replace("twoyr",cinfo["jc"]).replace("fouryr",cinfo["fouryr"])
}
function showAgeStats(){
    clearData()
    document.getElementById("card_title").innerHTML = "Age Distribution"
    var content = document.getElementById('chart_div');
    if(!cinfo){ content.innerHTML = nmstr; return; }
    
    var data = google.visualization.arrayToDataTable([
        ['Age', 'Number of People'],
        ['0-4', parseInt(cinfo["age00_04"])],            
        ['5-9', parseInt(cinfo["age05_09"])],            
        ['10-14', parseInt(cinfo["age10_14"])],
        ['15-19', parseInt(cinfo["age15_19"])], 
        ['20-24', parseInt(cinfo["age20_24"])],
        ['25-29', parseInt(cinfo["age25_29"])],            
        ['30-34', parseInt(cinfo["age30_34"])],            
        ['35-39', parseInt(cinfo["age35_39"])],
        ['40-44', parseInt(cinfo["age40_44"])], 
        ['45-49', parseInt(cinfo["age45_49"])],
        ['50-54', parseInt(cinfo["age50_54"])],
        ['55-59', parseInt(cinfo["age55_59"])], 
        ['60-64', parseInt(cinfo["age60_64"])],
        ['65-69', parseInt(cinfo["age65_69"])],            
        ['70-74', parseInt(cinfo["age70_74"])],            
        ['75-79', parseInt(cinfo["age75_79"])],
        ['80-84', parseInt(cinfo["age80_84"])], 
        ['85+', parseInt(cinfo["agegt85"])],
        
    ]);
    var options = {'title':'Age Distribution'};
    var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
    chart.draw(data,options);
}
function showHealthStats(){
    clearData()
    document.getElementById("card_title").innerHTML = "Health & Safety"
    var content = document.getElementById('chart_div');
    if(!cinfo){ content.innerHTML = nmstr; return; }
    
    var data = google.visualization.arrayToDataTable([
        ['Crime Risks', 'Index'],
        ['Assault Risk', parseInt(cinfo["cocrmcyasst"])],            // RGB value
        ['Burglary Risk', parseInt(cinfo["cocrmcyburg"])],            // English color name
        ['Larceny', parseInt(cinfo["cocrmcylarc"])],
        ['Murder', parseInt(cinfo["cocrmcymurd"])], // CSS-style declaration
        ['Motor Vehicle Theft', parseInt(cinfo["cocrmcymveh"])],
        ['Personal Crime', parseInt(cinfo["cocrmcyperc"])],
        ['Property Crime', parseInt(cinfo["cocrmcyproc"])],
        ['Rape', parseInt(cinfo["cocrmcyrape"])],
        ['Robbery', parseInt(cinfo["cocrmcyrobb"])],
    ]);
    var options = {'title':'Index of Risk of Crime'};
    var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
    chart.draw(data,options);
    var lower = document.getElementById('lower');
    lower.innerHTML = '<br><div class="row"><div class="col s6">Total Crime</div><div class="col s6">totcri</div></div>'.replace("totcri",cinfo["cocrmcytotc"])
    
    var data = google.visualization.arrayToDataTable([
        ['Pollutant', 'Index'],
        ['PM', parseInt(cinfo["pm10"])],            // RGB value
        ['Lead', parseInt(cinfo["lead"])],            // English color name
        ['Ozone', parseInt(cinfo["ozone"])],
        ['CO', parseInt(cinfo["carbmono"])], // CSS-style declaration
        ['Air Pollution', parseInt(cinfo["airx"])]
    ]);
    var options = {'title':'Index of Harmful Pollutants'};
    var chart = new google.visualization.ColumnChart(document.getElementById('chart_div_2'));
    chart.draw(data,options);
    var lower = document.getElementById('lower_2');
    lower.innerHTML = '<br><div class="row"><div class="col s6">Average Temperature in January</div><div class="col s6">avgjan</div></div><div class="row"><div class="col s6">Average Temperature in July</div><div class="col s6">avgjul</div></div>'.replace("avgjan",cinfo["tmpavejan"]).replace("avgjul",cinfo["tmpavejul"])

    var data = google.visualization.arrayToDataTable([
        ['Natural Disaster', 'Index'],
        ['Hail', parseInt(cinfo["rskcyhanx"])],            
        ['Hurricane', parseInt(cinfo["rskcyhunx"])],            
        ['Earthquake', parseInt(cinfo["rskcyqwak"])],
        ['Tornado', parseInt(cinfo["rskcytonx"])],
        ['Wind', parseInt(cinfo["rskcywinx"])]
    ]);
    var options = {'title':'Index of Natural Disasters'};
    var chart = new google.visualization.ColumnChart(document.getElementById('chart_div_3'));
    chart.draw(data,options);
    var lower = document.getElementById('lower_3');
    lower.innerHTML = '<br><div class="row"><div class="col s6">Total Weather Risk</div><div class="col s6">totwet</div></div>'.replace("totwet",cinfo["rskcyrisk"])
    
}
function initMap() {
    var loc = {lat: 38.81695, lng: -77.16785};
    map = new google.maps.Map(document.getElementById('map'), {zoom: 14, center: loc});
    var marker = new google.maps.Marker({'position': loc, 'map': map, 'animation': google.maps.Animation.DROP, 'draggable': true, 'label': "" + markers.length})
    marker.addListener('dragend', onDragEnd);
    marker.addListener('mouseover', onMouseOver);
    marker.addListener('click', onClickMarker);
    markers.push(marker)
    autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'),{});
    autocomplete.addListener('place_changed', onPlaceChanged);
    update()
    setTimeout(function(){ compare();}, 1000);
}
function getPOI(zipcode){
        $.get({
    	url: 'https://search.onboard-apis.com/poisearch/v2.0.0/poi/geography?', 
    	data: {'PostalCodekey': zipcode, 'SearchDistance' : '5', 'RecordLimit': '30'},
    	headers: {'ApiKey': '4c6c63780ff1a86c602012fc5c647cce', 'Accept': 'application/json'},
    	success: function(data){
    		var arr = data["response"]["result"]["package"]["item"];
    		var poi = document.getElementById('poi')
    		poi.innerHTML = ""
    		//console.log(data)
    		for(i=0; i < arr.length; i+=1){
    		    //console.log(arr[i]["business_category"] + " , " + arr[i]["name"])
    		    poi.innerHTML+=poistr.replace("type",arr[i]["business_category"]).replace("name",arr[i]["name"]);
    		}
    	},
    	error: function(data){
    		console.log(data)
    	}
    });
}
function clearData(){
    document.getElementById('lower').innerHTML = ""
    document.getElementById('lower_2').innerHTML = ""
    document.getElementById('lower_3').innerHTML = ""
    document.getElementById("multi_chart_1").innerHTML = ""
    document.getElementById("multi_chart_2").innerHTML = ""
    document.getElementById("chart_div").innerHTML = ""
    document.getElementById("chart_div_2").innerHTML = ""
    document.getElementById("chart_div_3").innerHTML = ""
}
function getCInfo(zipcode, silent, ind){
        $.get({
    	url: 'https://search.onboard-apis.com/communityapi/v2.0.0/Area/Full/?', 
    	data: {'AreaID': 'ZI' + zipcode, 'SearchDistance' : '5', 'RecordLimit': '10'},
    	headers: {'ApiKey': '4c6c63780ff1a86c602012fc5c647cce', 'Accept': 'application/json'},
    	success: function(data){
    		if(!silent) cinfo = data["response"]["result"]["package"]["item"][0]
    		console.log(data)
    		if(!silent) showAgeStats();
    		else markers[ind]["cinfo"] = data["response"]["result"]["package"]["item"][0]
    		//showHealthStats()
    	},
    	error: function(data){
    		console.log(data)
    	}
    });
}
initMap()

