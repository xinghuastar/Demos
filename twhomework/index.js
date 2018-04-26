window['DOMLIB'] = {};

function addEvent(node, type, listener) {
    if (node.addEventListener) {
        // W3C method
        node.addEventListener(type, listener, false);
        return true;
    } else if (node.attachEvent) {
        // MSIE method
        node['e' + type + listener] = listener;
        node[type + listener] = function() { node['e' + type + listener](window.event); }
        node.attachEvent('on' + type, node[type + listener]);
        return true;
    }

    // Didn't have either so return false
    return false;
};
window['DOMLIB']['addEvent'] = addEvent;

function removeEvent(node, type, listener) {
    if (node.removeEventListener) {
        node.removeEventListener(type, listener, false);
        return true;
    } else if (node.detachEvent) {
        // MSIE method
        node.detachEvent('on' + type, node[type + listener]);
        node[type + listener] = null;
        return true;
    }
    // Didn't have either so return false
    return false;
};
window['DOMLIB']['removeEvent'] = removeEvent;

function getRequestObject(url, options) {

    // Initialize the request object
    var req = false;
    if (window.XMLHttpRequest) {
        var req = new window.XMLHttpRequest();
    } else if (window.ActiveXObject) {
        var req = new window.ActiveXObject('Microsoft.XMLHTTP');
    }
    if (!req) return false;

    // Define the default options
    options = options || {};
    options.method = options.method || 'GET';
    options.send = options.send || null;

    // Define the various listeners for each state of the request
    req.onreadystatechange = function() {
        switch (req.readyState) {
            case 1:
                // Loading
                if (options.loadListener) {
                    options.loadListener.apply(req, arguments);
                }
                break;
            case 2:
                // Loaded
                if (options.loadedListener) {
                    options.loadedListener.apply(req, arguments);
                }
                break;
            case 3:
                // Interactive
                if (options.ineractiveListener) {
                    options.ineractiveListener.apply(req, arguments);
                }
                break;
            case 4:
                // Complete
                // if aborted FF throws errors
                try {
                	console.log("status:"+status);
                    if ((req.status && req.status == 200) || (!req.status && req.responseText)) {
                        if (options.jsonResponseListener) {
                            try {
                                var json = JSON.parse(req.responseText);
                            } catch (e) {
                                var json = false;
                            }
                            options.jsonResponseListener.call(
                                req,
                                json
                            );
                        }

                        // A complete listener
                        if (options.completeListener) {
                            options.completeListener.apply(req, arguments);
                        }

                    } else {
                        // Response completed but there was an error
                        if (options.errorListener) {
                            options.errorListener.apply(req, arguments);
                        }
                    }



                } catch (e) {
                    
                  console.log("exe error");
                }
                break;
        }
    };
    // Open the request
    req.open(options.method, url, true);
    // Add a special header to identify the requests
    req.setRequestHeader('X-ADS-Ajax-Request', 'AjaxRequest');
    return req;
}
window['DOMLIB']['getRequestObject'] = getRequestObject;

/**
 * send an XMLHttpRequest using a quick wrapper around the
 * getRequestObject and the send method. 
 */
function ajaxRequest(url, options) {
    var req = getRequestObject(url, options);
    return req.send(options.send);
}
window['DOMLIB']['ajaxRequest'] = ajaxRequest;


var template_header  = '';
    template_navbar ='';
