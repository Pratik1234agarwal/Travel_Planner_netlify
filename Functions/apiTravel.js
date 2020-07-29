
const axios = require('axios');


let images = [];

let apiData = {
  lat:0,
  long:0,
  countryName:"",
  countryCode : "",
  cityName:"",
  risk:"",
  riskScore:"",
  icon:"",
  weather:[],
  images:[],
  countryDetails:{}
}

apiData.countryName = "India";

exports.handler = async function(event,context,callback){

	const {KEY_GEONAMES,KEY_PIXABAY,KEY_WEATHERBIT} = process.env;

	const send  = body =>(
        callback(null,{
            statusCode:200,
            headers:{
                'Access-Control-Allow-Origin':'*',
                'Access-Control-Allow-Headers':'Origin,X-Requested-With,Content-Type,Accept'

            },
            body:JSON.stringify(body)
        })
    )


    if(event.httpMethod === 'POST'){
    	const city = JSON.parse(event.body).city;
    	apiData.cityName = city;
	    console.log("Request Received for city :: "+city);
		  try{
		  	console.log("3","TESTING ..... ");
		  	console.log("4",fetch);
		    let request = await axios(`http://api.geonames.org/searchJSON?q=${city}&maxRows=1&username=${KEY_GEONAMES}`);
		    let data1 = request.data
		    console.log("2","TESTING ......")
		    let lat = data1.geonames[0].lat;
		    let long = data1.geonames[0].lng;
		    apiData.lat = lat;
		    apiData.long = long;
		    apiData.countryName = data1.geonames[0].countryName;

		    request = await axios(`https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${long}&key=${KEY_WEATHERBIT}`);
		    let data2 = request.data
		    apiData.weather = filterWeather(data2.data);

		    const code = data2.country_code;
		    apiData.countryCode = code;
		    console.log("1","TESTING ............");

		    request = await axios(`https://www.travel-advisory.info/api?countrycode=${code}`);
		    let data3 = request.data
		    apiData.risk = data3.data[code];
		    apiData.riskScore = data3.data[code].advisory.score;

		    request = await axios(`https://pixabay.com/api/?key=${KEY_PIXABAY}&q=${city}&category=travel`);
		    let data4 = request.data
		    if(data4.hits.length === 0){
		      request = await axios(`https://pixabay.com/api/?key=${KEY_PIXABAY}&q=${apiData.countryName}&category=travel`);
		      data4 = request.data
		    }
		    apiData.images = filterImages(data4.hits);

		    request = await axios(`https://restcountries.eu/rest/v2/alpha/${code}`);
		    let data5 = request.data
		    apiData.countryDetails = setCountryDetails(data5);
		    send(apiData);
		}catch(error){
		  console.log("Error",error);
		  send({message:"there is some error"});
		}
	}
}

// helper functions 



function setCountryDetails(data5){
    countryDetails = {};
    countryDetails.currency = data5.currencies[0];
    countryDetails.population = data5.population;
    countryDetails.capital = data5.capital;
    countryDetails.callingCode = data5.callingCodes[0];
    countryDetails.languages = data5.languages[0];
    countryDetails.flag = data5.flag;

    return countryDetails;
}


/* This filters the pixibay api result */
function filterImages(data){
  filter = [];
    if(data.length==0){
      return [];
    }
    else{
      for(let i=0;i<data.length && i<=4 ;i++){
        filter.push(data[i].largeImageURL);
      }
    }
  return filter
}

/* This filters the data to be send */
function filterWeather(data){
  filter=[];
  daily = {};
  for(let i=0;i<data.length;i++){
      daily.max_temp = data[i].max_temp;
      daily.min_temp = data[i].min_temp;
      daily.app_min_temp = data[i].app_min_temp;
      daily.app_max_temp = data[i].app_max_temp;
      daily.date = data[i].valid_date;
      daily.weather = data[i].weather;
      filter.push(daily);
      daily={};
  }
  return filter;
}