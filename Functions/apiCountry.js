const axios = require('axios');
let apiData = {};

exports.handler = async function(event,context,callback){

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

    if(event.httpMethod==='POST'){
    	console.log(apiData);
    	const code = JSON.parse(event.body).country;
    	let request = await axios(`https://restcountries.eu/rest/v2/alpha/${code}`);
	    let data5 = request.data
	    apiData.countryDetails = setCountryDetails(data5);
	    

	    request = await axios(`https://www.travel-advisory.info/api?countrycode=${code}`);
	    let data3 = request.data
	    apiData.risk = data3.data[code];
	    apiData.riskScore = data3.data[code].advisory.score;

	    send(apiData);
    }
}


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