template_header = template_header  + '<div class="header">' +
    '<div class="area-wrap">' +
    '<div class="building-area">' +
    '<span class="type">Building</span>' +
    '<span class="icon-cog"></span>' +
    ' <span class="count">{{numOfBuilding}}</span>' +
    '</div>' +
    '</div>' +
    '<div class="area-wrap">' +
    '<div class="idle-area">' +
    '<span class="type">Idle</span>' +
    '<span class="icon-coffee"></span>' +
    '<span class="count">{{numOfIdle}}</span>' +
    '</div>' +
    '</div>' +
    '<div class="area-wrap">' +
    '<div class="badge-area">' +
    '<ul class="badgeList">' +
    '<li class="badgeItem">' +
    '<div class="badgeName">ALL</div>' +
    '<div class="badgeCount">{{total}}</div>' +
    '</li>' +
    '<li class="badgeItem">' +
    '<div class="badgeName">PHYSICAL</div>' +
    '<div class="badgeCount">{{numOfPhysical}}</div>' +
    '</li>' +
    '<li class="badgeItem">' +
    '<div class="badgeName">VERTUAL</div>' +
    '<div class="badgeCount">{{numOfVertual}}</div>' +
    '</li>' +
    '</ul>' +
    '</div>' +
    '</div>' +
    '</div>';

    template_navbar = template_navbar +  '<div class="navbarWrapper"><div class="navbar">'
        +'<ul class="nav">'
           +' <li class="item "><a class="active" href="#">All</a></li>'
            +'<li class="item"><a href="#">Physical</a></li>'
            +'<li class="item"><a href="#">Virtual</a></li>'
        +'</ul>'
        +'<div class="search-area">'
            +'<span class="icon-search"></span>'
            +'<input type="text" name="">'
        +'</div>'
        +'<div class="menus">'
            +'<span class="menu icon-th-card"></span>'
            +'<span class="menu icon-th-list"></span>'
        +'</div>'
    +'</div></div>';

function Cruise() {

}
var cruise = (function() {
    var container = document.getElementById("mainContent");
    return {
        container: container,
        init: function() {

            var nav = document.querySelector('.sideBar .nav');
            var agentMenu = nav.querySelector('li:nth-child(2)');
            agentMenu.focus();
            this.render('agent');
            addEvent(nav, 'click', function() {
                var target = event.target;

                cruise.render(target.id)
            });
        },
        render: function(type) {

            var url = "";
            //get data
            switch (type) {
                case "agent":
                    url = './data/resources.json';
                    break;
            }
            ajaxRequest(url, {
                'method': 'get',
                'send': null,
                'jsonResponseListener': function(json) {
                    console.log(json);
                    cruise.renderAgentArea(json);
                }
            });
            //console.log(res);
        },
        renderAgentArea: function(data) {
           // var res = data.res;
            var html = '';
            //header
            template_header = template_header.replace('{{numOfBuilding}}', data.numOfBuilding);
            template_header = template_header.replace('{{numOfIdle}}', data.numOfIdle);
            template_header = template_header.replace('{{total}}', data.total);
            template_header = template_header.replace('{{numOfPhysical}}', data.numOfPhysical);
            template_header = template_header.replace('{{numOfVertual}}', data.numOfVertual);
            html = html + template_header + template_navbar + this.renderResList(data.res);
            //navbar 
            this.container.innerHTML = html;
        },
        renderResList: function(res){
        	var html = ' <div class="listWrapper"><ul class="list">';
        	for(var i=0, len = res.length; i<len; i++){
        		html = html+ '<li class="item">'
                +'<div class="logo"></div>'
                +'<div class="detail">'
                    +'<ul class="infolist">'
                        +'<li><span class="icon-desktop"></span><span>bjstdmngbgr02.thoughtworks.com</span></li>'
                        +'<li><span>building</span></li>'
                        +'<li><span class="icon-info"></span><span>192.168.1.243</span></li>'
                        +'<li><span class="icon-folder"></span><span>/dd/dd/dffff/dd</span></li>'
                    +'</ul>'
                    +'<ul class="platformlist">'
                        +'<li class="add"><span class="icon-plus"></span></li>'
                        +'<li><span>Firefox</span><span class="icon-trash"></span></li>'
                        +'<li><span>Safari</span><span class="icon-trash"></span></li>'
                        +'<li><span>Ubuntu</span><span class="icon-trash"></span></li>'
                        +'<li><span>Chrome</span><span class="icon-trash"></span></li>'
                    +'</ul>'
                    +'<div class="deny"><span class="icon-deny"></span><span>Deny</span></div>'
                +'</div></li>'
        	}
        	html = html + "</ul></div>"
        	return html;

        }

    }
})();

cruise.init();
