var app;
var gcp_price_url = "https://cloudpricingcalculator.appspot.com/static/data/pricelist.json";

function init() {
  app = SpreadsheetApp.getActiveSpreadsheet();
}

function getGcpPrice() {
  var response = UrlFetchApp.fetch(gcp_price_url, {method: "GET"});
  var vo = JSON.parse(response);
  return vo;
}

function isNewVersion(vo) {
  var sheet = app.getSheetByName("Change Log");
  var rows = sheet.getDataRange();
  var lastRow = rows.getValues()[rows.getNumRows()-1];
  
  if(lastRow && lastRow[0] != vo.version ) {
    Logger.log('Find New Version... ');
    Logger.log('Compare version old: %s vs. new: %s', lastRow[0], vo.version);
    return true;
  } else {
    Logger.log('Find OLD Version... ');
    return false;
  }
}

function writeLog(vo) {
  var isNew = isNewVersion(vo);
  var sheet = app.getSheetByName("Change Log");
  var rows = sheet.getDataRange();
  var lastVerVo = JSON.parse(rows.getValues()[rows.getNumRows()-1][2]);
  
  if(isNew) {
    Logger.log("Pricing is CHANGED...");
    
    var diffVo = diffVersion(vo['gcp_price_list'], lastVerVo);
    
    var htmlout = 'Dears<br/><br/>GCP產品已有調整，您可以查看最新單價表確認!<br/><br/>'+
      layoutBody(diffVo)+'<br/><br/>'+
      'PS: The data is generate from: ' + gcp_price_url + '<br/><br/>' + 
      'Send by GCPUG.TW @ Apps Script.';
    
    sheet.appendRow([vo.version, vo.updated, JSON.stringify(vo.gcp_price_list)]);
    //Send mail to registers
    groupEmail(htmlout);
  } else {
    Logger.log("Pricing is nothing change...");
  }
}

function getNotifyList(){
  var app = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = app.getSheetByName("Form Responses 1");
  var rows = sheet.getDataRange();
  var namelist = [];
  for(var i = 1 ; i < rows.getLastRow() ; i++) {
    namelist.push({
      name: rows.getValues()[i][1],
      mail: rows.getValues()[i][2]
    }) ;
  }
  return namelist;
}

function groupEmail(body) {
  var opts = {
    from: 'simonsu@mitac.com.tw',
    htmlBody: body
  };
  var maillist = getNotifyList();
  maillist.forEach(function(v){
    GmailApp.sendEmail(v.mail, 'GCP產品價格異動通知', body, opts);   
  });  
}

function layoutBody(out) {
  //out = {"CP-COMPUTEENGINE-VMIMAGE-F1-MICRO":{"new":{"us":0.008,"europe":0.009,"asia":0.009,"cores":"shared","memory":"0.6","ssd":[0]},"old":{"us":0.008,"europe":0.009,"asia":0.009,"cores":"shared","memory":"0.8","ssd":[0]}},"CP-BIGTABLE-HDD":{"new":{"us":0.026},"old":{"us":0.024}}}; 
  
  var keys = Object.keys(out);
  var html = '<table border=1 width=98%><tr><td>Item</td><td>New Price</td><td>Old Price</td></tr>';
  if(out)
  for(var i = 0 ; i < keys.length ; i++) {
    var key = keys[i];
    
    html = html + '<tr><td>' + key + '</td><td>' + parseJson2List(out[key]['new']) + '</td><td>' + parseJson2List(out[key]['old']) + '</td></tr>';
  }
  html += '</table>';
  
  //Logger.log(html);
  return html;
}

