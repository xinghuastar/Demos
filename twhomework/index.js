window['DOMLIB'] = {};
function addEvent( node, type, listener ) {
    if (node.addEventListener) {
        // W3C method
        node.addEventListener( type, listener, false );
        return true;
    } else if(node.attachEvent) {
        // MSIE method
        node['e'+type+listener] = listener;
        node[type+listener] = function(){node['e'+type+listener]( window.event );}
        node.attachEvent( 'on'+type, node[type+listener] );
        return true;
    }
    
    // Didn't have either so return false
    return false;
};
window['DOMLIB']['addEvent'] = addEvent;
function removeEvent(node, type, listener ) {
    if (node.removeEventListener) {
        node.removeEventListener( type, listener, false );
        return true;
    } else if (node.detachEvent) {
        // MSIE method
        node.detachEvent( 'on'+type, node[type+listener] );
        node[type+listener] = null;
        return true;
    }
    // Didn't have either so return false
    return false;
};
window['DOMLIB']['removeEvent'] = removeEvent;
function getRequestObject(url,options) {
    
    // Initialize the request object
    var req = false;
    if(window.XMLHttpRequest) {
        var req = new window.XMLHttpRequest();
    } else if (window.ActiveXObject) {
        var req = new window.ActiveXObject('Microsoft.XMLHTTP');
    }
    if(!req) return false;
    
    // Define the default options
    options = options || {};
    options.method = options.method || 'GET';
    options.send = options.send || null;

    // Define the various listeners for each state of the request
    req.onreadystatechange = function() {
        switch (req.readyState) {
            case 1:
                // Loading
                if(options.loadListener) {
                    options.loadListener.apply(req,arguments);
                }
                break;
            case 2:
                // Loaded
                if(options.loadedListener) {
                    options.loadedListener.apply(req,arguments);
                }
                break;
            case 3:
                // Interactive
                if(options.ineractiveListener) {
                    options.ineractiveListener.apply(req,arguments);
                }
                break;
            case 4:
                // Complete
                // if aborted FF throws errors
                try { 
                if (req.status && req.status == 200) {
                    
                    // Specific listeners for content-type
                    // The Content-Type header can include the charset:
                    // Content-Type: text/html; charset=ISO-8859-4
                    // So we'll use a match to extract the part we need.
                    var contentType = req.getResponseHeader('Content-Type');
                    var mimeType = contentType.match(/\s*([^;]+)\s*(;|$)/i)[1];
                                        
                    switch(mimeType) {
                        case 'text/javascript':
                        case 'application/javascript':
                            // The response is JavaScript so use the 
                            // req.responseText as the argument to the callback
                            if(options.jsResponseListener) {
                                options.jsResponseListener.call(
                                    req,
                                    req.responseText
                                );
                            }
                            break;
                        case 'application/json':
                            // The response is json so parse   
                            // req.responseText using the an anonymous functions
                            // which simply returns the JSON object for the
                            // argument to the callback
                            if(options.jsonResponseListener) {
                                try {
                                    var json = parseJSON(
                                        req.responseText
                                    );
                                } catch(e) {
                                    var json = false;
                                }
                                options.jsonResponseListener.call(
                                    req,
                                    json
                                );
                            }
                            break;
                        case 'text/xml':
                        case 'application/xml':
                        case 'application/xhtml+xml':
                            // The response is XML so use the 
                            // req.responseXML as the argument to the callback
                            // This will be a Document object
                            if(options.xmlResponseListener) {
                                options.xmlResponseListener.call(
                                    req,
                                    req.responseXML
                                );
                            }
                            break;
                        case 'text/html':
                            // The response is HTML so use the 
                            // req.responseText as the argument to the callback
                            if(options.htmlResponseListener) {
                                options.htmlResponseListener.call(
                                    req,
                                    req.responseText
                                );
                            }
                            break;
                    }
                
                    // A complete listener
                    if(options.completeListener) {
                        options.completeListener.apply(req,arguments);
                    }

                } else {
                    // Response completed but there was an error
                    if(options.errorListener) {
                        options.errorListener.apply(req,arguments);
                    }
                }
                

                } catch(e) {
                    //ignore errors
                    //alert('Response Error: ' + e);
                }
                break;
        }
    };
    // Open the request
    req.open(options.method, url, true);
    // Add a special header to identify the requests
    req.setRequestHeader('X-ADS-Ajax-Request','AjaxRequest');
    return req;
}
window['DOMLIB']['getRequestObject'] = getRequestObject;

/**
 * send an XMLHttpRequest using a quick wrapper around the
 * getRequestObject and the send method. 
 */
function ajaxRequest(url,options) {
    var req = getRequestObject(url,options);
    return req.send(options.send);
}
window['DOMLIB']['ajaxRequest'] = ajaxRequest;

function Cruise(){

}
var cruise = (function(){

	return {
		init: function(){
			var nav = document.querySelector('.sideBar .nav');
		var agentMenu = nav.querySelector('li:nth-child(2)');
		agentMenu.focus();
		this.render();
		addEvent(nav,'click',function(){
			var target = event.target;

			cruise.render(target.id)
		});
	},
	render:function(type){
		var container = document.getElementById("mainContent");
		//get data
		ajaxRequest('./data/histories.json',{'method':'get','send':null,'jsonResponseListener':function(json){
             console.log(json);
		}});
		//console.log(res);

	}
	}
})();

cruise.init();