function diffVersion(vo, oldvo) {
  /* For test:
  vo = {"sustained_use_base":0.25,
        "sustained_use_tiers":{"0.25":1,"0.50":0.8,"0.75":0.6,"1":0.4},
        "CP-COMPUTEENGINE-VMIMAGE-F1-MICRO":{"us":0.008,"europe":0.009,"asia":0.009,"cores":"shared","memory":"0.6","ssd":[0]},"CP-COMPUTEENGINE-VMIMAGE-G1-SMALL":{"us":0.027,"europe":0.03,"asia":0.03,"cores":"shared","memory":"1.7","ssd":[0]},"CP-COMPUTEENGINE-VMIMAGE-N1-STANDARD-1":{"us":0.05,"europe":0.055,"asia":0.055,"cores":"1","memory":"3.75","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-N1-STANDARD-2":{"us":0.1,"europe":0.11,"asia":0.11,"cores":"2","memory":"7.5","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-N1-STANDARD-4":{"us":0.2,"europe":0.22,"asia":0.22,"cores":"4","memory":"15","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-N1-STANDARD-8":{"us":0.4,"europe":0.44,"asia":0.44,"cores":"8","memory":"30","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-N1-STANDARD-16":{"us":0.8,"europe":0.88,"asia":0.88,"cores":"16","memory":"60","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-N1-STANDARD-32":{"us":1.6,"europe":1.76,"asia":1.76,"cores":"32","memory":"120","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-N1-HIGHMEM-2":{"us":0.126,"europe":0.139,"asia":0.139,"cores":"2","memory":"13","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-N1-HIGHMEM-4":{"us":0.252,"europe":0.278,"asia":0.278,"cores":"4","memory":"26","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-N1-HIGHMEM-8":{"us":0.504,"europe":0.556,"asia":0.556,"cores":"8","memory":"52","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-N1-HIGHMEM-16":{"us":1.008,"europe":1.112,"asia":1.112,"cores":"16","memory":"104","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-N1-HIGHMEM-32":{"us":2.016,"europe":2.224,"asia":2.224,"cores":"32","memory":"208","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-N1-HIGHCPU-2":{"us":0.076,"europe":0.084,"asia":0.084,"cores":"2","memory":"1.8","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-N1-HIGHCPU-4":{"us":0.152,"europe":0.168,"asia":0.168,"cores":"4","memory":"3.6","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-N1-HIGHCPU-8":{"us":0.304,"europe":0.336,"asia":0.336,"cores":"8","memory":"7.2","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-N1-HIGHCPU-16":{"us":0.608,"europe":0.672,"asia":0.672,"cores":"16","memory":"14.40","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-N1-HIGHCPU-32":{"us":1.216,"europe":1.344,"asia":1.344,"cores":"32","memory":"28.80","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-F1-MICRO-PREEMPTIBLE":{"us":0.005,"europe":0.005,"asia":0.005,"cores":"shared","memory":"0.6","ssd":[0]},"CP-COMPUTEENGINE-VMIMAGE-G1-SMALL-PREEMPTIBLE":{"us":0.01,"europe":0.01,"asia":0.01,"cores":"shared","memory":"1.7","ssd":[0]},"CP-COMPUTEENGINE-VMIMAGE-N1-STANDARD-1-PREEMPTIBLE":{"us":0.015,"europe":0.0165,"asia":0.0165,"cores":"1","memory":"3.75","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-N1-STANDARD-2-PREEMPTIBLE":{"us":0.03,"europe":0.033,"asia":0.033,"cores":"2","memory":"7.5","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-N1-STANDARD-4-PREEMPTIBLE":{"us":0.06,"europe":0.066,"asia":0.066,"cores":"4","memory":"15","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-N1-STANDARD-8-PREEMPTIBLE":{"us":0.12,"europe":0.132,"asia":0.132,"cores":"8","memory":"30","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-N1-STANDARD-16-PREEMPTIBLE":{"us":0.24,"europe":0.264,"asia":0.264,"cores":"16","memory":"60","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-N1-STANDARD-32-PREEMPTIBLE":{"us":0.48,"europe":0.528,"asia":0.528,"cores":"32","memory":"120","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-N1-HIGHMEM-2-PREEMPTIBLE":{"us":0.035,"europe":0.0385,"asia":0.0385,"cores":"2","memory":"13","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-N1-HIGHMEM-4-PREEMPTIBLE":{"us":0.07,"europe":0.077,"asia":0.077,"cores":"4","memory":"26","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-N1-HIGHMEM-8-PREEMPTIBLE":{"us":0.14,"europe":0.154,"asia":0.154,"cores":"8","memory":"52","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-N1-HIGHMEM-16-PREEMPTIBLE":{"us":0.28,"europe":0.308,"asia":0.308,"cores":"16","memory":"104","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-N1-HIGHMEM-32-PREEMPTIBLE":{"us":0.56,"europe":0.616,"asia":0.616,"cores":"32","memory":"208","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-N1-HIGHCPU-2-PREEMPTIBLE":{"us":0.02,"europe":0.022,"asia":0.022,"cores":"2","memory":"1.8","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-N1-HIGHCPU-4-PREEMPTIBLE":{"us":0.04,"europe":0.044,"asia":0.044,"cores":"4","memory":"3.6","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-N1-HIGHCPU-8-PREEMPTIBLE":{"us":0.08,"europe":0.088,"asia":0.088,"cores":"8","memory":"7.2","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-N1-HIGHCPU-16-PREEMPTIBLE":{"us":0.16,"europe":0.176,"asia":0.176,"cores":"16","memory":"14.40","ssd":[0,1,2,3,4]},"CP-COMPUTEENGINE-VMIMAGE-N1-HIGHCPU-32-PREEMPTIBLE":{"us":0.32,"europe":0.352,"asia":0.352,"cores":"32","memory":"28.80","ssd":[0,1,2,3,4]},
        "CP-COMPUTEENGINE-LOCAL-SSD":{"us":0.0003},
        "CP-COMPUTEENGINE-OS":{"win":{"low":0.02,"high":0.04,"cores":"shared","percore":true},"rhel":{"low":0.06,"high":0.13,"cores":"8","percore":false},"suse":{"low":0.02,"high":0.11,"cores":"shared","percore":false}},
        "CP-COMPUTEENGINE-STORAGE-PD-CAPACITY":{"us":0.04},"CP-COMPUTEENGINE-STORAGE-PD-SSD":{"us":0.17},"CP-COMPUTEENGINE-PD-IO-REQUEST":{"us":0},"CP-COMPUTEENGINE-STORAGE-PD-SNAPSHOT":{"us":0.026},"CP-BIGSTORE-CLASS-A-REQUEST":{"us":0.01},"CP-BIGSTORE-CLASS-B-REQUEST":{"us":0.01},"CP-CLOUDSQL-PERUSE-D0":{"us":0.025},"CP-CLOUDSQL-PERUSE-D1":{"us":0.1},"CP-CLOUDSQL-PERUSE-D2":{"us":0.19},"CP-CLOUDSQL-PERUSE-D4":{"us":0.285},"CP-CLOUDSQL-PERUSE-D8":{"us":0.5775},"CP-CLOUDSQL-PERUSE-D16":{"us":1.155},"CP-CLOUDSQL-PERUSE-D32":{"us":2.31},"CP-CLOUDSQL-PACKAGE-D0":{"us":0.36},"CP-CLOUDSQL-PACKAGE-D1":{"us":1.46},"CP-CLOUDSQL-PACKAGE-D2":{"us":2.93},"CP-CLOUDSQL-PACKAGE-D4":{"us":4.395},"CP-CLOUDSQL-PACKAGE-D8":{"us":8.7825},"CP-CLOUDSQL-PACKAGE-D16":{"us":17.565},"CP-CLOUDSQL-PACKAGE-D32":{"us":35.13},"CP-CLOUDSQL-STORAGE":{"us":0.24},"CP-CLOUDSQL-TRAFFIC":{"us":0.12},"CP-CLOUDSQL-IO":{"us":0.1},"CP-BIGSTORE-STORAGE":{"us":0.026},"CP-BIGSTORE-STORAGE-DRA":{"us":0.02},"CP-NEARLINE-STORAGE":{"us":0.01},"CP-NEARLINE-RESTORE-SIZE":{"us":0.01},"FORWARDING_RULE_CHARGE_BASE":{"us":0.025,"fixed":true},"FORWARDING_RULE_CHARGE_EXTRA":{"us":0.01},"NETWORK_LOAD_BALANCED_INGRESS":{"us":0.008},
        "CP-COMPUTEENGINE-INTERNET-EGRESS-NA-NA":{"tiers":{"1024":0.12,"10240":0.11,"92160":0.08}},"CP-COMPUTEENGINE-INTERNET-EGRESS-APAC-APAC":{"tiers":{"1024":0.12,"10240":0.11,"92160":0.08}},"CP-COMPUTEENGINE-INTERNET-EGRESS-AU-AU":{"tiers":{"1024":0.19,"10240":0.18,"92160":0.15}},"CP-COMPUTEENGINE-INTERNET-EGRESS-CN-CN":{"tiers":{"1024":0.21,"10240":0.18,"92160":0.15}},"CP-COMPUTEENGINE-INTERCONNECT-US-US":{"us":0.04},"CP-COMPUTEENGINE-INTERCONNECT-EU-EU":{"us":0.05},"CP-COMPUTEENGINE-INTERCONNECT-APAC-APAC":{"us":0.06},"CP-COMPUTEENGINE-INTERNET-EGRESS-ZONE":{"us":0.01},"CP-COMPUTEENGINE-INTERNET-EGRESS-REGION":{"us":0.01},"CP-APP-ENGINE-INSTANCES":{"us":0.05,"freequota":{"quantity":28}},"CP-APP-ENGINE-OUTGOING-TRAFFIC":{"us":0.12,"freequota":{"quantity":1}},"CP-APP-ENGINE-CLOUD-STORAGE":{"us":0.026,"freequota":{"quantity":5}},"CP-APP-ENGINE-MEMCACHE":{"us":0.06},"CP-APP-ENGINE-SEARCH":{"us":0.00005,"freequota":{"quantity":100}},"CP-APP-ENGINE-INDEXING-DOCUMENTS":{"us":2,"freequota":{"quantity":0.01}},"CP-APP-ENGINE-DOCUMENT-STORAGE":{"us":0.18,"freequota":{"quantity":0.25}},"CP-APP-ENGINE-LOGS-API":{"us":0.12,"freequota":{"quantity":0.1}},"CP-APP-ENGINE-TASK-QUEUE":{"us":0.026,"freequota":{"quantity":5}},"CP-APP-ENGINE-LOGS-STORAGE":{"us":0.026,"freequota":{"quantity":1}},"CP-APP-ENGINE-SSL-VIRTUAL-IP":{"us":39},"CP-CLOUD-DATASTORE-INSTANCES":{"us":0.18,"freequota":{"quantity":1}},"CP-CLOUD-DATASTORE-WRITE-OP":{"us":6e-7,"freequota":{"quantity":0.5}},"CP-CLOUD-DATASTORE-READ-OP":{"us":6e-7,"freequota":{"quantity":0.5}},"CP-BIGQUERY-GENERAL":{"storage":{"us":0.02},"interactiveQueries":{"us":5,"freequota":{"quantity":1}},"batchQueries":{"us":5,"freequota":{"quantity":1}},"streamingInserts":{"us":1e-7}},"CP-CLOUD-DNS-ZONES":{"tiers":{"25":0.2,"100":0.1}},"CP-CLOUD-DNS-QUERIES":{"tiers":{"1000000000":4e-7,"10000000000":2e-7}},"CP-TRANSLATE-API-TRANSLATION":{"us":0.00002},"CP-TRANSLATE-API-DETECTION":{"us":0.00002},"CP-PREDICTION-PREDICTION":{"tiers":{"10000":0,"100000":0.0005}},"CP-PREDICTION-BULK-TRAINING":{"us":0.002},"CP-PREDICTION-STREAMING-TRAINING":{"tiers":{"10000":0,"100000":0.00005}},"CP-GENOMICS-STORAGE":{"us":0.022},"CP-GENOMICS-QUERIES":{"us":1},"CP-DATAFLOW-BATCH":{"us":0.01},"CP-DATAFLOW-STREAMING":{"us":0.015},"CP-BIGTABLE-NODES":{"us":0.65},"CP-BIGTABLE-SSD":{"us":0.17},"CP-BIGTABLE-HDD":{"us":0.026}};
  */
  var keys = Object.keys(vo);
  var outArr = {};
  for(var i = 0 ; i < keys.length ; i++) {
    var key = keys[i];
    if(JSON.stringify(vo[key]) != JSON.stringify(oldvo[key])) {
      Logger.log("Find difference at key:%s", key);
      Logger.log("%s  ::  %s", vo[key], oldvo[key]);
      outArr[key] = {};
      outArr[key]['new'] = (vo[key]);
      outArr[key]['old'] = (oldvo[key]);
    }
  }
  return outArr;
}

function parseJson2List(vo) {
  Logger.log("type:" + typeof(vo));
  Logger.log("vo:" + vo);
  if(typeof(vo) != 'object')
    return vo;
  
  var html = '<ul>';

  Object.keys(vo).forEach(function(key,i) {
    var value = vo[key];
    
    if(typeof(value) == 'object') {
      Logger.log("find nested object:" + JSON.stringify(value));
      value = parseJson2List(value);
      html += '<li>' + key + ':' + value + '</li></ul>';
    } else {
      value = JSON.stringify(value);
      html += '<li>' + key + ':' + value + '</li>';
    }
    
    
  });
  
  html + '</ul>';
  return html;
}

function run() {
  this.init();
  writeLog(getGcpPrice());
}

function test(){
  var  vo = {
    aaa : {"us":0.008,"europe":0.009,"asia":0.009,"cores":"shared","memory":"0.6","ssd":[0]},
    bbb : {"us":0.008,"europe":0.009,"asia":0.009,"cores":"shared","memory":"0.6","ssd":[0]}
  };
  Logger.log(parseJson2List(vo));
}
